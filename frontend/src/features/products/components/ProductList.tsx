import { TableWrapper } from '@/components/table/TableWrapper'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTableState } from '@/hooks/useTableState'
import { formatCurrency } from '@/lib/format-currency'
import { type TableColumn } from '@/types/table'
import { IconDots, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { useDeleteProduct } from '../api/delete-product'
import { useProducts } from '../api/get-products'
import type { ProductEntity } from '../types'
import { ProductFormDialog } from './ProductFormDialog'
import { StockLevelBadge } from './StockLevelBadge'

export const ProductList = () => {
  const { tableState, tableActions } = useTableState({ initialPageSize: 10 })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(
    null,
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ProductEntity | null>(
    null,
  )

  const {
    data: productsResponse,
    isLoading,
    error,
    refetch,
  } = useProducts({
    page: tableState.pagination.page,
    limit: tableState.pagination.pageSize,
    search: tableState.search.query,
  })
  console.log('Products response:', productsResponse)

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleCreate = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEdit = (product: ProductEntity) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (product: ProductEntity) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!productToDelete) return
    deleteProduct(productToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      },
    })
  }

  // ─── Columns ─────────────────────────────────────────────────────────────────
  const columns: TableColumn<ProductEntity>[] = [
    {
      id: 'code',
      header: 'Mã SP',
      accessorKey: 'code',
      cell: ({ row }) => (
        <span className="font-medium text-primary">{row.original.code}</span>
      ),
    },
    {
      id: 'name',
      header: 'Tên sản phẩm',
      accessorKey: 'name',
    },
    {
      id: 'unit',
      header: 'ĐVT',
      accessorKey: 'unit',
    },
    {
      id: 'costPrice',
      header: 'Giá nhập',
      accessorKey: 'costPrice',
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.original.costPrice)}
        </span>
      ),
    },
    {
      id: 'sellPrice',
      header: 'Giá bán',
      accessorKey: 'sellPrice',
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {formatCurrency(row.original.sellPrice)}
        </span>
      ),
    },
    {
      id: 'stockQty',
      header: 'Tồn kho',
      accessorKey: 'stockQty',
      cell: ({ row }) => (
        <StockLevelBadge
          stockQty={row.original.stockQty}
          alertLevel={row.original.alertLevel}
        />
      ),
    },
    {
      id: 'alertLevel',
      header: 'Mức cảnh báo',
      accessorKey: 'alertLevel',
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.alertLevel}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              onClick={(e) => e.stopPropagation()}
              variant="ghost"
              size="icon"
            >
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleEdit(row.original)}>
              <IconEdit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => handleDeleteClick(row.original)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <TableWrapper
        data={productsResponse}
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        columns={columns}
        tableState={tableState}
        tableActions={tableActions}
        headerActions={
          <Button onClick={handleCreate}>
            <IconPlus className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        }
        renderRow={(product, cols) => (
          <tr key={product.id} className="transition-colors hover:bg-accent/50">
            {cols.map((col) => (
              <td key={col.id} className="px-4 py-3 text-sm">
                {col.cell
                  ? col.cell({ row: { original: product } } as any)
                  : (product as any)[col.accessorKey || '']}
              </td>
            ))}
          </tr>
        )}
      />

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
      />

      {/* ─── Delete Confirmation ─────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Bạn có chắc chắn muốn xóa sản phẩm{' '}
                  <strong>{productToDelete?.name}</strong>? Hành động này không
                  thể hoàn tác.
                </p>
                {/* Edge-case warning: product still has stock */}
                {productToDelete && productToDelete.stockQty > 0 && (
                  <p className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                    ⚠️ Sản phẩm này còn{' '}
                    <strong>{productToDelete.stockQty}</strong>{' '}
                    {productToDelete.unit} trong kho. Vui lòng kiểm tra lại
                    trước khi xóa.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
