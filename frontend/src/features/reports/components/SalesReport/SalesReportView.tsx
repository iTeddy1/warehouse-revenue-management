import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { memo, startTransition, useState } from 'react'
import { useSalesReport } from '../../api/get-sales-report'
import type { GroupBy, SalesReportRow } from '../../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// rerender-lazy-state-init: expensive date computation as initialiser function
const getDefaultStartDate = () => {
  const d = new Date()
  d.setDate(d.getDate())
  return d.toISOString().slice(0, 10)
}
const getDefaultEndDate = () => new Date().toISOString().slice(0, 10)

/** Format an ISO period string based on the active groupBy bucket */
function formatPeriod(period: string, groupBy: GroupBy): string {
  // js-early-exit: guard against invalid date strings
  if (!period) return '--'
  const d = new Date(period)
  if (isNaN(d.getTime())) return '--'

  if (groupBy === 'year') return d.getFullYear().toString()

  if (groupBy === 'quarter') {
    const q = Math.floor(d.getMonth() / 3) + 1
    return `Q${q}/${d.getFullYear()}`
  }

  if (groupBy === 'month') {
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${m}/${d.getFullYear()}`
  }

  // day or week: show the date of the bucket start
  return formatDate(period)
}

// ─── rendering-hoist-jsx: static lookup tables outside component ──────────────

const GROUP_BY_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'day', label: 'Theo ngày' },
  { value: 'week', label: 'Theo tuần' },
  { value: 'month', label: 'Theo tháng' },
  { value: 'quarter', label: 'Theo quý' },
  { value: 'year', label: 'Theo năm' },
]

const REPORT_COLS = ['Thời gian', 'Doanh thu', 'Lợi nhuận', 'Số lượng SP']

// ─── rerender-memo: isolated summary card to prevent sibling re-renders ────────

interface SummaryCardProps {
  title: string
  value: string
  valueClass?: string
}

const SummaryCard = memo(function SummaryCard({
  title,
  value,
  valueClass = 'text-foreground',
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold tracking-tight ${valueClass}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
})

// ─── rerender-memo: table row extracted to avoid full-table re-renders ─────────

const ReportRow = memo(function ReportRow({
  row,
  groupBy,
}: {
  row: SalesReportRow
  groupBy: GroupBy
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {formatPeriod(row.period, groupBy)}
      </TableCell>
      <TableCell>{formatCurrency(row.totalRevenue)}</TableCell>
      <TableCell className="text-green-600 dark:text-green-400">
        {formatCurrency(row.totalProfit)}
      </TableCell>
      <TableCell>{row.totalItemsSold.toLocaleString('vi-VN')}</TableCell>
    </TableRow>
  )
})

// ─── Main component ───────────────────────────────────────────────────────────

export function SalesReportView() {
  // rerender-lazy-state-init: functions passed as initialisers
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate)
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate)
  const [groupBy, setGroupBy] = useState<GroupBy>('day')

  const {
    data: reportRes,
    isLoading,
    isFetching,
  } = useSalesReport({ startDate, endDate, groupBy })

  // rerender-derived-state: derive values from server response, no local state
  const summary = reportRes?.data?.summary
  const rows = reportRes?.data?.rows ?? []

  return (
    <div className="space-y-6">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo doanh thu</h1>
        <p className="text-sm text-muted-foreground">
          Phân tích doanh thu và lợi nhuận theo kỳ
        </p>
      </div>
      {/* ── Filters ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bộ lọc báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Date range */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                className="w-44"
                value={startDate}
                onChange={(e) => {
                  // rerender-transitions: date change is non-urgent
                  startTransition(() => setStartDate(e.target.value))
                }}
                max={endDate}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                className="w-44"
                value={endDate}
                onChange={(e) => {
                  startTransition(() => setEndDate(e.target.value))
                }}
                min={startDate}
              />
            </div>

            {/* GroupBy */}
            <div className="flex flex-col gap-1.5">
              <Label>Nhóm theo</Label>
              <Select
                value={groupBy}
                onValueChange={(v) => {
                  startTransition(() => setGroupBy(v as GroupBy))
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_BY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Summary totals ────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary !== undefined ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Tổng doanh thu"
            value={formatCurrency(summary.totalRevenue)}
            valueClass="text-primary"
          />
          <SummaryCard
            title="Tổng lợi nhuận"
            value={formatCurrency(summary.totalProfit)}
            valueClass="text-green-600 dark:text-green-400"
          />
          <SummaryCard
            title="Tổng SP đã bán"
            value={summary.totalItemsSold.toLocaleString('vi-VN')}
          />
        </div>
      ) : null}

      {/* ── Data table ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Chi tiết theo kỳ
            {isFetching && !isLoading ? (
              <span className="text-xs font-normal text-muted-foreground">
                Đang cập nhật…
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            // js-early-exit pattern: render empty state immediately
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Không có dữ liệu cho khoảng thời gian đã chọn.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {REPORT_COLS.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <ReportRow key={row.period} row={row} groupBy={groupBy} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
