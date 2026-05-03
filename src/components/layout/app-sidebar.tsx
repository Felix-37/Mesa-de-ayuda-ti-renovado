'use client'

import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import type { AppView } from '@/lib/types'
import { getRoleLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Columns3,
  Ticket,
  Users,
  LogOut,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ReactNode
  view: AppView
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="size-5" />,
    view: 'dashboard',
  },
  {
    label: 'Tablero Kanban',
    icon: <Columns3 className="size-5" />,
    view: 'kanban',
  },
  {
    label: 'Tickets',
    icon: <Ticket className="size-5" />,
    view: 'tickets',
  },
  {
    label: 'Usuarios',
    icon: <Users className="size-5" />,
    view: 'users',
    roles: ['ADMIN'],
  },
]

export function AppSidebar() {
  const { currentUser, currentView, setCurrentView, sidebarOpen, setSidebarOpen, logout } = useAppStore()

  if (!currentUser) return null

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(currentUser.role)
  )

  const userInitials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-uniajc-yellow text-uniajc-blue-dark'
      case 'AGENT':
        return 'bg-green-500 text-white'
      default:
        return 'bg-white/20 text-white'
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-uniajc-blue text-white flex flex-col transition-transform duration-300 ease-in-out w-72 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-2">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src="/logo.png"
              alt="UNIAJC Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm leading-tight truncate">
              Mesa de Ayuda TI
            </h2>
            <p className="text-xs text-white/60 truncate">UNIAJC</p>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10 shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>

        <Separator className="bg-white/15 mx-4" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => {
            const isActive = currentView === item.view
            return (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-uniajc-yellow text-uniajc-blue-dark shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <Separator className="bg-white/15 mx-4" />

        {/* User Section */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border-2 border-uniajc-yellow">
              {currentUser.avatar && (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              )}
              <AvatarFallback className="bg-uniajc-blue-light text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser.name}
              </p>
              <Badge
                className={`text-[10px] px-2 py-0 h-5 rounded-full border-0 font-semibold mt-0.5 ${getRoleBadgeColor(currentUser.role)}`}
              >
                {getRoleLabel(currentUser.role)}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
    </>
  )
}
