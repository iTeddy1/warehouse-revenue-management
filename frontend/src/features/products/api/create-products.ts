import { apiClient } from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateProductInput, ProductResponse } from '../types'
import { productKeys } from './keys'

export const createProduct = async (
  data: CreateProductInput,
): Promise<ProductResponse> => {
  return apiClient.post('/products', data)
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate all product list queries to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast.success('Tạo sản phẩm thành công')
    },
    onError: (error: any) => {
      console.error('Error creating product:', error.response.data.message)
      toast.error(
        error.response.data.message || 'Có lỗi xảy ra khi tạo sản phẩm',
      )
    },
  })
}
