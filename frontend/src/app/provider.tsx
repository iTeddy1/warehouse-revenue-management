import { store } from '@/app/store'
import { Header } from '@/components/layout/Header'
import { AppSidebar } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { Outlet } from '@tanstack/react-router'
import * as React from 'react'
import { Provider as ReduxStoreProvider } from 'react-redux'

export default function RootLayout() {
  return (
    <ReduxStoreProvider store={store}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 64)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <Header />
          <div className="p-4 lg:p-6">
            <Outlet />
            <Toaster />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ReduxStoreProvider>
  )
}
