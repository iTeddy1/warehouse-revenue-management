import { Button } from '@/components/ui/button'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateProduct } from '../api/create-products'
import { useUpdateProduct } from '../api/update-product'
import type { ProductEntity } from '../types'

const productFormSchema = z
  .object({
    code: z.string().min(1, 'Mã sản phẩm không được để trống'),
    name: z.string().min(1, 'Tên sản phẩm không được để trống'),
    unit: z.string().min(1, 'Đơn vị tính không được để trống'),
    costPrice: z
      .number({ message: 'Giá nhập phải là số' })
      .min(1, 'Giá nhập phải > 0'),
    sellPrice: z
      .number({ message: 'Giá bán phải là số' })
      .min(1, 'Giá bán phải > 0'),
    stockQty: z
      .number({ message: 'Số lượng phải là số' })
      .min(1, 'Số lượng tồn kho phải > 0'),
    alertLevel: z
      .number({ message: 'Mức cảnh báo phải là số' })
      .min(1, 'Mức cảnh báo phải > 0'),
  })
  .refine((data) => data.sellPrice > data.costPrice, {
    message: 'Giá bán phải lớn hơn giá nhập',
    path: ['sellPrice'],
  })

type ProductFormValues = z.infer<typeof productFormSchema>

const defaultValues: ProductFormValues = {
  code: '',
  name: '',
  unit: '',
  costPrice: 0,
  sellPrice: 0,
  stockQty: 0,
  alertLevel: 0,
}

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductEntity | null
}

export const ProductFormDialog = ({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) => {
  const isEdit = !!product

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()
  const isPending = isCreating || isUpdating

  // Sync form values when the dialog opens with an existing product
  useEffect(() => {
    if (product && open) {
      form.reset({
        code: product.code,
        name: product.name,
        unit: product.unit,
        costPrice: product.costPrice,
        sellPrice: product.sellPrice,
        stockQty: product.stockQty,
        alertLevel: product.alertLevel,
      })
    } else if (!open) {
      form.reset(defaultValues)
    }
  }, [product, open, form])

  const onSubmit = (values: ProductFormValues) => {
    if (isEdit && product) {
      updateProduct(
        { id: product.id, data: values },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        },
      )
    } else {
      createProduct(values, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Code + Unit */}
            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã sản phẩm *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: SP001"
                        disabled={isPending || isEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị tính *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: Cái, Hộp, Kg"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập tên sản phẩm"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row 2: Cost Price + Sell Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá nhập (VNĐ) *</FormLabel>
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

              <FormField
                control={form.control}
                name="sellPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán (VNĐ) *</FormLabel>
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
            </div>

            {/* Row 3: Stock Qty + Alert Level */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng tồn kho *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        placeholder="0"
                        disabled={isPending}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alertLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức cảnh báo tồn kho *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        placeholder="0"
                        disabled={isPending}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
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
                {isPending ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
