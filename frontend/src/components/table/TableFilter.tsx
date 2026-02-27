import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type FilterField,
  type FilterState,
  type SortingState,
  type TableColumn,
} from '@/types/table'
import { Filter, Search, X } from 'lucide-react'

export interface TableFilterProps<T = any> {
  searchValue: string
  onSearchChange: (_value: string) => void
  onSearchApply?: () => void
  filters: FilterState
  onFiltersChange: (_filters: FilterState) => void
  sorting: SortingState[]
  onSortingChange: (_sorting: SortingState[]) => void
  columns: TableColumn<T>[]
  filterFields?: FilterField[]
  searchPlaceholder?: string
  showQuickSearch?: boolean
  showAdvancedFilters?: boolean
  className?: string
}

export function TableFilter<T = any>({
  searchValue,
  onSearchChange,
  onSearchApply,
  filters,
  onFiltersChange,
  sorting,
  onSortingChange,
  columns,
  filterFields = [],
  searchPlaceholder = 'Search...',
  showQuickSearch = true,
  showAdvancedFilters = true,
  className,
}: TableFilterProps<T>) {
  const sortableColumns = columns.filter((col) => col.sortable !== false)

  const updateFilter = (key: string, value: unknown) => {
    const newFilters = { ...filters }
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    onFiltersChange(newFilters)
  }

  const removeFilter = (key: string) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
    onSearchChange('')
    onSortingChange([]) // Also clear sorting
    // Also trigger search apply to clear the actual search query
    if (onSearchApply) {
      onSearchApply()
    }
  }

  const toggleSort = (field: string) => {
    const existingSort = sorting.find((s) => s.field === field)

    if (!existingSort) {
      // Replace all sorting with new field (single sort only)
      onSortingChange([{ field, order: 'asc' }])
    } else if (existingSort.order === 'asc') {
      // Change to desc
      onSortingChange([{ field, order: 'desc' }])
    } else {
      // Remove sorting
      onSortingChange([])
    }
  }

  const getSortDirection = (field: string) => {
    return sorting.find((s) => s.field === field)?.order
  }

  const hasActiveFilters =
    Object.keys(filters).length > 0 || searchValue.trim() !== ''

  const renderFilterInput = (filterField: FilterField) => {
    const value = filters[filterField.key] || ''

    if (filterField.type === 'select' && filterField.options) {
      return (
        <Select
          value={value as string}
          onValueChange={(newValue) => updateFilter(filterField.key, newValue)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={filterField.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {filterField.options.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        value={value as string}
        onChange={(e) => updateFilter(filterField.key, e.target.value)}
        placeholder={
          filterField.placeholder || `Enter ${filterField.label.toLowerCase()}`
        }
        type={filterField.type === 'number' ? 'number' : 'text'}
      />
    )
  }

  return (
    <div
      className={`space-y-4 ${className || ''} ${!hasActiveFilters && 'mb-10'}`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Quick Search */}
        {showQuickSearch && (
          <div className="relative flex-1 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSearchApply) {
                      onSearchApply()
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className="pl-9"
                />
              </div>
              {onSearchApply && (
                <Button onClick={onSearchApply} size="sm" variant="outline">
                  Tìm kiếm
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Advanced Filters */}
          {showAdvancedFilters && filterFields.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                  Bộ lọc
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4" align="end">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Bộ lọc</Label>

                  {filterFields.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Không có bộ lọc nào sẵn có
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filterFields.map((filterField) => (
                        <div key={filterField.key} className="space-y-2">
                          <Label className="text-sm">{filterField.label}</Label>
                          {renderFilterInput(filterField)}
                          {Boolean(filters[filterField.key]) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFilter(filterField.key)}
                              className="h-6 text-xs"
                            >
                              Xóa bộ lọc
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Sort Controls */}
          {sortableColumns.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Sắp xếp
                  {sorting.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {sorting.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Sắp xếp cột</Label>
                  <div className="space-y-2">
                    {sortableColumns.map((column) => {
                      const direction = getSortDirection(column.id)
                      return (
                        <div
                          key={column.id}
                          className="flex items-center gap-2"
                        >
                          <Button
                            variant={direction ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleSort(column.id)}
                            className="flex-1 justify-start"
                          >
                            {column.header}
                            {direction && (
                              <span className="ml-auto text-xs">
                                {direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Clear All Button */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Xóa tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 h-6">
          {searchValue.trim() !== '' && (
            <Badge variant="outline" className="gap-1">
              Tìm kiếm: {searchValue}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearchChange('')
                  if (onSearchApply) {
                    onSearchApply() // Trigger search apply to clear the query
                  }
                }}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {Object.entries(filters).map(([key, value]) => {
            const filterField = filterFields.find((f) => f.key === key)
            return (
              <Badge key={key} variant="outline" className="gap-1">
                {filterField?.label || key}: {String(value)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(key)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
          {sorting.map((sort, index) => {
            const column = sortableColumns.find((col) => col.id === sort.field)
            return (
              <Badge key={index} variant="outline" className="gap-1">
                Sắp xếp: {column?.header} {sort.order === 'asc' ? '↑' : '↓'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort(sort.field)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
