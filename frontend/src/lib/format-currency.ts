/**
 * Format currency to Vietnamese Dong
 * @param value - Number value to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "1.000.000 ₫")
 */
export const formatCurrency = (
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
): string => {
  if (value === null || value === undefined) return '--'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    ...options,
  }).format(value)
}

/**
 * Format currency compact (e.g., "1,2 tỷ", "500 triệu")
 * @param value - Number value to format
 * @returns Compact formatted currency string
 */
export const formatCurrencyCompact = (
  value: number | null | undefined,
): string => {
  if (value === null || value === undefined) return '--'

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)} triệu`
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} nghìn`
  }

  return `${value} ₫`
}

/**
 * Convert number to Vietnamese words
 * @param n - Number to convert
 * @returns Vietnamese text representation (e.g., "Một triệu hai trăm nghìn đồng")
 */
export function numberToVietnameseWords(num: number): string {
  if (!num && num !== 0) return ''
  if (num === 0) return 'Không đồng'

  const dv = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  const ch = [
    'không',
    'một',
    'hai',
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín',
  ]

  function readThreeDigits(n: number): string {
    const tr = Math.floor(n / 100)
    const chuc = Math.floor((n % 100) / 10)
    const dv = n % 10
    let result = ''

    if (tr > 0) {
      result += ch[tr] + ' trăm'
      if (chuc === 0 && dv > 0) result += ' linh'
    }

    if (chuc > 1) {
      result += ' ' + ch[chuc] + ' mươi'
      if (dv === 1) result += ' mốt'
      else if (dv === 5) result += ' lăm'
      else if (dv > 0) result += ' ' + ch[dv]
    } else if (chuc === 1) {
      result += ' mười'
      if (dv === 1) result += ' một'
      else if (dv === 5) result += ' lăm'
      else if (dv > 0) result += ' ' + ch[dv]
    } else if (chuc === 0 && dv > 0 && tr > 0) {
      if (dv === 5) result += ' lăm'
      else result += ' ' + ch[dv]
    } else if (chuc === 0 && tr === 0 && dv > 0) {
      result += ch[dv]
    }

    return result.trim()
  }

  const parts: string[] = []
  let unitIndex = 0

  while (num > 0) {
    const n = num % 1000
    if (n !== 0) {
      let segment = readThreeDigits(n)
      if (unitIndex > 0) segment += ' ' + dv[unitIndex]
      parts.unshift(segment)
    }
    num = Math.floor(num / 1000)
    unitIndex++
  }

  const final = parts.join(' ').trim().replace(/\s+/g, ' ')

  // Viết hoa chữ cái đầu + thêm "đồng"
  return final.charAt(0).toUpperCase() + final.slice(1) + ' đồng'
}
