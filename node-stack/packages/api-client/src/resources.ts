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
  getAll: async (
    companyId: string,
    params?: { page?: number; limit?: number },
  ) => {
    return client.get<PaginatedResponse<Branch>>(
      `/companies/${companyId}/branches`,
      { params },
    );
  },

  getById: async (id: string) => {
    return client.get<Branch>(`/branches/${id}`);
  },

  create: async (companyId: string, body: CreateBranchDto) => {
    return client.post<Branch>(`/companies/${companyId}/branches`, body);
  },

  update: async (id: string, body: UpdateBranchDto) => {
    return client.patch<Branch>(`/branches/${id}`, body);
  },

  remove: async (id: string) => {
    return client.delete<{ success: boolean }>(`/branches/${id}`);
  },

  search: async (term: string, companyId: string) => {
    return client.get<Branch[]>(`/companies/${companyId}/branches/search`, {
      params: { q: term },
    });
  },

  uploadLogo: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post<Branch>(`/branches/${id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadBanner: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post<Branch>(`/branches/${id}/banner`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteLogo: async (id: string) => {
    return client.delete<{ success: boolean }>(`/branches/${id}/logo`);
  },

  deleteBanner: async (id: string) => {
    return client.delete<{ success: boolean }>(`/branches/${id}/banner`);
  },
});

export const products = (client: AxiosInstance) => ({
  getAll: async (
    branchId: string,
    params?: { page?: number; limit?: number; categoryId?: string },
  ) => {
    return client.get<PaginatedResponse<Product>>(
      `/branches/${branchId}/products`,
      { params },
    );
  },

  getById: async (id: string) => {
    return client.get<Product>(`/products/${id}`);
  },

  create: async (branchId: string, body: CreateProductDto) => {
    return client.post<Product>(`/branches/${branchId}/products`, body);
  },

  update: async (id: string, body: UpdateProductDto) => {
    return client.patch<Product>(`/products/${id}`, body);
  },

  remove: async (id: string) => {
    return client.delete<{ success: boolean }>(`/products/${id}`);
  },

  reorder: async (branchId: string, body: { productIds: string[] }) => {
    return client.post<{ success: boolean }>(
      `/branches/${branchId}/products/reorder`,
      body,
    );
  },
});

export const foodVariants = (client: AxiosInstance) => ({
  getAll: async (productId: string) => {
    return client.get<FoodVariant[]>(`/products/${productId}/variants`);
  },

  create: async (productId: string, body: CreateFoodVariantDto) => {
    return client.post<FoodVariant>(`/products/${productId}/variants`, body);
  },

  update: async (id: string, body: UpdateFoodVariantDto) => {
    return client.patch<FoodVariant>(`/variants/${id}`, body);
  },

  remove: async (id: string) => {
    return client.delete<{ success: boolean }>(`/variants/${id}`);
  },
});

export const categories = (client: AxiosInstance) => ({
  getAll: async (branchId: string) => {
    return client.get<Category[]>(`/branches/${branchId}/categories`);
  },

  create: async (branchId: string, body: CreateCategoryDto) => {
    return client.post<Category>(`/branches/${branchId}/categories`, body);
  },

  update: async (id: string, body: UpdateCategoryDto) => {
    return client.patch<Category>(`/categories/${id}`, body);
  },

  remove: async (id: string) => {
    return client.delete<{ success: boolean }>(`/categories/${id}`);
  },
});

export const extras = (client: AxiosInstance) => ({
  getAll: async (categoryId: string) => {
    return client.get<Extra[]>(`/categories/${categoryId}/extras`);
  },

  create: async (categoryId: string, body: CreateExtraDto) => {
    return client.post<Extra>(`/categories/${categoryId}/extras`, body);
  },

  update: async (id: string, body: UpdateExtraDto) => {
    return client.patch<Extra>(`/extras/${id}`, body);
  },

  remove: async (id: string) => {
    return client.delete<{ success: boolean }>(`/extras/${id}`);
  },
});

export const currencies = (client: AxiosInstance) => ({
  getAll: async () => {
    return client.get<Currency[]>("/currencies");
  },
});

export const mealTimes = (client: AxiosInstance) => ({
  getAll: async (branchId: string) => {
    return client.get<MealTime[]>(`/branches/${branchId}/meal-times`);
  },

  getMealTimesByProduct: async (productId: string) => {
    return client.get<MealTime[]>(`/products/${productId}/meal-times`);
  },

  create: async (branchId: string, body: CreateMealTimeDto) => {
    return client.post<MealTime>(`/branches/${branchId}/meal-times`, body);
  },

  update: async (id: string, body: UpdateMealTimeDto) => {
    return client.patch<MealTime>(`/meal-times/${id}`, body);
  },

  remove: async (id: string) => {
    return client.delete<{ success: boolean }>(`/meal-times/${id}`);
  },

  addProduct: async (productId: string, mealTimeId: string) => {
    return client.post<{ success: boolean }>(
      `/meal-times/${mealTimeId}/products`,
      { productId },
    );
  },

  removeProduct: async (productId: string, mealTimeId: string) => {
    return client.delete<{ success: boolean }>(
      `/meal-times/${mealTimeId}/products/${productId}`,
    );
  },
});

export const advertisements = (client: AxiosInstance) => ({
  getAll: async (branchId: string) => {
    return client.get<Advertisement[]>(`/branches/${branchId}/advertisements`);
  },

  create: async (branchId: string, body: CreateAdvertisementDto) => {
    return client.post<Advertisement>(
      `/branches/${branchId}/advertisements`,
      body,
    );
  },

  update: async (id: string, body: UpdateAdvertisementDto) => {
    return client.patch<Advertisement>(`/advertisements/${id}`, body);
  },

  remove: async (id: string) => {
    return client.delete<{ success: boolean }>(`/advertisements/${id}`);
  },

  reorder: async (branchId: string, body: { adIds: string[] }) => {
    return client.post<{ success: boolean }>(
      `/branches/${branchId}/advertisements/reorder`,
      body,
    );
  },
});

export const qr = (client: AxiosInstance) => ({
  getByBranchId: async (branchId: string) => {
    return client.get<Qr | null>(`/branches/${branchId}/qr`);
  },

  create: async (branchId: string, body: CreateQrDto) => {
    return client.post<Qr>(`/branches/${branchId}/qr`, body);
  },

  update: async (id: string, body: UpdateQrDto) => {
    return client.patch<Qr>(`/qr/${id}`, body);
  },
});

export const unitsOfMeasurement = (client: AxiosInstance) => ({
  getAll: async () => {
    return client.get<UnitsOfMeasurement[]>("/units-of-measurement");
  },
});
