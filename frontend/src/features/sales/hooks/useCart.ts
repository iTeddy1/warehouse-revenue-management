import type { ProductEntity } from '@/features/products/types'
import { useCallback, useMemo, useState } from 'react'
import type { CartItem } from '../types'

/**
 * Manages local POS cart state.
 *
 * Best-practice notes applied:
 * - `js-index-maps`            : Internal state stored as Map<productId, CartItem>
 *                                for O(1) add/update/remove operations.
 * - `rerender-functional-setstate` : Every setter uses the functional form so
 *                                callbacks remain stable across renders.
 * - `rerender-derived-state`   : `cartItems`, `totalAmount`, `hasStockError`
 *                                are all derived via useMemo — components
 *                                subscribe to the specific bool/value they
 *                                actually need.
 * - `rerender-memo`            : All action callbacks wrapped in useCallback
 *                                to avoid re-rendering children unnecessarily.
 */
export function useCart() {
  // Internal storage: Map<productId, CartItem> → O(1) lookups
  const [cartMap, setCartMap] = useState<Map<string, CartItem>>(new Map())

  // ── Derived array (stable reference when map is unchanged) ────────────────
  const cartItems = useMemo(() => Array.from(cartMap.values()), [cartMap])

  // `rerender-derived-state`: subscribe to derived value, not raw cartMap
  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.sellPrice * item.quantity,
        0,
      ),
    [cartItems],
  )

  // `rerender-derived-state`: extracted boolean so consumers re-render only
  //  when the error flag itself changes, not on every cartMap mutation.
  const hasStockError = useMemo(
    () => cartItems.some((item) => item.quantity > item.product.stockQty),
    [cartItems],
  )

  // ── Actions ───────────────────────────────────────────────────────────────

  /** If product already in cart → increment qty; otherwise add with qty = 1. */
  const addToCart = useCallback((product: ProductEntity) => {
    // `js-early-exit`: guard before any state mutation
    if (product.stockQty === 0) return

    setCartMap((prev) => {
      const next = new Map(prev)
      const existing = next.get(product.id)
      if (existing) {
        next.set(product.id, { ...existing, quantity: existing.quantity + 1 })
      } else {
        next.set(product.id, { product, quantity: 1 })
      }
      return next
    })
  }, [])

  /** Overwrite quantity for a specific cart item. */
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartMap((prev) => {
      // `js-early-exit`: if item not in cart, nothing to do
      if (!prev.has(productId)) return prev
      const next = new Map(prev)
      const item = next.get(productId)!
      next.set(productId, { ...item, quantity: Math.max(0, quantity) })
      return next
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCartMap((prev) => {
      if (!prev.has(productId)) return prev
      const next = new Map(prev)
      next.delete(productId)
      return next
    })
  }, [])

  const clearCart = useCallback(() => setCartMap(new Map()), [])

  return {
    cartItems,
    totalAmount,
    hasStockError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }
}
