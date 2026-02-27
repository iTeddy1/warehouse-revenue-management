import { apiClient } from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ProductResponse, UpdateProductInput } from '../types'
import { productKeys } from './keys'

export const updateProduct = async (
  id: string,
  data: UpdateProductInput,
): Promise<ProductResponse> => {
  return apiClient.patch(`/products/${id}`, data)
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      })
      toast.success('Cập nhật sản phẩm thành công')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm')
    },
  })
}
