import { Header } from '@/components/layout/Header'
import { AppSidebar } from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { Outlet } from '@tanstack/react-router'

export default function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <Header />
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  )
}
