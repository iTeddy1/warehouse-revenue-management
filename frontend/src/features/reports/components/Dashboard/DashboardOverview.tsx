import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLowStockProducts } from '@/features/products/api/get-products'
import { formatCurrency } from '@/lib/format-currency'
import { memo } from 'react'
import { useDashboard } from '../../api/get-dashboard'
import type { DashboardResponse } from '../../types'

// ─── rerender-memo: extracted memoized card to avoid re-rendering siblings ────

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  /** Tailwind class for the value text color */
  valueClass?: string
}

const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  valueClass = 'text-foreground',
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold tracking-tight ${valueClass}`}>
          {value}
        </p>
        {subtitle !== undefined ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  )
})

// ─── rerender-memo: skeleton variant avoids polluting the main card ───────────

const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-3 w-24" />
      </CardContent>
    </Card>
  )
})

// ─── rendering-hoist-jsx: static column labels outside component ──────────────

const LOW_STOCK_COLS = [
  'Mã SP',
  'Tên sản phẩm',
  'Tồn kho',
  'Ngưỡng cảnh báo',
  'Trạng thái',
]

// ─── Dashboard stats cards ────────────────────────────────────────────────────

function DashboardStats({ stats }: { stats: DashboardResponse }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        title="Doanh thu hôm nay"
        value={formatCurrency(stats.revenueToday)}
        subtitle={`${stats.salesCountToday} đơn hàng`}
        valueClass="text-primary"
      />
      <StatCard
        title="Lợi nhuận hôm nay"
        value={formatCurrency(stats.profitToday)}
        valueClass="text-green-600 dark:text-green-400"
      />
      <StatCard
        title="Tổng tồn kho"
        value={stats.totalStockQuantity.toLocaleString('vi-VN')}
        subtitle="sản phẩm (tất cả SKU)"
      />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardOverview() {
  const { data: dashboardRes, isLoading: statsLoading } = useDashboard()
  const { data: lowStockRes, isLoading: lowStockLoading } =
    useLowStockProducts()

  // rerender-derived-state: extract values from envelope once
  const stats = dashboardRes?.data
  const lowStockItems = lowStockRes?.data ?? []

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan hoạt động kinh doanh hôm nay
        </p>
      </div>
      {/* ── Summary cards ────────────────────────────────────────────── */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : stats !== undefined ? (
        <DashboardStats stats={stats} />
      ) : null}

      {/* ── Low-stock widget ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Cảnh báo tồn kho thấp
            {lowStockItems.length > 0 ? (
              <Badge variant="destructive">{lowStockItems.length}</Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {lowStockLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : lowStockItems.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Tất cả sản phẩm đều có tồn kho đủ.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {LOW_STOCK_COLS.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((product) => {
                  const isCritical = product.stockQty === 0
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">
                        {product.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell
                        className={
                          isCritical
                            ? 'font-bold text-destructive'
                            : 'font-semibold text-amber-600 dark:text-amber-400'
                        }
                      >
                        {product.stockQty}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.alertLevel}
                      </TableCell>
                      <TableCell>
                        {isCritical ? (
                          <Badge variant="destructive">Hết hàng</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-500 text-amber-600 dark:text-amber-400"
                          >
                            Sắp hết
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
