import RootLayout from '@/pages/layout/RootLayout'
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => {
    // Check if we're on the login page
    const isLoginPage = window.location.pathname === '/login'

    // If login page, render outlet directly without layout
    if (isLoginPage) {
      return <Outlet />
    }

    // Otherwise, render with layout
    return <RootLayout />
  },
})
