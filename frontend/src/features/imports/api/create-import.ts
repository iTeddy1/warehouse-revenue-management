import { productKeys } from '@/features/products/api/keys'
import { apiClient } from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateImportInput, ImportResponse } from '../types'
import { importKeys } from './keys'

export const createImport = async (
  data: CreateImportInput,
): Promise<ImportResponse> => {
  return apiClient.post('/imports', data)
}

export const useCreateImport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createImport,
    onSuccess: () => {
      // Refresh import list
      queryClient.invalidateQueries({ queryKey: importKeys.lists() })
      // CRITICAL: also refresh product list so stockQty is up-to-date
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast.success('Tạo phiếu nhập thành công')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo phiếu nhập')
    },
  })
}
