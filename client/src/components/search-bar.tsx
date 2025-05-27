import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (filters: {
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [location, setLocation] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  const handleSearch = () => {
    const filters: any = {};
    
    if (location && location !== "전체") {
      filters.location = location;
    }
    
    if (propertyType && propertyType !== "전체") {
      filters.propertyType = propertyType;
    }
    
    if (priceRange && priceRange !== "전체") {
      switch (priceRange) {
        case "1억 이하":
          filters.maxPrice = 100000000;
          break;
        case "1-3억":
          filters.minPrice = 100000000;
          filters.maxPrice = 300000000;
          break;
        case "3억 이상":
          filters.minPrice = 300000000;
          break;
      }
    }
    
    onSearch(filters);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="서울">서울</SelectItem>
              <SelectItem value="부산">부산</SelectItem>
              <SelectItem value="대구">대구</SelectItem>
              <SelectItem value="경기도">경기도</SelectItem>
              <SelectItem value="인천">인천</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">매물 유형</label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="아파트">아파트</SelectItem>
              <SelectItem value="빌라">빌라</SelectItem>
              <SelectItem value="단독주택">단독주택</SelectItem>
              <SelectItem value="원룸">원룸</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">가격대</label>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="가격 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              <SelectItem value="1억 이하">1억 이하</SelectItem>
              <SelectItem value="1-3억">1-3억</SelectItem>
              <SelectItem value="3억 이상">3억 이상</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button onClick={handleSearch} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            검색
          </Button>
        </div>
      </div>
    </div>
  );
}
