// Placeholder DTO shapes for resource modules. Real shapes are defined
// by the validators package's zod schemas; these aliases exist so the
// api-client surface compiles in repos that haven't generated the
// per-module DTOs yet. Phase 4c will replace them with the OpenAPI-
// generated types.
export type CreateBranchDto = Record<string, unknown>;
export type UpdateBranchDto = Record<string, unknown>;
export type CreateProductDto = Record<string, unknown>;
export type UpdateProductDto = Record<string, unknown>;
export type CreateFoodVariantDto = Record<string, unknown>;
export type UpdateFoodVariantDto = Record<string, unknown>;
export type CreateCategoryDto = Record<string, unknown>;
export type UpdateCategoryDto = Record<string, unknown>;
export type CreateExtraDto = Record<string, unknown>;
export type UpdateExtraDto = Record<string, unknown>;
export type CreateMealTimeDto = Record<string, unknown>;
export type UpdateMealTimeDto = Record<string, unknown>;
export type CreateAdvertisementDto = Record<string, unknown>;
export type UpdateAdvertisementDto = Record<string, unknown>;
export type CreateQrDto = Record<string, unknown>;
export type UpdateQrDto = Record<string, unknown>;
