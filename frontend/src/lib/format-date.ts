/**
 * Tùy chọn cho hàm format
 */
interface FormatDateOptions {
  showTime?: boolean // Có hiện giờ phút không?
  separator?: string // Dấu ngăn cách ngày tháng (mặc định là /)
}

/**
 * Format ngày tháng từ dữ liệu Prisma/API
 * @param date - Chuỗi ISO string hoặc Date object
 * @param options - Tùy chọn hiển thị
 * @returns Chuỗi ngày tháng đã format (VD: 05/01/2026)
 */
export const formatDate = (
  date: string | Date | null | undefined,
  options: FormatDateOptions = {},
): string => {
  if (!date) return '--' // Hoặc '' tùy bạn

  // Đảm bảo đầu vào là đối tượng Date
  const d = typeof date === 'string' ? new Date(date) : date

  // Kiểm tra nếu date không hợp lệ
  if (isNaN(d.getTime())) return 'Invalid Date'

  const { showTime = false, separator = '/' } = options

  // Lấy ngày, tháng, năm
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0') // Tháng trong JS bắt đầu từ 0
  const year = d.getFullYear()

  let result = `${day}${separator}${month}${separator}${year}`

  // Nếu cần hiện giờ
  if (showTime) {
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    result += ` ${hours}:${minutes}`
  }

  return result
}
