// Common sort types used across all services
export type SortDirection = 'asc' | 'desc'

// Base query interface with common pagination and sort options
export interface BaseQuery {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: SortDirection
}

// Project sort options
export type ProjectSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'code'
  | 'name'
  | 'investor'
  | 'status'
  | 'startDate'
  | 'endDate'

// Contract sort options
export type ContractSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'contractNumber'
  | 'contractName'
  | 'contractorName'
  | 'contractValue'
  | 'signedDate'
  | 'status'

// Contract addendum sort options
export type ContractAddendumSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'addendumNumber'
  | 'title'
  | 'effectiveDate'
  | 'status'
  | 'adjustmentType'
  | 'deltaAmount'
  | 'approvedAt'
  | 'cancelledAt'

// Payment sort options
export type PaymentSortBy =
  | 'createdAt'
  | 'paymentNo'
  | 'total'
  | 'status'
  | 'requestedAt'
  | 'requestedBy'
  | 'companyName'

// Warehouse sort options
export type WarehouseSortBy = 'createdAt' | 'updatedAt' | 'name' | 'location'

// Material entry sort options
export type MaterialEntrySortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'entryNumber'
  | 'name'
  | 'supplierName'
  | 'quantity'
  | 'entryDate'
  | 'status'
  | 'recordedAt'

// Material estimate sort options
export type MaterialEstimateSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'name'
  | 'quantity'
  | 'unit'

// File sort options
export type FileSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'name'
  | 'size'
  | 'mimeType'

// Reports sort options
export type ReportSortBy =
  | 'projectCode'
  | 'projectName'
  | 'totalContractValue'
  | 'grossProfit'
  | 'profitMargin'
  | 'createdAt'
