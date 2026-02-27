// Breadcrumb translations from English routes to Vietnamese
export const breadcrumbTranslations: Record<string, string> = {
  // Root pages
  '/': 'Trang chủ',
  '/users': 'Người dùng',
  '/projects': 'Dự án',
  '/partners': 'Nhà cung cấp/ chủ đầu tư',
  '/finance': 'Tài chính',
  '/invoices': 'Hóa đơn',

  // Common actions
  new: 'Mới',
  edit: 'Chỉnh sửa',
  detail: 'Chi tiết',
  view: 'Xem',
}

// Function to get translated breadcrumb text
export function getBreadcrumbText(segment: string, fullPath?: string): string {
  // Check full path first for exact matches
  if (fullPath && breadcrumbTranslations[fullPath]) {
    return breadcrumbTranslations[fullPath]
  }

  // Check segment translation
  if (breadcrumbTranslations[segment]) {
    return breadcrumbTranslations[segment]
  }

  // If it looks like an ID (UUID or number), return as is
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment,
    ) ||
    /^\d+$/.test(segment)
  ) {
    return segment
  }

  // Fallback: capitalize first letter
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}
