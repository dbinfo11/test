import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Home className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">PropertyPro</span>
            </Link>
            <div className="hidden md:ml-10 md:flex space-x-8">
              <Link href="/">
                <a className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location === "/" ? "text-primary" : "text-gray-500 hover:text-primary"
                }`}>
                  매물 검색
                </a>
              </Link>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                지역별 매물
              </a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                시세 정보
              </a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                고객센터
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">로그인</Button>
            <Button size="sm">회원가입</Button>
            <Link href="/admin">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                <Settings className="w-4 h-4 mr-1" />
                관리자
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
