import { AxiosInstance } from "axios";
import { createClient } from "./client";
import { z } from "zod";

export interface Branch {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  currency: string | null;
  domain: string | null;
  logo: { url: string } | null;
  banner: { url: string } | null;
  shoppingCart: boolean;
  hasDeliveries: boolean;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  tiktok: string | null;
  googleMaps: string | null;
  deliveryCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  isActive: boolean;
  featured: boolean;
  isAvailable: boolean;
  hasVariants: boolean;
  images: Array<{ url: string; order: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface FoodVariant {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  isActive: boolean;
  stock: number;
  options: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  image: { url: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  name: string;
  currency: string;
  symbol: string;
  isDefault: boolean;
}

export interface Extra {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  isActive: boolean;
  min: number;
  max: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealTime {
  id: string;
  branchId: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  branchId: string;
  title: string;
  description: string | null;
  image: { url: string } | null;
  link: string | null;
  isActive: boolean;
  order: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Qr {
  id: string;
  branchId: string;
  qrColor: string;
  backgroundColor: string;
  presentationStyle: string;
  qrStyle: string;
  fullUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UnitsOfMeasurement {
  id: string;
  name: string;
  abbreviation: string;
  type: "weight" | "volume" | "quantity";
}

const CreateBranchSchema = z.object({
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

const UpdateBranchSchema = CreateBranchSchema.partial();

const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  hasVariants: z.boolean().default(false),
});

const CreateFoodVariantSchema = z.object({
  productId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().optional(),
  isActive: z.boolean().default(true),
  stock: z.number().default(0),
  options: z.record(z.string()).default({}),
});

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

const CreateExtraSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().min(0),
  categoryId: z.string(),
  isActive: z.boolean().default(true),
  min: z.number().default(0),
  max: z.number().default(10),
});

const CreateMealTimeSchema = z.object({
  branchId: z.string(),
  name: z.string().min(1).max(100),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean().default(true),
});

const CreateAdvertisementSchema = z.object({
  branchId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  link: z.string().url().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const CreateQrSchema = z.object({
  branchId: z.string(),
  qrColor: z.string().default("#000000"),
  backgroundColor: z.string().default("#FFFFFF"),
  presentationStyle: z.string().default("estacion"),
  qrStyle: z.string().default("square"),
});

export const branches = (client: AxiosInstance) => ({
  getAll: async (companyId: string, params?: { page?: number; limit?: number }) => {
    return await client.get<{ data: Branch[]; meta: { page: number; limit: number; total: number } }>(`/companies/${companyId}/branches`, { params });
  },

  getById: async (id: string) => {
    return await client.get<{ data: Branch }>(`/branches/${id}`);
  },

  create: async (companyId: string, body: Partial<Branch>) => {
    return await client.post<{ data: Branch }>(`/companies/${companyId}/branches`, CreateBranchSchema.parse(body));
  },

  update: async (id: string, body: Partial<Branch>) => {
    return await client.patch<{ data: Branch }>(`/branches/${id}`, UpdateBranchSchema.parse(body));
  },

  remove: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/branches/${id}`);
  },

  search: async (term: string, companyId: string) => {
    return await client.get<{ data: Branch[] }>(`/companies/${companyId}/branches/search`, { params: { q: term } });
  },

  uploadLogo: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await client.post<{ data: Branch }>(`/branches/${id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadBanner: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await client.post<{ data: Branch }>(`/branches/${id}/banner`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteLogo: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/branches/${id}/logo`);
  },

  deleteBanner: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/branches/${id}/banner`);
  },
});

export const products = (client: AxiosInstance) => ({
  getAll: async (branchId: string, params?: { page?: number; limit?: number; categoryId?: string }) => {
    return await client.get<{ data: Product[]; meta: { page: number; limit: number; total: number } }>(`/branches/${branchId}/products`, { params });
  },

  getById: async (id: string) => {
    return await client.get<{ data: Product }>(`/products/${id}`);
  },

  create: async (branchId: string, body: Partial<Product>) => {
    return await client.post<{ data: Product }>(`/branches/${branchId}/products`, CreateProductSchema.parse(body));
  },

  update: async (id: string, body: Partial<Product>) => {
    return await client.patch<{ data: Product }>(`/products/${id}`, body);
  },

  remove: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/products/${id}`);
  },

  reorder: async (branchId: string, body: { productIds: string[] }) => {
    return await client.post<{ success: boolean }>(`/branches/${branchId}/products/reorder`, body);
  },
});

export const foodVariants = (client: AxiosInstance) => ({
  getAll: async (productId: string) => {
    return await client.get<{ data: FoodVariant[] }>(`/products/${productId}/variants`);
  },

  create: async (productId: string, body: Partial<FoodVariant>) => {
    return await client.post<{ data: FoodVariant }>(`/products/${productId}/variants`, CreateFoodVariantSchema.parse({ ...body, productId }));
  },

  update: async (id: string, body: Partial<FoodVariant>) => {
    return await client.patch<{ data: FoodVariant }>(`/variants/${id}`, body);
  },

  remove: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/variants/${id}`);
  },
});

export const categories = (client: AxiosInstance) => ({
  getAll: async (branchId: string) => {
    return await client.get<{ data: Category[] }>(`/branches/${branchId}/categories`);
  },

  create: async (branchId: string, body: Partial<Category>) => {
    return await client.post<{ data: Category }>(`/branches/${branchId}/categories`, CreateCategorySchema.parse(body));
  },

  update: async (id: string, body: Partial<Category>) => {
    return await client.patch<{ data: Category }>(`/categories/${id}`, body);
  },

  remove: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/categories/${id}`);
  },
});

export const extras = (client: AxiosInstance) => ({
  getAll: async (categoryId: string) => {
    return await client.get<{ data: Extra[] }>(`/categories/${categoryId}/extras`);
  },

  create: async (categoryId: string, body: Partial<Extra>) => {
    return await client.post<{ data: Extra }>(`/categories/${categoryId}/extras`, CreateExtraSchema.parse({ ...body, categoryId }));
  },

  update: async (id: string, body: Partial<Extra>) => {
    return await client.patch<{ data: Extra }>(`/extras/${id}`, body);
  },

  remove: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/extras/${id}`);
  },
});

export const currencies = (client: AxiosInstance) => ({
  getAll: async () => {
    return await client.get<{ data: Currency[] }>("/currencies");
  },
});

export const mealTimes = (client: AxiosInstance) => ({
  getAll: async (branchId: string) => {
    return await client.get<{ data: MealTime[] }>(`/branches/${branchId}/meal-times`);
  },

  getMealTimesByProduct: async (productId: string) => {
    return await client.get<{ data: MealTime[] }>(`/products/${productId}/meal-times`);
  },

  create: async (branchId: string, body: Partial<MealTime>) => {
    return await client.post<{ data: MealTime }>(`/branches/${branchId}/meal-times`, CreateMealTimeSchema.parse({ ...body, branchId }));
  },

  update: async (id: string, body: Partial<MealTime>) => {
    return await client.patch<{ data: MealTime }>(`/meal-times/${id}`, body);
  },

  remove: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/meal-times/${id}`);
  },

  addProduct: async (productId: string, mealTimeId: string) => {
    return await client.post<{ success: boolean }>(`/meal-times/${mealTimeId}/products`, { productId });
  },

  removeProduct: async (productId: string, mealTimeId: string) => {
    return await client.delete<{ success: boolean }>(`/meal-times/${mealTimeId}/products/${productId}`);
  },
});

export const advertisements = (client: AxiosInstance) => ({
  getAll: async (branchId: string) => {
    return await client.get<{ data: Advertisement[] }>(`/branches/${branchId}/advertisements`);
  },

  create: async (branchId: string, body: Partial<Advertisement>) => {
    return await client.post<{ data: Advertisement }>(`/branches/${branchId}/advertisements`, CreateAdvertisementSchema.parse({ ...body, branchId }));
  },

  update: async (id: string, body: Partial<Advertisement>) => {
    return await client.patch<{ data: Advertisement }>(`/advertisements/${id}`, body);
  },

  remove: async (id: string) => {
    return await client.delete<{ success: boolean }>(`/advertisements/${id}`);
  },

  reorder: async (branchId: string, body: { adIds: string[] }) => {
    return await client.post<{ success: boolean }>(`/branches/${branchId}/advertisements/reorder`, body);
  },
});

export const qr = (client: AxiosInstance) => ({
  getByBranchId: async (branchId: string) => {
    return await client.get<{ data: Qr | null }>(`/branches/${branchId}/qr`);
  },

  create: async (branchId: string, body: Partial<Qr>) => {
    return await client.post<{ data: Qr }>(`/branches/${branchId}/qr`, CreateQrSchema.parse({ ...body, branchId }));
  },

  update: async (id: string, body: Partial<Qr>) => {
    return await client.patch<{ data: Qr }>(`/qr/${id}`, body);
  },
});

export const unitsOfMeasurement = (client: AxiosInstance) => ({
  getAll: async () => {
    return await client.get<{ data: UnitsOfMeasurement[] }>("/units-of-measurement");
  },
});
