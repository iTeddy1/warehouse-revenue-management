import { useCart } from '../../hooks/useCart'
import { CartPanel } from './CartPanel'
import { ProductSelection } from './ProductSelection'

/**
 * Two-column POS layout.
 *
 * The cart state lives here (single source of truth) and is passed down to
 * both panels — keeping ProductSelection and CartPanel pure, focused components.
 */
export function POSLayout() {
  const {
    cartItems,
    totalAmount,
    hasStockError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  return (
    // Full viewport height minus the app shell header
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Left: product browser — takes 60% */}
      <div className="flex w-[60%] flex-col overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Chọn sản phẩm</h2>
        <ProductSelection onAdd={addToCart} />
      </div>

      {/* Right: cart / invoice — takes 40%, fills height */}
      <div className="flex w-[40%] flex-col">
        <CartPanel
          cartItems={cartItems}
          totalAmount={totalAmount}
          hasStockError={hasStockError}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
        />
      </div>
    </div>
  )
}
