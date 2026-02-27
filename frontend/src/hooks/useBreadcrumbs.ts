import { getBreadcrumbText } from '@/lib/breadcrumb-translations'
import { useLocation } from '@tanstack/react-router'

export interface BreadcrumbItem {
  id: string
  label: string
  href?: string
  isCurrentPage?: boolean
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation()
  const pathname = location.pathname

  // Split pathname into segments and filter out empty ones
  const segments = pathname.split('/').filter(Boolean)

  // Always start with home
  const breadcrumbs: BreadcrumbItem[] = [
    {
      id: 'home',
      label: getBreadcrumbText('/', '/'),
      href: '/',
    },
  ]

  // If we're at home, just return home breadcrumb
  if (pathname === '/') {
    breadcrumbs[0].isCurrentPage = true
    return breadcrumbs
  }

  // Build breadcrumbs for each segment
  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Get translated label
    const label = getBreadcrumbText(segment, currentPath)

    breadcrumbs.push({
      id: currentPath,
      label,
      href: isLast ? undefined : currentPath,
      isCurrentPage: isLast,
    })
  })

  return breadcrumbs
}
