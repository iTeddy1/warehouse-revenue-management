import type { ProductEntity } from '@/features/products/types'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'

// ─── API response shapes (mirrors backend DTOs) ──────────────────────────────

export interface SaleDetailProductSnapshot {
  id: string
  code: string
  name: string
  unit: string
}

export interface SaleDetailResponse {
  id: string
  saleId: string
  productId: string
  quantity: number
  /** Sell price captured at the time of the sale */
  sellPrice: number
  /** (sellPrice - costPrice) * quantity */
  profit: number
  product: SaleDetailProductSnapshot
}

export interface SaleResponse {
  id: string
  saleDate: string
  totalAmount: number
  totalProfit: number
  createdAt: string
  updatedAt: string
  details: SaleDetailResponse[]
}

export interface SaleListItem {
  id: string
  saleDate: string
  totalAmount: number
  totalProfit: number
  createdAt: string
  itemCount: number
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface SaleItemInput {
  productId: string
  quantity: number
}

export interface CreateSaleInput {
  items: SaleItemInput[]
  saleDate?: string
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface SalesQueryParams {
  page?: number
  limit?: number
}

// ─── API response wrappers ────────────────────────────────────────────────────

export type SalesResponse = PaginatedApiResponse<SaleListItem>
export type SaleApiResponse = ApiResponse<SaleResponse>

// ─── Cart types (local state only) ───────────────────────────────────────────

export interface CartItem {
  product: ProductEntity
  quantity: number
}
