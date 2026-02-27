import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type { BaseEntity } from '@/types/base'

export interface ProductEntity extends BaseEntity {
  code: string
  name: string
  unit: string
  costPrice: number
  sellPrice: number
  stockQty: number
  alertLevel: number
}

/**
 * Create Product Input
 */
export type CreateProductInput = {
  code: string
  name: string
  unit: string
  costPrice: number
  sellPrice: number
  stockQty: number
  alertLevel: number
}

/**
 * Update Product Input
 */
export type UpdateProductInput = Partial<CreateProductInput>

/**
 * Products Query Parameters
 */
export type ProductsQueryParams = {
  search?: string
  page?: number
  limit?: number
}

/**
 * Products List Response
 */
export type ProductsResponse = PaginatedApiResponse<ProductEntity>

/**
 * Single Product Response
 */
export type ProductResponse = ApiResponse<ProductEntity>
