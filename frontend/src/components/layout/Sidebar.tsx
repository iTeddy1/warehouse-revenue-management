import {
  IconArrowBackUp,
  IconBriefcase,
  IconCash,
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'

// Navigation item type with role support
export interface NavItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
}

const data: { navMain: NavItem[]; navSecondary: NavItem[] } = {
  navMain: [
    {
      title: 'Bảng điều khiển',
      url: '/',
      icon: IconDashboard,
    },
    {
      title: 'Bán hàng',
      url: '/sales',
      icon: IconUsers,
    },
    {
      title: 'Sản phẩm',
      url: '/products',
      icon: IconUserPlus,
    },
    {
      title: 'Nhập kho',
      url: '/imports',
      icon: IconBriefcase,
    },
    {
      title: 'Báo cáo',
      url: '/reports',
      icon: IconCash,
    },
  ],
  navSecondary: [
    {
      title: 'Cài đặt',
      url: '/setting',
      icon: IconSettings,
    },
    {
      title: 'Sao lưu',
      url: '/backup',
      icon: IconArrowBackUp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to={'/'}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Hệ thống quản lí
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
