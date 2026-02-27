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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useProducts } from '@/features/products/api/get-products'
import type { ProductEntity } from '@/features/products/types'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCheck, IconChevronDown } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateImport } from '../api/create-import'

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const importFormSchema = z.object({
  productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
  quantity: z
    .number({ message: 'Số lượng phải là số' })
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng phải ít nhất là 1'),
  costPrice: z
    .number({ message: 'Giá nhập phải là số' })
    .min(0, 'Giá nhập phải >= 0'),
})

export type ImportFormValues = z.infer<typeof importFormSchema>

const defaultValues: ImportFormValues = {
  productId: '',
  quantity: 1,
  costPrice: 0,
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ImportFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ImportFormDialog = ({
  open,
  onOpenChange,
}: ImportFormDialogProps) => {
  const [productSearch, setProductSearch] = useState('')
  const [productPopoverOpen, setProductPopoverOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(
    null,
  )

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues,
  })

  const { mutate: createImport, isPending } = useCreateImport()

  // Fetch products for the combobox (limited, debounced via search)
  const { data: productsResponse } = useProducts({
    search: productSearch,
    limit: 50,
  })
  const products = productsResponse?.data ?? []

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset(defaultValues)
      setSelectedProduct(null)
      setProductSearch('')
    }
  }, [open, form])

  // ── Auto-fill costPrice when product is selected ──────────────────────────
  const handleSelectProduct = (product: ProductEntity) => {
    form.setValue('productId', product.id, { shouldValidate: true })
    form.setValue('costPrice', product.costPrice, { shouldValidate: true })
    setSelectedProduct(product)
    setProductPopoverOpen(false)
  }

  const onSubmit = (values: ImportFormValues) => {
    createImport(values, {
      onSuccess: () => {
        onOpenChange(false)
        form.reset()
        setSelectedProduct(null)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo phiếu nhập kho</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ── Product Combobox ─────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Sản phẩm *</FormLabel>
                  <Popover
                    open={productPopoverOpen}
                    onOpenChange={setProductPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-controls="product-combobox"
                          aria-expanded={productPopoverOpen}
                          className={cn(
                            'w-full justify-between font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {selectedProduct
                            ? `[${selectedProduct.code}] ${selectedProduct.name}`
                            : 'Chọn sản phẩm...'}
                          <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[380px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Tìm theo mã hoặc tên..."
                          value={productSearch}
                          onValueChange={setProductSearch}
                        />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.id}
                                onSelect={() => handleSelectProduct(product)}
                              >
                                <IconCheck
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === product.id
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>
                                    <span className="font-medium text-primary">
                                      [{product.code}]
                                    </span>{' '}
                                    {product.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Tồn: {product.stockQty} {product.unit} • Giá
                                    nhập hiện tại:{' '}
                                    {product.costPrice.toLocaleString('vi-VN')}₫
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Quantity ───────────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Số lượng nhập *
                    {selectedProduct && (
                      <span className="ml-1 font-normal text-muted-foreground">
                        ({selectedProduct.unit})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      step={1}
                      placeholder="1"
                      disabled={isPending}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Cost Price (auto-filled, overridable) ─────────────────── */}
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Giá nhập lô này (VNĐ) *
                    {selectedProduct && (
                      <span className="ml-1 font-normal text-muted-foreground">
                        — tự động điền, có thể sửa
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="0"
                      disabled={isPending}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Actions ───────────────────────────────────────────────── */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang xử lý...' : 'Tạo phiếu nhập'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
