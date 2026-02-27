# Reusable Table System

A complete pagination, filtering, and sorting system for React applications built with TypeScript, TanStack utilities, and shadcn/ui components.

## Features

- **Pagination**: Page-based navigation with customizable page sizes
- **Filtering**: Dynamic field filtering with different input types
- **Sorting**: Multi-column sorting with visual indicators
- **Search**: Quick search across specified fields
- **URL Synchronization**: Deep linking support with query parameters
- **TypeScript**: Full type safety throughout
- **Extensible**: Easy to customize and extend

## Components

### 1. Core Types (`src/types/table.ts`)

Defines all the TypeScript interfaces used throughout the system:

- `PaginatedResponse<T>`: Backend response format
- `TableState`: Complete table state including pagination, sorting, filters, and search
- `TableColumn<T>`: Column configuration
- `FilterField`: Filter field configuration
- `UseTableOptions`: Hook configuration options

### 2. Table Utilities (`src/lib/table-utils.ts`)

Utility functions for:

- Serializing/deserializing table state to/from URL parameters
- Building query parameters for API calls
- Debouncing user input
- Deep merging state objects

### 3. useTableState Hook (`src/hooks/useTableState.ts`)

Custom React hook that manages:

- Pagination state (page, pageSize)
- Sorting state (field, direction)
- Filter state (key-value pairs)
- Search state (query, fields)
- URL synchronization (optional)
- State persistence across navigation

### 4. TablePagination Component (`src/components/table/TablePagination.tsx`)

A comprehensive pagination component featuring:

- First/Previous/Next/Last navigation
- Page size selector
- Page number display with ellipsis
- Item count information
- Compact mode option

### 5. TableFilter Component (`src/components/table/TableFilter.tsx`)

A flexible filtering component with:

- Quick search input
- Advanced filter popover
- Dynamic filter fields (text, select, number, etc.)
- Sort controls
- Active filter display with badges
- Clear all functionality

## Usage Example

```tsx
import { useTableState } from '@/hooks/useTableState'
import { TableFilter } from '@/components/table/TableFilter'
import { TablePagination } from '@/components/table/TablePagination'

interface Project {
  id: string
  name: string
  status: 'active' | 'inactive' | 'completed'
  budget: number
  manager: string
}

const columns: TableColumn<Project>[] = [
  {
    id: 'name',
    header: 'Project Name',
    accessorKey: 'name',
    sortable: true,
    filterable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    filterable: true,
  },
  // ... more columns
]

const filterFields: FilterField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Completed', value: 'completed' },
    ],
  },
  {
    key: 'manager',
    label: 'Manager',
    type: 'text',
    placeholder: 'Enter manager name',
  },
]

function ProjectTable() {
  const {
    pagination,
    sorting,
    filters,
    search,
    setPagination,
    setSorting,
    setFilters,
    setSearch,
    buildQueryString,
  } = useTableState({
    initialPageSize: 10,
    enableSorting: true,
    enableFiltering: true,
    enableSearch: true,
    searchFields: ['name', 'manager'],
    filterFields,
    syncWithUrl: true,
  })

  const [data, setData] = useState<PaginatedResponse<Project>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  })

  // Fetch data when table state changes
  useEffect(() => {
    fetchProjects({
      page: pagination.page,
      pageSize: pagination.pageSize,
      sort: sorting,
      filters,
      search: search.query,
    }).then(setData)
  }, [pagination, sorting, filters, search])

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <TableFilter
        searchValue={search.query}
        onSearchChange={(query) => setSearch({ query })}
        filters={filters}
        onFiltersChange={setFilters}
        sorting={sorting}
        onSortingChange={setSorting}
        columns={columns}
        filterFields={filterFields}
      />

      {/* Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id} className="px-4 py-3 text-left">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td key={column.id} className="px-4 py-3">
                    {column.cell
                      ? column.cell({ row: { original: item } })
                      : item[column.accessorKey!]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={data.page}
        totalPages={Math.ceil(data.total / data.pageSize)}
        pageSize={data.pageSize}
        totalItems={data.total}
        onPageChange={(page) => setPagination({ page })}
        onPageSizeChange={(pageSize) => setPagination({ pageSize, page: 1 })}
      />
    </div>
  )
}
```

## Backend Integration

The system expects backend APIs to:

1. **Accept query parameters** for pagination, sorting, filtering, and search
2. **Return paginated responses** in the expected format:

```typescript
interface PaginatedResponse<T> {
  items: T[] // Array of data items
  total: number // Total count of items (before pagination)
  page: number // Current page number
  pageSize: number // Items per page
}
```

### Example API Call

```typescript
// The hook automatically builds query parameters
const queryParams = buildQueryString() // "?page=2&pageSize=20&sort=name:asc&status=active&search=project"

// Use with fetch or your preferred HTTP client
const response = await fetch(`/api/projects${queryParams}`)
const data: PaginatedResponse<Project> = await response.json()
```

## Configuration Options

### useTableState Options

```typescript
interface UseTableOptions {
  initialPageSize?: number // Default: 10
  enableSorting?: boolean // Default: true
  enableFiltering?: boolean // Default: true
  enableSearch?: boolean // Default: true
  searchFields?: string[] // Fields to search in
  filterFields?: FilterField[] // Available filter fields
  syncWithUrl?: boolean // Enable URL synchronization (default: false)
}
```

### Filter Field Types

```typescript
interface FilterField {
  key: string // Field identifier
  label: string // Display label
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean'
  options?: Array<{ label: string; value: string | number }> // For select type
  placeholder?: string // Input placeholder
}
```

## URL Synchronization

When `syncWithUrl: true` is enabled:

- Table state is automatically synced with URL query parameters
- Users can bookmark and share filtered/sorted table views
- Browser back/forward navigation works correctly
- State persists across page refreshes

Example URL with table state:

```
/projects?page=2&pageSize=20&sort=name:asc,budget:desc&status=active&manager=john&search=redesign
```

## Styling

All components use shadcn/ui classes and are fully customizable. The system includes:

- Consistent spacing and typography
- Responsive design
- Dark mode support (via shadcn/ui)
- Accessible components with proper ARIA labels
- Loading states and empty states

## Extensibility

The system is designed to be extended:

1. **Add new filter types** by extending the `FilterField` interface
2. **Customize table rendering** by providing custom cell renderers
3. **Add new sorting modes** by extending the sorting logic
4. **Integrate with different backends** by adapting the query building logic
5. **Add bulk actions** by extending the table state

## Dependencies

- React 18+
- TypeScript 4.5+
- shadcn/ui components
- Lucide React (for icons)
- TanStack Router (optional, for URL synchronization)

## Files Structure

```
src/
├── types/
│   └── table.ts                    # TypeScript interfaces
├── lib/
│   └── table-utils.ts             # Utility functions
├── hooks/
│   └── useTableState.ts           # Main table state hook
└── components/
    └── table/
        ├── TablePagination.tsx # Pagination component
        ├── TableFilter.tsx     # Filter component
        └── README.md              # This file
```
