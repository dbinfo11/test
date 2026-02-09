from fastapi import FastAPI, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://fapi.binance.com"

# 지인 공유용 안전장치
CACHE_TTL_SEC = 90          # 같은 threshold 결과 90초 캐시
COOLDOWN_PER_IP_SEC = 10    # 같은 IP는 10초 쿨타임

app = FastAPI()

# 간단 인메모리 캐시/쿨다운
_cache = {}        # key: threshold_str -> {"ts": float, "data": list}
_last_call = {}    # key: ip -> ts

HTML = """
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Binance 15m Vol Scanner</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body { font-family: Arial, sans-serif; margin: 18px; }
    .row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
    input, button { padding: 10px; font-size: 15px; }
    button { cursor:pointer; }
    table { border-collapse: collapse; width: 100%; margin-top: 14px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background: #f5f5f5; position: sticky; top: 0; }
    #status { margin-top: 10px; color: #333; white-space: pre-wrap; }
    .small { color:#666; font-size: 13px; margin-top: 6px; }
  </style>
</head>
<body>
  <h2>바이낸스 선물 15분 변동성 탐지기 (웹)</h2>

  <div class="row">
    <label>최소 변동성(%):</label>
    <input id="vol" value="3.0" inputmode="decimal" />
    <button onclick="scan()">스캔</button>
  </div>

  <div id="status">대기 중...</div>
  <div class="small">※ 결과는 약 90초 캐시됩니다. 같은 IP는 10초 쿨타임.</div>

  <table>
    <thead>
      <tr>
        <th>종목</th>
        <th>봉</th>
        <th>현재가</th>
        <th>고 / 저</th>
        <th>변동성</th>
        <th>등락률</th>
      </tr>
    </thead>
    <tbody id="rows"></tbody>
  </table>

<script>
async function scan(){
  const vol = document.getElementById("vol").value.trim();
  const status = document.getElementById("status");
  const tbody = document.getElementById("rows");

  tbody.innerHTML = "";
  const t0 = Date.now();
  status.innerText = "스캔 중... (최대 10~30초 소요될 수 있음)";

  try {
    const res = await fetch(`/scan?threshold=${encodeURIComponent(vol)}`);
    const text = await res.text();

    let data = null;
    try { data = JSON.parse(text); } catch(e) { data = null; }

    if(!res.ok){
      if (data) {
        status.innerText = "오류: " + JSON.stringify(data, null, 2);
      } else {
        status.innerText = "오류: " + text;
      }
      return;
    }

    const t1 = Date.now();
    status.innerText = `완료: ${data.length}개 (소요 ${(t1 - t0) / 1000}s)`;

    for(const r of data){
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.symbol}</td>
        <td>${r.candle}</td>
        <td>${r.price}</td>
        <td>${r.range}</td>
        <td>${r.volatility}</td>
        <td>${r.change}</td>
      `;
      tbody.appendChild(tr);
    }
  } catch (e) {
    status.innerText = "네트워크 오류: " + e;
  }
}
</script>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
def home():
    return HTML


def get_json(url, timeout=10):
    # Render 같은 환경에서 봇차단/응답 차이를 줄이기 위해 UA 추가
    headers = {"User-Agent": "Mozilla/5.0 (BinanceVolScanner)"}
    try:
        r = requests.get(url, timeout=timeout, headers=headers)
    except Exception as e:
        return 0, {"error": f"request_exception: {repr(e)}"}

    try:
        return r.status_code, r.json()
    except Exception:
        # JSON이 아니면 text라도 반환
        return r.status_code, {"error": f"non_json_response: {r.text[:300]}", "status_code": r.status_code}


def calc_from_candle(c):
    # [openTime, open, high, low, close, ...]
    o = float(c[1])
    h = float(c[2])
    l = float(c[3])
    cl = float(c[4])
    if o <= 0 or l <= 0:
        return None
    vol = (h - l) / l * 100
    chg = (cl - o) / o * 100
    return h, l, cl, vol, chg


def check_symbol(symbol, threshold):
    url = f"{BASE_URL}/fapi/v1/klines?symbol={symbol}&interval=15m&limit=2"
    _, data = get_json(url, timeout=6)
    if not isinstance(data, list) or len(data) < 2:
        return None

    prev_c = data[0]
    curr_c = data[1]

    for label, candle in (("현재", curr_c), ("이전", prev_c)):
        r = calc_from_candle(candle)
        if not r:
            continue
        h, l, cl, vol, chg = r
        if vol >= threshold:
            return {
                "symbol": symbol,
                "candle": label,
                "price": f"{cl:.6g}",
                "range": f"{h:.6g} / {l:.6g}",
                "volatility": f"{vol:.2f}%",
                "change": f"{chg:.2f}%"
            }
    return None


@app.get("/scan")
def scan(request: Request, threshold: float = Query(3.0, ge=0.0, le=100.0)):
    now = time.time()

    # IP 쿨타임
    ip = request.headers.get("x-forwarded-for", request.client.host).split(",")[0].strip()
    last = _last_call.get(ip, 0)
    if now - last < COOLDOWN_PER_IP_SEC:
        wait = int(COOLDOWN_PER_IP_SEC - (now - last)) + 1
        return JSONResponse(
            status_code=429,
            content={"error": f"너무 자주 요청했어요. {wait}초 후 다시 시도하세요."}
        )
    _last_call[ip] = now

    # 캐시
    key = f"{threshold:.4f}"
    cached = _cache.get(key)
    if cached and (now - cached["ts"] <= CACHE_TTL_SEC):
        return cached["data"]

    # 티커 조회 (여기서 실패 상세를 그대로 내려줌)
    code, tickers = get_json(f"{BASE_URL}/fapi/v1/ticker/24hr", timeout=10)
    if not isinstance(tickers, list):
        return JSONResponse(
            status_code=502,
            content={"error": "바이낸스 티커 응답 오류", "http_status": code, "detail": tickers}
        )

    symbols = []
    for t in tickers:
        try:
            if t["symbol"].endswith("USDT") and float(t.get("quoteVolume", 0)) > 1_000_000:
                symbols.append(t["symbol"])
        except Exception:
            pass

    results = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = [ex.submit(check_symbol, s, threshold) for s in symbols]
        for f in as_completed(futures):
            r = f.result()
            if r:
                results.append(r)

    results.sort(key=lambda x: float(x["volatility"].replace("%", "")), reverse=True)

    _cache[key] = {"ts": now, "data": results}
    return results
