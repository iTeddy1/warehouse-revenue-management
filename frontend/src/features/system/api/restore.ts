import { apiClient } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Upload a .sql file to POST /system/restore.
 * The server executes psql to restore the database from the file.
 */
export const restoreBackup = async (file: File): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file, file.name)

  await apiClient.post('/system/restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Restoring can take a while on large dumps
    timeout: 10 * 60 * 1000, // 10 minutes
  })
}

export const useRestore = () => {
  return useMutation({
    mutationFn: restoreBackup,
    onSuccess: () => {
      toast.success('Phục hồi dữ liệu thành công')
    },
    onError: (error: any) => {
      console.error('Restore error:', error)
      toast.error(
        error?.response?.data?.message ?? 'Có lỗi xảy ra khi phục hồi dữ liệu',
      )
    },
  })
}
