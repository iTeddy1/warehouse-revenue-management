import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import { BaseEntity } from '@/types/base'

// ─── Nested snapshot returned by the API ────────────────────────────────────
export interface ImportProductSnapshot {
  id: string
  code: string
  name: string
  unit: string
}

// ─── Core entity ─────────────────────────────────────────────────────────────
export interface ImportRecord extends BaseEntity {
  importDate: string // ISO string
  productId: string
  quantity: number
  costPrice: number
  product: ImportProductSnapshot
}

// ─── Request / mutation types ────────────────────────────────────────────────
export type CreateImportInput = {
  productId: string
  quantity: number
  costPrice: number
  /** Optional; server defaults to now() */
  importDate?: string
}

// ─── Query params ─────────────────────────────────────────────────────────────
export type ImportsQueryParams = {
  productId?: string
  page?: number
  limit?: number
}

// ─── Response wrappers ────────────────────────────────────────────────────────
export type ImportsResponse = PaginatedApiResponse<ImportRecord>
export type ImportResponse = ApiResponse<ImportRecord>
