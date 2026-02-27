import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import { useQuery } from '@tanstack/react-query'
import type {
  ProductEntity,
  ProductResponse,
  ProductsQueryParams,
  ProductsResponse,
} from '../types'
import { productKeys } from './keys'

/**
 * Fetch products with pagination and filters
 * GET /products
 */
export const getProducts = async (
  params: ProductsQueryParams = {},
): Promise<ProductsResponse> => {
  const response = await apiClient.get('/products', { params })
  return response.data
}

/**
 * 3. React Query Hook
 * Usage: const { data, isLoading } = useProducts({ page: 1, limit: 10 })
 */
export const useProducts = (params: ProductsQueryParams = {}) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const getProduct = async (id: string): Promise<ProductResponse> => {
  return apiClient.get(`/products/${id}`)
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  })
}

/**
 * GET /products/low-stock
 * Returns products where stockQty <= alertLevel (FR-14, FR-15)
 */
export const getLowStockProducts = async (): Promise<
  ApiResponse<ProductEntity[]>
> => {
  const response = await apiClient.get('/products/low-stock')
  return response.data
}

export const useLowStockProducts = () =>
  useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: getLowStockProducts,
    staleTime: 1000 * 60 * 2,
  })
