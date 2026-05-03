'use client'

import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import type { AppView, UserRole } from '@/lib/types'
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
  PlusCircle,
  UserCircle,
  Settings,
  LogOut,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ReactNode
  view: AppView
  action?: 'new-ticket'
  roles: UserRole[]
  section?: 'main' | 'bottom'
}

const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="size-5" />,
    view: 'dashboard',
    roles: ['USER', 'AGENT', 'ADMIN'],
  },
  {
    label: 'Mis Tickets',
    icon: <Ticket className="size-5" />,
    view: 'my-tickets',
    roles: ['USER'],
  },
  {
    label: 'Tablero Kanban',
    icon: <Columns3 className="size-5" />,
    view: 'kanban',
    roles: ['AGENT', 'ADMIN'],
  },
  {
    label: 'Tickets',
    icon: <Ticket className="size-5" />,
    view: 'tickets',
    roles: ['AGENT', 'ADMIN'],
  },
  {
    label: 'Usuarios',
    icon: <Users className="size-5" />,
    view: 'users',
    roles: ['ADMIN'],
  },
]

const newTicketItem: NavItem = {
  label: 'Nuevo Ticket',
  icon: <PlusCircle className="size-5" />,
  view: 'dashboard', // not navigational
  action: 'new-ticket',
  roles: ['USER', 'AGENT', 'ADMIN'],
}

const bottomNavItems: NavItem[] = [
  {
    label: 'Mi Perfil',
    icon: <UserCircle className="size-5" />,
    view: 'profile',
    roles: ['USER', 'AGENT', 'ADMIN'],
  },
  {
    label: 'Configuración',
    icon: <Settings className="size-5" />,
    view: 'settings',
    roles: ['USER', 'AGENT', 'ADMIN'],
  },
]

export function AppSidebar() {
  const { currentUser, currentView, setCurrentView, sidebarOpen, setSidebarOpen, setTicketFormOpen, logout } = useAppStore()

  if (!currentUser) return null

  const filteredMainItems = mainNavItems.filter((item) =>
    item.roles.includes(currentUser.role)
  )
  const filteredBottomItems = bottomNavItems.filter((item) =>
    item.roles.includes(currentUser.role)
  )
  const showNewTicket = newTicketItem.roles.includes(currentUser.role)

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

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'new-ticket') {
      setTicketFormOpen(true)
    } else {
      setCurrentView(item.view)
    }
    setSidebarOpen(false)
  }

  const isActive = (view: AppView) => currentView === view

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
        {/* Header with Logo */}
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

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMainItems.map((item) => {
            const active = isActive(item.view)
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-uniajc-yellow text-uniajc-blue-dark shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}

          {/* Nuevo Ticket Button */}
          {showNewTicket && (
            <>
              <Separator className="bg-white/15 my-2" />
              <button
                onClick={() => handleNavClick(newTicketItem)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 bg-uniajc-yellow text-uniajc-blue-dark hover:bg-uniajc-yellow-light shadow-md hover:shadow-lg"
              >
                <PlusCircle className="size-5" />
                <span>Nuevo Ticket</span>
              </button>
            </>
          )}
        </nav>

        {/* Bottom Navigation - Profile & Settings */}
        <div className="px-3 pb-1">
          <Separator className="bg-white/15" />
          <div className="pt-2 space-y-1">
            {filteredBottomItems.map((item) => {
              const active = isActive(item.view)
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-uniajc-yellow text-uniajc-blue-dark shadow-md'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 pt-2 space-y-3">
          <Separator className="bg-white/15" />
          <div className="flex items-center gap-3 pt-2">
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
