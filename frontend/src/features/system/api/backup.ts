import { apiClient } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Call POST /system/backup.
 * The server streams a plain-SQL pg_dump file.
 * We receive it as a Blob and trigger a browser download.
 */
export const downloadBackup = async (): Promise<void> => {
  const response = await apiClient.post(
    '/system/backup',
    {},
    {
      responseType: 'blob',
      // Backup can take a while on large databases
      timeout: 5 * 60 * 1000, // 5 minutes
    },
  )

  // Derive the filename from the Content-Disposition header if present
  const contentDisposition: string =
    (response.headers as Record<string, string>)['content-disposition'] ?? ''
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
  const filename = filenameMatch
    ? filenameMatch[1]
    : `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`

  // Create a temporary anchor and click it to trigger the download
  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data as ArrayBuffer])
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const useBackup = () => {
  return useMutation({
    mutationFn: downloadBackup,
    onSuccess: () => {
      toast.success('Tạo bản sao lưu thành công – file đang được tải về')
    },
    onError: (error: any) => {
      console.error('Backup error:', error)
      toast.error(
        error?.response?.data?.message ?? 'Có lỗi xảy ra khi tạo bản sao lưu',
      )
    },
  })
}
