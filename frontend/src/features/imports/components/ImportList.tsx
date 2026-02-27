import { TableWrapper } from '@/components/table/TableWrapper'
import { Button } from '@/components/ui/button'
import { useTableState } from '@/hooks/useTableState'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'
import { type TableColumn } from '@/types/table'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useImports } from '../api/get-imports'
import type { ImportRecord } from '../types'
import { ImportFormDialog } from './ImportFormDialog'

export const ImportList = () => {
  const { tableState, tableActions } = useTableState({ initialPageSize: 10 })
  const [isFormOpen, setIsFormOpen] = useState(false)

  const {
    data: importsResponse,
    isLoading,
    error,
    refetch,
  } = useImports({
    page: tableState.pagination.page,
    limit: tableState.pagination.pageSize,
  })

  const columns: TableColumn<ImportRecord>[] = [
    {
      id: 'importDate',
      header: 'Ngày nhập',
      accessorKey: 'importDate',
      cell: ({ row }) =>
        formatDate(row.original.importDate, { showTime: true }),
    },
    {
      id: 'product',
      header: 'Sản phẩm',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.product.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.product.code} · {row.original.product.unit}
          </span>
        </div>
      ),
    },
    {
      id: 'quantity',
      header: 'Số lượng',
      accessorKey: 'quantity',
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {row.original.quantity.toLocaleString('vi-VN')}{' '}
          <span className="text-muted-foreground text-xs">
            {row.original.product.unit}
          </span>
        </span>
      ),
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
      id: 'totalValue',
      header: 'Thành tiền',
      cell: ({ row }) => (
        <span className="tabular-nums font-semibold text-primary">
          {formatCurrency(row.original.quantity * row.original.costPrice)}
        </span>
      ),
    },
  ]

  return (
    <>
      <TableWrapper
        data={importsResponse}
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        columns={columns}
        tableState={tableState}
        tableActions={tableActions}
        headerActions={
          <Button onClick={() => setIsFormOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Tạo phiếu nhập
          </Button>
        }
        renderRow={(record, cols) => (
          <tr key={record.id} className="transition-colors hover:bg-accent/50">
            {cols.map((col) => (
              <td key={col.id} className="px-4 py-3 text-sm">
                {col.cell
                  ? col.cell({ row: { original: record } } as any)
                  : (record as any)[col.accessorKey || '']}
              </td>
            ))}
          </tr>
        )}
      />

      <ImportFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </>
  )
}
