import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { Heart } from "lucide-react";
import { Link } from "wouter";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
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
    return `${area}㎡`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={property.images[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&h=400"}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {property.featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600">추천</Badge>
          )}
          {property.status === "판매중" && (
            <Badge className="bg-green-500 hover:bg-green-600">NEW</Badge>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <Button size="icon" variant="secondary" className="rounded-full">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(property.price)}
          </span>
          <span className="text-sm text-gray-500">{property.propertyType}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {property.title}
        </h3>
        
        <p className="text-gray-600 mb-4">{property.address}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{formatArea(property.area)}</span>
          <span>방 {property.rooms}개</span>
          <span>화장실 {property.bathrooms}개</span>
        </div>
        
        <Link href={`/property/${property.id}`}>
          <Button className="w-full">
            자세히 보기
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
