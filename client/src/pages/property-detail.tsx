import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import ContactForm from "@/components/contact-form";
import { Property } from "@shared/schema";
import { ArrowLeft, Heart, Phone, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ["/api/properties", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4" />
            <div className="h-80 bg-gray-300 rounded-lg mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-20 bg-gray-300 rounded" />
              </div>
              <div className="h-40 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">매물을 찾을 수 없습니다</h1>
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    const billion = Math.floor(price / 100000000);
    const million = Math.floor((price % 100000000) / 10000);
    
    if (billion > 0 && million > 0) {
      return `${billion}억 ${million}천만원`;
    } else if (billion > 0) {
      return `${billion}억원`;
    } else {
      return `${million}천만원`;
    }
  };

  const formatArea = (area: number) => {
    const pyeong = (area / 3.3).toFixed(1);
    return `${area}㎡ (${pyeong}평)`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>

        {/* Property Images */}
        <div className="mb-8">
          <div className="relative mb-4">
            <img
              src={property.images[selectedImage] || property.images[0] || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&h=600"}
              alt={property.title}
              className="w-full h-80 object-cover rounded-lg"
            />
            <div className="absolute top-4 left-4">
              <Badge variant={property.status === "판매중" ? "default" : "secondary"}>
                {property.status}
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Button size="icon" variant="secondary">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {property.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${property.title} ${index + 1}`}
                  className={`w-full h-20 object-cover rounded cursor-pointer ${
                    selectedImage === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <span className="text-sm text-gray-500">{property.propertyType}</span>
              </div>
              
              <div className="text-3xl font-bold text-primary mb-4">
                {formatPrice(property.price)}
              </div>
              
              <p className="text-gray-600 mb-4">{property.address}</p>
              
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            <Tabs defaultValue="overview" className="bg-white rounded-xl shadow-lg">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="details">상세정보</TabsTrigger>
                <TabsTrigger value="location">주변시설</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">매물 유형:</span>
                    <span className="font-medium">{property.propertyType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">전용면적:</span>
                    <span className="font-medium">{formatArea(property.area)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">방/화장실:</span>
                    <span className="font-medium">{property.rooms}개/{property.bathrooms}개</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">층수:</span>
                    <span className="font-medium">{property.floor}</span>
                  </div>
                  {property.yearBuilt && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">준공년도:</span>
                      <span className="font-medium">{property.yearBuilt}년</span>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">주차:</span>
                      <span className="font-medium">{property.parking}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">상세 정보</h3>
                  <p className="text-gray-600">
                    이 매물에 대한 더 자세한 정보는 담당자에게 문의해 주세요.
                    견학 예약 및 상담을 통해 더 많은 정보를 제공받으실 수 있습니다.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="location" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">주변 시설</h3>
                  <p className="text-gray-600">
                    주변 편의시설, 교통, 교육 시설 등에 대한 정보는 
                    담당자와의 상담을 통해 확인하실 수 있습니다.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {/* Price & Contact */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    평당 약 {Math.round(property.price / (property.area / 3.3) / 10000)}만원
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="w-4 h-4 mr-2" />
                    상담 신청
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    견학 예약
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">문의하기</h3>
                <ContactForm propertyId={property.id} compact />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
