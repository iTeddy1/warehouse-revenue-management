import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

/**
 * Props for the AsyncSelect component
 * @template T - The type of items being fetched
 */
export interface AsyncSelectProps<T> {
  /** Current selected value (ID) */
  value?: string
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Function to fetch items from API */
  fetcher: (params: { search: string }) => Promise<T[]>
  /** Field to display as label (e.g., 'name', 'fullName') */
  labelKey: keyof T
  /** Field to use as value/ID (e.g., 'id') */
  valueKey: keyof T
  /** Placeholder text when nothing is selected */
  placeholder?: string
  /** Placeholder text for search input */
  searchPlaceholder?: string
  /** Text to show when no results found */
  emptyText?: string
  /** Custom render function for options */
  renderOption?: (item: T) => ReactNode
  /** Whether the select is disabled */
  disabled?: boolean
  /** Unique key for React Query cache */
  queryKey: string
  /** Optional: pre-selected item to show label before first search */
  selectedItem?: T | null
  /** Optional: className for the trigger button */
  className?: string
}

/**
 * A generic async select component with server-side search.
 * Uses React Query for data fetching and shadcn/ui for UI.
 *
 * @example
 * ```tsx
 * <AsyncSelect
 *   value={selectedPartnerId}
 *   onChange={setSelectedPartnerId}
 *   fetcher={({ search }) => getPartners({ search, limit: 20 }).then(r => r.data)}
 *   labelKey="name"
 *   valueKey="id"
 *   queryKey="partners-select"
 *   placeholder="Chọn đối tác"
 *   searchPlaceholder="Tìm kiếm..."
 * />
 * ```
 */
export function AsyncSelect<T extends object>({
  value,
  onChange,
  fetcher,
  labelKey,
  valueKey,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  emptyText = 'Không tìm thấy kết quả.',
  renderOption,
  disabled = false,
  queryKey,
  selectedItem,
  className,
}: AsyncSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Debounce search term to avoid too many API calls
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Fetch data using React Query
  const { data: items = [], isLoading } = useQuery({
    queryKey: [queryKey, debouncedSearch],
    queryFn: () => fetcher({ search: debouncedSearch }),
    enabled: open, // Only fetch when dropdown is open
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Find the selected item from the list or use the provided selectedItem
  const selectedLabel = useCallback(() => {
    if (!value) return null

    // First check in fetched items
    const found = items.find((item) => String(item[valueKey]) === value)
    if (found) return String(found[labelKey])

    // Fall back to provided selectedItem
    if (selectedItem) return String(selectedItem[labelKey])

    return null
  }, [value, items, valueKey, labelKey, selectedItem])

  const handleSelect = (item: T) => {
    const newValue = String(item[valueKey])
    onChange(newValue === value ? '' : newValue)
    setOpen(false)
    setSearchTerm('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-controls="combo-box"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <span className="truncate">{selectedLabel() || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Đang tải...
                </span>
              </div>
            ) : items.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {items.map((item) => {
                  const itemValue = String(item[valueKey])
                  const itemLabel = String(item[labelKey])
                  const isSelected = value === itemValue

                  return (
                    <CommandItem
                      key={itemValue}
                      value={itemValue}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {renderOption ? (
                        renderOption(item)
                      ) : (
                        <span className="truncate">{itemLabel}</span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default AsyncSelect
