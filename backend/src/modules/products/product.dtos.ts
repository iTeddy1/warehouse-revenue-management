/**
 * DTO for creating a new product (FR-01)
 */
export interface CreateProductDto {
  code: string;
  name: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stockQty: number;
  alertLevel?: number;
}

/**
 * DTO for updating an existing product (FR-02, FR-16)
 */
export interface UpdateProductDto {
  code?: string;
  name?: string;
  unit?: string;
  costPrice?: number;
  sellPrice?: number;
  stockQty?: number;
  alertLevel?: number;
}

/**
 * DTO for query parameters when listing products (FR-04)
 */
export interface ProductQueryDto {
  search?: string;
}

/**
 * DTO for route params requiring a product ID
 */
export interface ProductParamsDto {
  id: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface ProductResponse {
  id: string;
  code: string;
  name: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stockQty: number;
  alertLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponse {
  data: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
