import { ProductList } from '@/features/products/components/ProductList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  return <ProductList />
}
