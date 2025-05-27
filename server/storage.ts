import { properties, inquiries, type Property, type InsertProperty, type Inquiry, type InsertInquiry } from "@shared/schema";

export interface IStorage {
  // Property methods
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  getFeaturedProperties(): Promise<Property[]>;
  searchProperties(filters: {
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Inquiry methods
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  deleteInquiry(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private inquiries: Map<number, Inquiry>;
  private currentPropertyId: number;
  private currentInquiryId: number;

  constructor() {
    this.properties = new Map();
    this.inquiries = new Map();
    this.currentPropertyId = 1;
    this.currentInquiryId = 1;

    // Initialize with some sample properties
    this.initializeProperties();
  }

  private initializeProperties() {
    const sampleProperties: InsertProperty[] = [
      {
        title: "강남구 역삼동 신축 아파트",
        description: "최신 시설과 편의시설을 갖춘 프리미엄 아파트입니다. 지하철역 도보 5분 거리에 위치하며, 주변 상권이 잘 발달되어 있습니다.",
        price: 320000000,
        area: 84,
        rooms: 3,
        bathrooms: 2,
        floor: "12/25",
        yearBuilt: 2021,
        parking: "1대",
        propertyType: "아파트",
        address: "서울시 강남구 역삼동 123-45",
        location: "서울",
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
          "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        ],
        status: "판매중",
        featured: true,
      },
      {
        title: "분당 신도시 단독주택",
        description: "조용하고 쾌적한 주거환경의 단독주택입니다. 넓은 마당과 주차공간을 보유하고 있으며, 인근 학군이 우수합니다.",
        price: 580000000,
        area: 165,
        rooms: 4,
        bathrooms: 3,
        floor: "2층",
        yearBuilt: 2018,
        parking: "2대",
        propertyType: "단독주택",
        address: "경기도 성남시 분당구 정자동 456-78",
        location: "경기도",
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
          "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        ],
        status: "검토중",
        featured: true,
      },
      {
        title: "마포구 합정동 리모델링 아파트",
        description: "완전 리모델링으로 새집같은 느낌의 아파트입니다. 홍대, 합정역 접근성이 우수하며 젊은 분들에게 인기 있는 지역입니다.",
        price: 210000000,
        area: 59,
        rooms: 2,
        bathrooms: 1,
        floor: "8/15",
        yearBuilt: 2015,
        parking: "1대",
        propertyType: "아파트",
        address: "서울시 마포구 합정동 789-12",
        location: "서울",
        images: [
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
          "https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        ],
        status: "판매중",
        featured: true,
      },
    ];

    sampleProperties.forEach(property => {
      const id = this.currentPropertyId++;
      const propertyWithId: Property = {
        ...property,
        id,
        floor: property.floor || null,
        yearBuilt: property.yearBuilt || null,
        parking: property.parking || null,
        featured: property.featured || false,
        images: property.images ?? [],
        status: property.status || "판매중",
        createdAt: new Date(),
      };
      this.properties.set(id, propertyWithId);
    });
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return Array.from(this.properties.values())
      .filter(property => property.featured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async searchProperties(filters: {
    location?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Property[]> {
    let results = Array.from(this.properties.values());

    if (filters.location) {
      results = results.filter(property => 
        property.location.includes(filters.location!) || 
        property.address.includes(filters.location!)
      );
    }

    if (filters.propertyType && filters.propertyType !== "전체") {
      results = results.filter(property => property.propertyType === filters.propertyType);
    }

    if (filters.minPrice) {
      results = results.filter(property => property.price >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      results = results.filter(property => property.price <= filters.maxPrice!);
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      floor: insertProperty.floor || null,
      yearBuilt: insertProperty.yearBuilt || null,
      parking: insertProperty.parking || null,
      featured: insertProperty.featured || false,
      images: insertProperty.images ?? [],
      status: insertProperty.status || "판매중",
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;

    const updatedProperty: Property = {
      ...property,
      ...updateData,
    };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.currentInquiryId++;
    const inquiry: Inquiry = {
      ...insertInquiry,
      id,
      propertyId: insertInquiry.propertyId ?? null,
      createdAt: new Date(),
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async deleteInquiry(id: number): Promise<boolean> {
    return this.inquiries.delete(id);
  }
}

export const storage = new MemStorage();
