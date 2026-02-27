/**
 * Interface cho Pagination Metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: PaginationMeta
}

export interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

/**
 * ERROR RESPONSE
 */
export interface ApiError {
  success: false
  message: string
  statusCode: number
  code: string
  errors?: Record<string, string[]>
}
