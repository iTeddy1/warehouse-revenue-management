import { TableWrapper } from '@/components/table/TableWrapper'
import { useTableState } from '@/hooks/useTableState'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'
import { type TableColumn } from '@/types/table'
import { useState } from 'react'
import { useSales } from '../../api/get-sales'
import type { SaleListItem } from '../../types'
import { SaleDetailDialog } from './SaleDetailDialog'

export function SaleList() {
  const { tableState, tableActions } = useTableState({ initialPageSize: 10 })
  const [selectedSale, setSelectedSale] = useState<SaleListItem | null>(null)

  const {
    data: salesResponse,
    isLoading,
    error,
    refetch,
  } = useSales({
    page: tableState.pagination.page,
    limit: tableState.pagination.pageSize,
  })

  const columns: TableColumn<SaleListItem>[] = [
    {
      id: 'saleDate',
      header: 'Ngày bán',
      accessorKey: 'saleDate',
      cell: ({ row }) => formatDate(row.original.saleDate, { showTime: true }),
    },
    {
      id: 'itemCount',
      header: 'Số mặt hàng',
      accessorKey: 'itemCount',
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.itemCount}</span>
      ),
    },
    {
      id: 'totalAmount',
      header: 'Tổng tiền',
      accessorKey: 'totalAmount',
      cell: ({ row }) => (
        <span className="tabular-nums font-semibold">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      id: 'totalProfit',
      header: 'Lợi nhuận',
      accessorKey: 'totalProfit',
      cell: ({ row }) => (
        <span className="tabular-nums font-semibold text-green-600">
          {formatCurrency(row.original.totalProfit)}
        </span>
      ),
    },
  ]

  return (
    <>
      <TableWrapper
        data={salesResponse}
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        columns={columns}
        tableState={tableState}
        tableActions={tableActions}
        renderRow={(sale, cols) => (
          <tr
            key={sale.id}
            className="cursor-pointer transition-colors hover:bg-accent/50"
            onClick={() => setSelectedSale(sale)}
          >
            {cols.map((col) => (
              <td key={col.id} className="px-4 py-3 text-sm">
                {col.cell
                  ? col.cell({ row: { original: sale } } as any)
                  : (sale as any)[col.accessorKey || '']}
              </td>
            ))}
          </tr>
        )}
      />

      <SaleDetailDialog
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </>
  )
}
