import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useProducts } from '@/features/products/api/get-products'
import type { ProductEntity } from '@/features/products/types'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/lib/format-currency'
import { IconSearch, IconShoppingCartPlus } from '@tabler/icons-react'
import { ChangeEvent, memo, startTransition, useState } from 'react'

// ── Product Card ──────────────────────────────────────────────────────────────
// `rerender-memo`: extracted as a separate memoized component so a cart update
//  that changes nothing about the product grid doesn't re-render every card.
const ProductCard = memo(function ProductCard({
  product,
  onAdd,
}: {
  product: ProductEntity
  onAdd: (p: ProductEntity) => void
}) {
  const outOfStock = product.stockQty === 0

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => onAdd(product)}
      className={[
        'group relative flex h-full flex-col rounded-lg border bg-card p-3 text-left shadow-sm',
        'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        outOfStock
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:border-primary hover:shadow-md',
      ].join(' ')}
    >
      {/* Add-to-cart icon (visible on hover) */}
      {!outOfStock && (
        <IconShoppingCartPlus className="absolute right-2 top-2 h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      <p className="line-clamp-2 text-sm font-medium leading-snug">
        {product.name}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{product.code}</p>

      <div className="mt-auto pt-2">
        <p className="text-sm font-semibold text-primary">
          {formatCurrency(product.sellPrice)}
        </p>
        <div className="mt-1 flex items-center gap-1">
          {outOfStock ? (
            <Badge variant="destructive" className="text-xs">
              Hết hàng
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              Tồn: {product.stockQty} {product.unit}
            </span>
          )}
        </div>
      </div>
    </button>
  )
})

// ── Main component ────────────────────────────────────────────────────────────
interface ProductSelectionProps {
  onAdd: (product: ProductEntity) => void
}

export function ProductSelection({ onAdd }: ProductSelectionProps) {
  const [inputValue, setInputValue] = useState('')

  // `rerender-dependencies`: debounce with primitive string dependency so the
  //  effect only fires once the user pauses, not on every keystroke.
  const search = useDebounce(inputValue, 350)

  const { data, isLoading } = useProducts({ search, limit: 60 })
  const products = data?.data ?? []

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    // `rerender-transitions`: updating search is non-urgent — wrap in
    //  startTransition so urgent interactions (clicks) are not blocked.
    startTransition(() => setInputValue(e.target.value))
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Search bar */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Tìm sản phẩm theo tên hoặc mã..."
          value={inputValue}
          onChange={handleSearchChange}
        />
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Không tìm thấy sản phẩm.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
