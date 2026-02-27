import { apiClient } from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productKeys } from './keys'

export const deleteProduct = async (id: string) => {
  return apiClient.delete(`/products/${id}`)
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast.success('Xóa sản phẩm thành công')
    },
    onError: (error: any) => {
      console.error('Error deleting product:', error.response)
      toast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm',
      )
    },
  })
}
