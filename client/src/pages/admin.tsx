import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from "@/components/navbar";
import AdminPanel from "@/components/admin-panel";
import { Property, Inquiry } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";

export default function Admin() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "성공",
        description: "매물이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "매물 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteInquiryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      toast({
        title: "성공",
        description: "문의가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "문의 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProperty = (id: number) => {
    if (confirm("정말로 이 매물을 삭제하시겠습니까?")) {
      deletePropertyMutation.mutate(id);
    }
  };

  const handleDeleteInquiry = (id: number) => {
    if (confirm("정말로 이 문의를 삭제하시겠습니까?")) {
      deleteInquiryMutation.mutate(id);
    }
  };

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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">매물과 문의를 관리하세요</p>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">매물 관리</TabsTrigger>
            <TabsTrigger value="add-property">새 매물 등록</TabsTrigger>
            <TabsTrigger value="inquiries">문의 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>등록된 매물</CardTitle>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    새 매물 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>매물 정보</TableHead>
                        <TableHead>가격</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>등록일</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties?.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={property.images[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=100&h=100"}
                                alt={property.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <div className="font-medium">{property.title}</div>
                                <div className="text-sm text-gray-500">{property.address}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">{formatPrice(property.price)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={property.status === "판매중" ? "default" : "secondary"}>
                              {property.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(property.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-property">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle>문의 관리</CardTitle>
              </CardHeader>
              <CardContent>
                {inquiriesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : inquiries && inquiries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>문의자</TableHead>
                        <TableHead>문의 유형</TableHead>
                        <TableHead>문의 내용</TableHead>
                        <TableHead>문의일</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{inquiry.name}</div>
                              <div className="text-sm text-gray-500">{inquiry.email}</div>
                              <div className="text-sm text-gray-500">{inquiry.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{inquiry.inquiryType}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={inquiry.message}>
                              {inquiry.message}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteInquiry(inquiry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">문의가 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
