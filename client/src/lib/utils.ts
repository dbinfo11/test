import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  const billion = Math.floor(price / 100000000);
  const million = Math.floor((price % 100000000) / 10000);
  
  if (billion > 0 && million > 0) {
    return `${billion}억 ${million}천만원`;
  } else if (billion > 0) {
    return `${billion}억원`;
  } else {
    return `${million}천만원`;
  }
}

export function formatArea(area: number): string {
  const pyeong = (area / 3.3).toFixed(1);
  return `${area}㎡ (${pyeong}평)`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("ko-KR");
}
