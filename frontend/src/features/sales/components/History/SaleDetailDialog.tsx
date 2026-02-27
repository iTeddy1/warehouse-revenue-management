import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'
import { useSale } from '../../api/get-sales'
import type { SaleListItem } from '../../types'

interface SaleDetailDialogProps {
  sale: SaleListItem | null
  onClose: () => void
}

export function SaleDetailDialog({ sale, onClose }: SaleDetailDialogProps) {
  // `bundle-conditional`: only fetch when dialog is open (enabled = !!sale?.id)
  const { data, isLoading } = useSale(sale?.id ?? '')

  const detail = data?.data

  return (
    <Dialog open={!!sale} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Chi tiết đơn hàng
            {detail && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                — {formatDate(detail.saleDate, { showTime: true })}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                  <TableHead className="text-right">Lợi nhuận</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.details.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{row.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.product.code} · {row.product.unit}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.sellPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCurrency(row.sellPrice * row.quantity)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-green-600">
                      {formatCurrency(row.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Footer summary */}
            <div className="flex justify-end gap-6 rounded-lg bg-muted px-4 py-3 text-sm">
              <div className="text-muted-foreground">
                Tổng tiền:{' '}
                <span className="font-bold text-primary tabular-nums">
                  {formatCurrency(detail.totalAmount)}
                </span>
              </div>
              <div className="text-muted-foreground">
                Lợi nhuận:{' '}
                <span className="font-bold text-green-600 tabular-nums">
                  {formatCurrency(detail.totalProfit)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
