import { productKeys } from '@/features/products/api/keys'
import { apiClient } from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateSaleInput, SaleApiResponse } from '../types'
import { saleKeys } from './keys'

export const createSale = async (
  data: CreateSaleInput,
): Promise<SaleApiResponse> => apiClient.post('/sales', data)

export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      // Refresh sale history
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() })
      // CRITICAL: refresh products so stockQty reflects the deduction
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo đơn hàng')
    },
  })
}
