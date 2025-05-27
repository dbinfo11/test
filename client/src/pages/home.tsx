import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import SearchBar from "@/components/search-bar";
import PropertyCard from "@/components/property-card";
import ContactForm from "@/components/contact-form";
import { Property } from "@shared/schema";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<{
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
  }>({});

  const { data: featuredProperties, isLoading: featuredLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/featured"],
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/search", searchFilters],
    enabled: Object.keys(searchFilters).length > 0,
  });

  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
  };

  const displayProperties = searchResults || featuredProperties || [];
  const isLoading = searchLoading || (featuredLoading && !searchResults);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary py-20">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="absolute inset-0 bg-black opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            당신의 꿈의 집을<br />찾아보세요
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            전국 최대 부동산 매물 데이터베이스에서 완벽한 집을 찾으세요
          </p>
          
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {searchResults ? "검색 결과" : "추천 매물"}
            </h2>
            <p className="text-lg text-gray-600">
              {searchResults ? "검색 조건에 맞는 매물입니다" : "엄선된 최고의 부동산 매물을 만나보세요"}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-300" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 rounded w-1/2" />
                    <div className="h-4 bg-gray-300 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">검색 조건에 맞는 매물이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">문의하기</h2>
            <p className="text-lg text-gray-600">궁금한 점이 있으시면 언제든지 연락주세요</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-6">연락처 정보</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <i className="fas fa-phone text-primary text-xl mr-4"></i>
                  <div>
                    <div className="font-medium">전화</div>
                    <div className="text-gray-600">02-1234-5678</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-envelope text-primary text-xl mr-4"></i>
                  <div>
                    <div className="font-medium">이메일</div>
                    <div className="text-gray-600">info@propertypro.co.kr</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-primary text-xl mr-4"></i>
                  <div>
                    <div className="font-medium">주소</div>
                    <div className="text-gray-600">서울시 강남구 테헤란로 123</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock text-primary text-xl mr-4"></i>
                  <div>
                    <div className="font-medium">운영시간</div>
                    <div className="text-gray-600">평일 9:00 - 18:00</div>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-home text-primary text-2xl mr-2"></i>
                <span className="text-xl font-bold">PropertyPro</span>
              </div>
              <p className="text-gray-400">믿을 수 있는 부동산 전문 플랫폼으로 당신의 꿈의 집을 찾아드립니다.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">매물 검색</a></li>
                <li><a href="#" className="hover:text-white transition-colors">시세 정보</a></li>
                <li><a href="#" className="hover:text-white transition-colors">투자 분석</a></li>
                <li><a href="#" className="hover:text-white transition-colors">컨설팅</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">고객지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">자주 묻는 질문</a></li>
                <li><a href="#" className="hover:text-white transition-colors">이용가이드</a></li>
                <li><a href="#" className="hover:text-white transition-colors">고객센터</a></li>
                <li><a href="#" className="hover:text-white transition-colors">신고센터</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">팔로우</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook-f text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-youtube text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PropertyPro. All rights reserved. | 개인정보처리방침 | 이용약관</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
