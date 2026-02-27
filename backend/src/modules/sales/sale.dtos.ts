/**
 * Sale DTOs - TypeScript interfaces and types for the Sale module
 */

// ─── Request DTOs ─────────────────────────────────────────────────────────────

/**
 * A single line-item in a sale invoice (FR-09)
 */
export interface SaleItemDto {
  productId: string;
  quantity: number;
}

/**
 * DTO for creating a new sale invoice (FR-08, FR-09)
 */
export interface CreateSaleDto {
  items: SaleItemDto[];
  /** Optional override; defaults to now() if omitted */
  saleDate?: Date;
}

/**
 * DTO for query parameters when listing sales
 */
export interface SaleQueryDto {
  page?: number;
  limit?: number;
}

/**
 * DTO for route params requiring a sale ID
 */
export interface SaleParamsDto {
  id: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

/**
 * Minimal product snapshot embedded in sale detail responses
 */
export interface SaleDetailProductSnapshot {
  id: string;
  code: string;
  name: string;
  unit: string;
}

/**
 * A single detail line within a sale invoice response
 */
export interface SaleDetailResponse {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  /** The sell price captured at the time of the sale */
  sellPrice: number;
  /** Profit for this line = (sellPrice - costPrice) * quantity */
  profit: number;
  product: SaleDetailProductSnapshot;
}

/**
 * Full sale invoice response (used for `GET /:id`)
 */
export interface SaleResponse {
  id: string;
  saleDate: Date;
  totalAmount: number;
  totalProfit: number;
  createdAt: Date;
  updatedAt: Date;
  details: SaleDetailResponse[];
}

/**
 * Slim sale list item response (used for `GET /`)
 */
export interface SaleListItem {
  id: string;
  saleDate: Date;
  totalAmount: number;
  totalProfit: number;
  createdAt: Date;
  itemCount: number;
}

/**
 * Paginated list wrapper for sale records
 */
export interface SaleListResponse {
  data: SaleListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
