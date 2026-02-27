import { AllowedRoles, UserRoleType } from '@/config/permissions'
import { usePermission } from '@/hooks/use-permission'
import { ReactNode } from 'react'

interface RoleGuardProps {
  /**
   * Allowed roles from RBAC config or custom array
   */
  allowedRoles: AllowedRoles | UserRoleType[]
  /**
   * Content to render if user has permission
   */
  children: ReactNode
  /**
   * Optional fallback content when user doesn't have permission
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode
}

/**
 * RoleGuard Component
 *
 * Conditionally renders children based on user's role.
 * Use this to hide/show UI elements based on permissions.
 *
 * @example
 * ```tsx
 * // Using RBAC config
 * <RoleGuard allowedRoles={RBAC.SYSTEM.MANAGE_USERS}>
 *   <Button>Delete User</Button>
 * </RoleGuard>
 *
 * // With fallback
 * <RoleGuard
 *   allowedRoles={['ADMIN', 'MANAGER']}
 *   fallback={<span>View Only</span>}
 * >
 *   <Button>Edit</Button>
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { hasPermission } = usePermission()

  if (!hasPermission(allowedRoles as AllowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default RoleGuard
