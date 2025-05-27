import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in Korean won
  area: integer("area").notNull(), // in square meters
  rooms: integer("rooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  floor: text("floor"), // e.g., "12/25"
  yearBuilt: integer("year_built"),
  parking: text("parking"), // e.g., "1대"
  propertyType: text("property_type").notNull(), // 아파트, 빌라, 단독주택, etc.
  address: text("address").notNull(),
  location: text("location").notNull(), // city/district
  images: text("images").array().notNull().default([]), // array of image URLs
  status: text("status").notNull().default("판매중"), // 판매중, 검토중, 판매완료
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  inquiryType: text("inquiry_type").notNull(),
  message: text("message").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
