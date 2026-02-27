import { Badge } from '@/components/ui/badge'

interface StockLevelBadgeProps {
  stockQty: number
  alertLevel: number
  className?: string
}

/**
 * Shows the current stock quantity.
 * - stockQty === 0              → destructive (Out of Stock)
 * - 0 < stockQty <= alertLevel  → warning yellow  (Low Stock)
 * - stockQty > alertLevel       → plain number    (normal)
 */
export const StockLevelBadge = ({
  stockQty,
  alertLevel,
  className = '',
}: StockLevelBadgeProps) => {
  if (stockQty === 0) {
    return (
      <Badge variant="destructive" className={className}>
        Hết hàng (0)
      </Badge>
    )
  }

  if (stockQty <= alertLevel) {
    return (
      <Badge
        variant="outline"
        className={`border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 ${className}`}
      >
        Sắp hết ({stockQty})
      </Badge>
    )
  }

  return <span className={`tabular-nums ${className}`}>{stockQty}</span>
}
