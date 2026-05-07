import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

// ── Branch ────────────────────────────────────────────────
export const CreateBranchSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("México"),
  currencyId: z.string().optional(),
  domain: z.string().optional(),
  shoppingCart: z.boolean().default(false),
  hasDeliveries: z.boolean().default(false),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  googleMaps: z.string().optional(),
  deliveryCost: z.number().default(0),
});

export const UpdateBranchSchema = CreateBranchSchema.partial();

export class CreateBranchDto extends createZodDto(CreateBranchSchema) {}
export class UpdateBranchDto extends createZodDto(UpdateBranchSchema) {}

// ── Product ───────────────────────────────────────────────
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  hasVariants: z.boolean().default(false),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

// ── Food Variant ──────────────────────────────────────────
export const CreateFoodVariantSchema = z.object({
  productId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().optional(),
  isActive: z.boolean().default(true),
  stock: z.number().default(0),
  options: z.record(z.string(), z.string()).default({}),
});

export const UpdateFoodVariantSchema = CreateFoodVariantSchema.partial();

export class CreateFoodVariantDto extends createZodDto(CreateFoodVariantSchema) {}
export class UpdateFoodVariantDto extends createZodDto(UpdateFoodVariantSchema) {}

// ── Category ──────────────────────────────────────────────
export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}

// ── Extra ─────────────────────────────────────────────────
export const CreateExtraSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  categoryId: z.string(),
  isActive: z.boolean().default(true),
  min: z.number().default(0),
  max: z.number().default(10),
});

export const UpdateExtraSchema = CreateExtraSchema.partial();

export class CreateExtraDto extends createZodDto(CreateExtraSchema) {}
export class UpdateExtraDto extends createZodDto(UpdateExtraSchema) {}

// ── Meal Time ─────────────────────────────────────────────
export const CreateMealTimeSchema = z.object({
  branchId: z.string(),
  name: z.string().min(1).max(100),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean().default(true),
});

export const UpdateMealTimeSchema = CreateMealTimeSchema.partial();

export class CreateMealTimeDto extends createZodDto(CreateMealTimeSchema) {}
export class UpdateMealTimeDto extends createZodDto(UpdateMealTimeSchema) {}

// ── Advertisement ─────────────────────────────────────────
export const CreateAdvertisementSchema = z.object({
  branchId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  link: z.string().url().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const UpdateAdvertisementSchema = CreateAdvertisementSchema.partial();

export class CreateAdvertisementDto extends createZodDto(CreateAdvertisementSchema) {}
export class UpdateAdvertisementDto extends createZodDto(UpdateAdvertisementSchema) {}

// ── QR ────────────────────────────────────────────────────
export const CreateQrSchema = z.object({
  branchId: z.string(),
  qrColor: z.string().default("#000000"),
  backgroundColor: z.string().default("#FFFFFF"),
  presentationStyle: z.string().default("estacion"),
  qrStyle: z.string().default("square"),
});

export const UpdateQrSchema = CreateQrSchema.partial();

export class CreateQrDto extends createZodDto(CreateQrSchema) {}
export class UpdateQrDto extends createZodDto(UpdateQrSchema) {}
