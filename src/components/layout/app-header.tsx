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
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
} from 'lucide-react'
import type { AppView } from '@/lib/types'

const viewTitles: Record<AppView, string> = {
  dashboard: 'Dashboard',
  kanban: 'Tablero Kanban',
  tickets: 'Tickets',
  'ticket-detail': 'Detalle de Ticket',
  users: 'Usuarios',
}

export function AppHeader() {
  const {
    currentUser,
    currentView,
    searchQuery,
    setSearchQuery,
    setSidebarOpen,
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
        return 'bg-uniajc-yellow text-uniajc-blue-dark border-0'
      case 'AGENT':
        return 'bg-green-100 text-green-800 border-0'
      default:
        return 'bg-gray-100 text-gray-800 border-0'
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div className="flex items-center gap-3 px-4 h-16">
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
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">
          {viewTitles[currentView]}
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search bar */}
        <div className="relative max-w-xs w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:bg-background focus-visible:border focus-visible:border-input"
          />
        </div>

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="size-5 text-muted-foreground" />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-uniajc-yellow rounded-full" />
        </Button>

        <Separator orientation="vertical" className="h-8 hidden sm:block" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-auto py-1.5">
              <Avatar className="size-8">
                {currentUser.avatar && (
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                )}
                <AvatarFallback className="bg-uniajc-blue text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-tight">
                  {currentUser.name}
                </span>
                <Badge
                  className={`text-[10px] px-1.5 py-0 h-4 rounded font-semibold mt-0.5 ${getRoleBadgeColor(currentUser.role)}`}
                >
                  {getRoleLabel(currentUser.role)}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2">
                <User className="size-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="size-4" />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
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
