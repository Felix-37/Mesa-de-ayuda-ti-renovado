'use client'

import { useAppStore } from '@/lib/store'
import { getRoleLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationPanel } from '@/components/notifications/notification-panel'
import {
  Menu,
  Search,
  LogOut,
  User,
  Settings,
  Download,
} from 'lucide-react'
import type { AppView } from '@/lib/types'

const viewTitles: Record<AppView, string> = {
  dashboard: 'Tablero de Gestión',
  kanban: 'Tablero Kanban',
  tickets: 'Todos los Tickets',
  'my-tickets': 'Mis Tickets',
  'ticket-detail': 'Detalle de Ticket',
  users: 'Gestión de Usuarios',
  profile: 'Mi Perfil',
  settings: 'Configuración',
}

export function AppHeader() {
  const {
    currentUser,
    currentView,
    searchQuery,
    setSearchQuery,
    setSidebarOpen,
    setCurrentView,
    logout,
  } = useAppStore()

  if (!currentUser) return null

  const userInitials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-accent-yellow-500 text-navy-950 border-0'
      case 'AGENT':
        return 'bg-green-100 text-green-800 border-0'
      default:
        return 'bg-gray-100 text-gray-800 border-0'
    }
  }

  const showSearch = currentUser.role === 'AGENT' || currentUser.role === 'ADMIN'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 px-4 h-16 sm:px-6">
        {/* Hamburger menu - mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="size-5" />
        </Button>

        {/* Current view title */}
        <h1 className="text-lg font-bold text-navy-900 hidden sm:block">
          {viewTitles[currentView]}
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search bar - only for AGENT and ADMIN */}
        {showSearch && (
          <div className="relative max-w-xs w-full hidden sm:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-navy-600 transition-colors" />
            <Input
              type="search"
              placeholder="Buscar por ID, usuario o problema…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-slate-50 border-transparent focus:bg-white focus:border-navy-200 transition-all rounded-full text-sm"
            />
          </div>
        )}

        {/* Export CSV button for agents/admins */}
        {(currentUser.role === 'AGENT' || currentUser.role === 'ADMIN') && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-gray-500 hover:text-navy-900"
            onClick={() => setCurrentView('settings')}
            title="Exportar datos"
          >
            <Download className="size-5" />
          </Button>
        )}

        {/* Notification bell with panel */}
        <NotificationPanel />

        <Separator orientation="vertical" className="h-8 hidden sm:block" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div role="button" tabIndex={0} aria-label="Menú de usuario" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-navy-800 font-semibold text-xs border border-navy-200 group-hover:bg-navy-200 transition-colors">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-navy-900 leading-none">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-gray-400 leading-none mt-1 uppercase tracking-wider font-bold">
                  {getRoleLabel(currentUser.role)}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3 h-3 text-gray-400 hidden sm:block"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                <Badge className={`text-[10px] px-1.5 py-0 h-4 rounded font-semibold mt-1 w-fit ${getRoleBadgeColor(currentUser.role)}`}>
                  {getRoleLabel(currentUser.role)}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setCurrentView('profile')}
              >
                <User className="size-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setCurrentView('settings')}
              >
                <Settings className="size-4" />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              onClick={logout}
            >
              <LogOut className="size-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
