/**
 * Import DTOs - TypeScript interfaces and types for the Import module
 */

// ─── Request DTOs ────────────────────────────────────────────────────────────

/**
 * DTO for creating a new import record (FR-05)
 */
export interface CreateImportDto {
  productId: string;
  quantity: number;
  costPrice: number;
  /** Optional override; defaults to now() if omitted */
  importDate?: Date;
}

/**
 * DTO for query parameters when listing import records (FR-07)
 */
export interface ImportQueryDto {
  productId?: string;
  page?: number;
  limit?: number;
}

/**
 * DTO for route params requiring an import record ID
 */
export interface ImportParamsDto {
  id: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

/**
 * Minimal product snapshot embedded in import responses
 */
export interface ImportProductSnapshot {
  id: string;
  code: string;
  name: string;
  unit: string;
}

/**
 * Standard import record response (list view)
 */
export interface ImportRecordResponse {
  id: string;
  importDate: Date;
  productId: string;
  quantity: number;
  costPrice: number;
  createdAt: Date;
  product: ImportProductSnapshot;
}

/**
 * Paginated list wrapper for import records
 */
export interface ImportListResponse {
  data: ImportRecordResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
