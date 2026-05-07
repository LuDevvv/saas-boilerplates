import { AxiosInstance } from "axios";
import { 
  Branch, 
  Product, 
  FoodVariant, 
  Category, 
  Extra, 
  MealTime, 
  Advertisement, 
  Qr,
  Currency,
  UnitsOfMeasurement,
  CreateBranchDto,
  UpdateBranchDto,
  CreateProductDto,
  UpdateProductDto,
  CreateFoodVariantDto,
  UpdateFoodVariantDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateExtraDto,
  UpdateExtraDto,
  CreateMealTimeDto,
  UpdateMealTimeDto,
  CreateAdvertisementDto,
  UpdateAdvertisementDto,
  CreateQrDto,
  UpdateQrDto,
  PaginatedResponse
} from "@node-stack/types";

export const branches = (client: AxiosInstance) => ({
  getAll: async (companyId: string, params?: { page?: number; limit?: number }) => {
    return await client.get<PaginatedResponse<Branch>>(`/companies/${companyId}/branches`, { params });
  },

  getById: async (id: string) => {
    return await client.get<{ data: Branch }>(`/branches/${id}`);
  },

  create: async (companyId: string, body: CreateBranchDto) => {
    return await client.post<{ data: Branch }>(`/companies/${companyId}/branches`, body);
  },

  update: async (id: string, body: UpdateBranchDto) => {
    return await client.patch<{ data: Branch }>(`/branches/${id}`, body);
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
    return await client.get<PaginatedResponse<Product>>(`/branches/${branchId}/products`, { params });
  },

  getById: async (id: string) => {
    return await client.get<{ data: Product }>(`/products/${id}`);
  },

  create: async (branchId: string, body: CreateProductDto) => {
    return await client.post<{ data: Product }>(`/branches/${branchId}/products`, body);
  },

  update: async (id: string, body: UpdateProductDto) => {
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

  create: async (productId: string, body: CreateFoodVariantDto) => {
    return await client.post<{ data: FoodVariant }>(`/products/${productId}/variants`, body);
  },

  update: async (id: string, body: UpdateFoodVariantDto) => {
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

  create: async (branchId: string, body: CreateCategoryDto) => {
    return await client.post<{ data: Category }>(`/branches/${branchId}/categories`, body);
  },

  update: async (id: string, body: UpdateCategoryDto) => {
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

  create: async (categoryId: string, body: CreateExtraDto) => {
    return await client.post<{ data: Extra }>(`/categories/${categoryId}/extras`, body);
  },

  update: async (id: string, body: UpdateExtraDto) => {
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

  create: async (branchId: string, body: CreateMealTimeDto) => {
    return await client.post<{ data: MealTime }>(`/branches/${branchId}/meal-times`, body);
  },

  update: async (id: string, body: UpdateMealTimeDto) => {
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

  create: async (branchId: string, body: CreateAdvertisementDto) => {
    return await client.post<{ data: Advertisement }>(`/branches/${branchId}/advertisements`, body);
  },

  update: async (id: string, body: UpdateAdvertisementDto) => {
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

  create: async (branchId: string, body: CreateQrDto) => {
    return await client.post<{ data: Qr }>(`/branches/${branchId}/qr`, body);
  },

  update: async (id: string, body: UpdateQrDto) => {
    return await client.patch<{ data: Qr }>(`/qr/${id}`, body);
  },
});

export const unitsOfMeasurement = (client: AxiosInstance) => ({
  getAll: async () => {
    return await client.get<{ data: UnitsOfMeasurement[] }>("/units-of-measurement");
  },
});
