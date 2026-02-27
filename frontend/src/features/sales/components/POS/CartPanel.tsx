import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils'
import { IconShoppingCart, IconTrash } from '@tabler/icons-react'
import { memo } from 'react'
import { toast } from 'sonner'
import { useCreateSale } from '../../api/create-sale'
import type { useCart } from '../../hooks/useCart'
import type { CartItem } from '../../types'

// ── Single cart row ───────────────────────────────────────────────────────────
// `rerender-memo`: memoized so sibling-row quantity changes don't re-render
//  every row simultaneously.
const CartRow = memo(function CartRow({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem
  onQuantityChange: (productId: string, qty: number) => void
  onRemove: (productId: string) => void
}) {
  const { product, quantity } = item
  const overStock = quantity > product.stockQty
  const lineTotal = product.sellPrice * quantity

  return (
    <div className="flex items-start gap-2 py-2">
      {/* Product info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(product.sellPrice)} / {product.unit}
        </p>

        {/* FR-11: stock warning */}
        {overStock && (
          <p className="mt-0.5 text-xs font-medium text-destructive">
            Vượt tồn kho (Max: {product.stockQty})
          </p>
        )}
      </div>

      {/* Quantity input */}
      <div className="flex flex-col items-center gap-0.5">
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) =>
            onQuantityChange(product.id, e.target.valueAsNumber || 1)
          }
          // FR-11: red outline when qty > stockQty
          className={cn(
            'h-8 w-20 text-center tabular-nums',
            overStock && 'border-destructive focus-visible:ring-destructive',
          )}
        />
      </div>

      {/* Line total */}
      <p className="w-28 text-right text-sm font-semibold tabular-nums">
        {formatCurrency(lineTotal)}
      </p>

      {/* Remove */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(product.id)}
      >
        <IconTrash className="h-4 w-4" />
      </Button>
    </div>
  )
})

// ── Props ─────────────────────────────────────────────────────────────────────
type CartHook = ReturnType<typeof useCart>

interface CartPanelProps {
  cartItems: CartHook['cartItems']
  totalAmount: CartHook['totalAmount']
  hasStockError: CartHook['hasStockError']
  updateQuantity: CartHook['updateQuantity']
  removeFromCart: CartHook['removeFromCart']
  clearCart: CartHook['clearCart']
}

// ── Main component ────────────────────────────────────────────────────────────
export function CartPanel({
  cartItems,
  totalAmount,
  hasStockError,
  updateQuantity,
  removeFromCart,
  clearCart,
}: CartPanelProps) {
  const { mutate: createSale, isPending } = useCreateSale()

  const isCheckoutDisabled =
    cartItems.length === 0 || hasStockError || isPending

  const handleCheckout = () => {
    // `js-early-exit`: guard before API call
    if (isCheckoutDisabled) return

    createSale(
      {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          clearCart()
          toast.success('Thanh toán thành công!')
        },
      },
    )
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <IconShoppingCart className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Giỏ hàng</h2>
        {cartItems.length > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {cartItems.length} sản phẩm
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4">
        {cartItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <IconShoppingCart className="h-8 w-8 opacity-30" />
            <p>Chưa có sản phẩm nào.</p>
            <p className="text-xs">Nhấn vào sản phẩm bên trái để thêm.</p>
          </div>
        ) : (
          <div className="divide-y">
            {cartItems.map((item) => (
              <CartRow
                key={item.product.id}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Tổng tiền</span>
          <span className="text-2xl font-bold text-primary tabular-nums">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {hasStockError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            Một hoặc nhiều sản phẩm vượt quá số lượng tồn kho.
          </p>
        )}

        <Separator />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={cartItems.length === 0 || isPending}
            onClick={clearCart}
          >
            Xóa giỏ
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={isCheckoutDisabled}
            onClick={handleCheckout}
          >
            {isPending ? 'Đang xử lý...' : 'Thanh toán'}
          </Button>
        </div>
      </div>
    </div>
  )
}
