import { ReactNode } from 'react'

import { TableFilter } from '@/components/table/TableFilter'
import { TablePagination } from '@/components/table/TablePagination'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/loading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type FilterField, type TableColumn } from '@/types/table'

import type { PaginatedApiResponse } from '@/types/api'

interface TableState {
  pagination: { page: number; pageSize: number }
  sorting: Array<{ field: string; order: 'asc' | 'desc' }>
  filters: Record<string, any>
  search: { inputValue?: string; query?: string }
}

interface TableActions {
  setPagination: (
    _paginationUpdate: Partial<{ page: number; pageSize: number }>,
  ) => void
  setSorting: (
    _sortingUpdate: Array<{ field: string; order: 'asc' | 'desc' }>,
  ) => void
  setFilters: (_filtersUpdate: Record<string, any>) => void
  setSearchInput: (_searchValue: string) => void
  applySearch: () => void
}

interface TableWrapperProps<T> {
  // Data and state
  data?: PaginatedApiResponse<T>
  isLoading: boolean
  error: Error | null
  onRefetch: () => void

  // Table configuration
  columns: TableColumn<T>[]
  filterFields?: FilterField[]
  searchPlaceholder?: string

  // Table state and actions
  tableState: TableState
  tableActions: TableActions

  // Custom content
  emptyState?: {
    title: string
    description: string
    action?: ReactNode
  }
  headerActions?: ReactNode

  // Table rendering
  renderRow?: (_item: T, _columns: TableColumn<T>[]) => ReactNode
  className?: string
}

export function TableWrapper<T extends { id: string }>({
  data,
  isLoading,
  error,
  onRefetch,
  columns,
  filterFields = [],
  searchPlaceholder = 'Tìm kiếm...',
  tableState,
  tableActions,
  emptyState,
  headerActions,
  renderRow,
  className,
}: TableWrapperProps<T>) {
  const { sorting, filters, search } = tableState

  const { setPagination, setSorting, setFilters, setSearchInput, applySearch } =
    tableActions

  // Default row renderer
  const defaultRenderRow = (item: T, tableColumns: TableColumn<T>[]) => (
    <TableRow key={item.id}>
      {tableColumns.map((column) => (
        <TableCell
          key={column.id}
          className="text-base whitespace-normal break-words"
        >
          {column.cell
            ? column.cell({ row: { original: item } })
            : column.accessorKey
              ? String((item as any)[column.accessorKey] || '')
              : ''}
        </TableCell>
      ))}
    </TableRow>
  )

  const rowRenderer = renderRow || defaultRenderRow

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="flex items-center justify-between gap-4">
          <TableFilter
            searchValue={search.inputValue || ''}
            onSearchChange={setSearchInput}
            onSearchApply={applySearch}
            filters={filters}
            onFiltersChange={setFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            columns={columns}
            filterFields={filterFields}
            searchPlaceholder={searchPlaceholder}
            className="opacity-50 flex-1"
          />
          {headerActions && <div className="opacity-50">{headerActions}</div>}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id} className="text-base">
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton rows={5} columns={columns.length} />
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Loading...</div>
          <div className="opacity-50">
            <TablePagination
              currentPage={1}
              totalPages={1}
              pageSize={10}
              totalItems={0}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
            />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="flex items-center justify-between gap-4">
          <TableFilter
            searchValue={search.inputValue || ''}
            onSearchChange={setSearchInput}
            onSearchApply={applySearch}
            filters={filters}
            onFiltersChange={setFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            columns={columns}
            filterFields={filterFields}
            searchPlaceholder={searchPlaceholder}
            className="opacity-50 flex-1"
          />
          {headerActions && <div className="opacity-50">{headerActions}</div>}
        </div>
        <ErrorState
          message={error.message || 'Không thể tải dữ liệu'}
          onRetry={onRefetch}
        />
      </div>
    )
  }

  // Empty state
  if (
    !data?.data.length &&
    !search.query &&
    Object.keys(filters).length === 0
  ) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="flex items-center justify-between gap-4">
          <TableFilter
            searchValue={search.inputValue || ''}
            onSearchChange={setSearchInput}
            onSearchApply={applySearch}
            filters={filters}
            onFiltersChange={setFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            columns={columns}
            filterFields={filterFields}
            searchPlaceholder={searchPlaceholder}
            className="flex-1"
          />
          {headerActions}
        </div>
        {emptyState && (
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            action={emptyState.action}
          />
        )}
      </div>
    )
  }

  // Main table with data
  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Filter and Search Controls */}
      <div className="flex items-center justify-between gap-4">
        <TableFilter
          searchValue={search.inputValue || ''}
          onSearchChange={setSearchInput}
          onSearchApply={applySearch}
          filters={filters}
          onFiltersChange={setFilters}
          sorting={sorting}
          onSortingChange={setSorting}
          columns={columns}
          filterFields={filterFields}
          searchPlaceholder={searchPlaceholder}
          className="flex-1"
        />
        <div className="mb-10">{headerActions}</div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className="text-base">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((item) => rowRenderer(item, columns))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-32 text-center"
                >
                  <div className="space-y-2">
                    <p>Không có dữ liệu nào phù hợp với bộ lọc hiện tại.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchInput('')
                        applySearch()
                        setFilters({})
                        setSorting([]) // Also clear sorting
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {data && data.pagination.total > 0 && (
        <TablePagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          pageSize={data.pagination.limit}
          totalItems={data.pagination.total}
          onPageChange={(page) => setPagination({ page })}
          onPageSizeChange={(pageSize) => setPagination({ pageSize, page: 1 })}
          showPageInfo
          showPageSizeSelector
        />
      )}
    </div>
  )
}
