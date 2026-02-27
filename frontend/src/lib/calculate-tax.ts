export function calculatePriceAfterTax(
  price: number,
  taxRate: number = 8,
): number {
  if (price < 0 || taxRate < 0) {
    throw new Error('Price and tax rate must be non-negative')
  }

  return price * (1 + taxRate / 100)
}
