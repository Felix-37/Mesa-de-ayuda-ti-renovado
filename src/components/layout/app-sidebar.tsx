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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  ChevronLeft,
  ChevronRight,
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
    label: 'Tablero de Gestión',
    icon: <LayoutDashboard className="size-5" />,
    view: 'dashboard',
    roles: ['AGENT', 'ADMIN'],
  },
  {
    label: 'Mi Tablero',
    icon: <Columns3 className="size-5" />,
    view: 'kanban',
    roles: ['USER'],
  },
  {
    label: 'Tablero Kanban',
    icon: <Columns3 className="size-5" />,
    view: 'kanban',
    roles: ['AGENT', 'ADMIN'],
  },
  {
    label: 'Todos los Tickets',
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
  view: 'dashboard',
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

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'ADMIN':
      return 'bg-accent-yellow-500 text-navy-950'
    case 'AGENT':
      return 'bg-green-500 text-white'
    default:
      return 'bg-white/20 text-white'
  }
}

// NavButton is now a proper top-level component (not inside AppSidebar)
// It receives all needed data as props to avoid re-creation on every render
function NavButton({
  item,
  active,
  sidebarOpen,
  onNavClick,
}: {
  item: NavItem
  active: boolean
  sidebarOpen: boolean
  onNavClick: (item: NavItem) => void
}) {
  const button = (
    <button
      onClick={() => onNavClick(item)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
        !sidebarOpen ? 'lg:justify-center lg:px-0' : ''
      } ${
        active
          ? 'bg-accent-yellow-500 text-navy-950 shadow-md translate-x-1'
          : 'text-navy-300 hover:bg-navy-800/50 hover:text-white'
      }`}
    >
      <div className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
        active ? 'text-navy-950' : 'text-navy-400 group-hover:text-accent-yellow-400'
      }`}>
        {item.icon}
      </div>
      <span className={`whitespace-nowrap ${!sidebarOpen ? 'hidden lg:hidden' : ''}`}>
        {item.label}
      </span>
      {active && sidebarOpen && (
        <div className="absolute left-0 w-1 h-6 bg-navy-950 rounded-r-full -ml-3" />
      )}
    </button>
  )

  // On collapsed sidebar, show tooltip
  if (!sidebarOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-navy-900 border-navy-700 text-white">
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

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

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'new-ticket') {
      setTicketFormOpen(true)
    } else {
      setCurrentView(item.view)
    }
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
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
        className={`fixed top-0 left-0 z-50 h-full bg-navy-950 text-white flex flex-col transition-all duration-300 ease-in-out sidebar-transition ${
          sidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'
        } lg:static lg:z-auto`}
      >
        {/* Header with Logo */}
        <div className="relative flex items-center gap-3 p-4 pb-2 h-16 border-b border-navy-800/50">
          <div className="relative w-10 h-10 shrink-0 bg-white rounded-lg p-1 shadow-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="UNIAJC Logo"
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
            <h2 className="font-black text-sm leading-none tracking-tighter text-white uppercase truncate">
              Mesa de Ayuda
            </h2>
            <p className="text-[10px] text-accent-yellow-400 font-bold uppercase tracking-[0.2em] mt-0.5">
              UNIAJC
            </p>
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
          {/* Collapse/Expand button for desktop */}
          <Button
            variant="ghost"
            size="icon"
            className={`text-navy-400 hover:text-white hover:bg-white/10 shrink-0 h-7 w-7 ${sidebarOpen ? 'hidden lg:flex' : 'hidden lg:absolute lg:right-1 lg:top-1/2 lg:-translate-y-1/2 lg:flex'}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar mt-2">
          {filteredMainItems.map((item) => (
            <NavButton
              key={item.view}
              item={item}
              active={currentView === item.view}
              sidebarOpen={sidebarOpen}
              onNavClick={handleNavClick}
            />
          ))}

          {/* Nuevo Ticket Button */}
          {showNewTicket && (
            <>
              <Separator className="bg-navy-800/50 my-2" />
              <button
                onClick={() => handleNavClick(newTicketItem)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 bg-accent-yellow-500 text-navy-950 hover:bg-accent-yellow-400 shadow-md hover:shadow-lg ${
                  !sidebarOpen ? 'lg:justify-center lg:px-0' : ''
                }`}
              >
                <PlusCircle className="size-5 shrink-0" />
                <span className={`whitespace-nowrap ${!sidebarOpen ? 'hidden lg:hidden' : ''}`}>
                  Nuevo Ticket
                </span>
              </button>
            </>
          )}
        </nav>

        {/* Bottom Navigation - Profile & Settings */}
        <div className="px-3 pb-1">
          <Separator className="bg-navy-800/50" />
          <div className="pt-2 space-y-1">
            {filteredBottomItems.map((item) => (
              <NavButton
                key={item.view}
                item={item}
                active={currentView === item.view}
                sidebarOpen={sidebarOpen}
                onNavClick={handleNavClick}
              />
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 pt-2 space-y-3">
          <Separator className="bg-navy-800/50" />
          <div className={`flex items-center gap-3 pt-2 ${!sidebarOpen ? 'lg:justify-center' : ''}`}>
            <Avatar className="size-10 border-2 border-accent-yellow-500 shrink-0">
              {currentUser.avatar && (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              )}
              <AvatarFallback className="bg-navy-800 text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
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
            className={`w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10 ${!sidebarOpen ? 'lg:justify-center lg:px-0' : ''}`}
            onClick={logout}
          >
            <LogOut className="size-4 shrink-0" />
            <span className={`${!sidebarOpen ? 'hidden lg:hidden' : ''}`}>
              Cerrar Sesión
            </span>
          </Button>
        </div>

        {/* Version info */}
        <div className="p-3 border-t border-navy-800/50">
          <div className={`flex flex-col gap-1 items-center justify-center opacity-40 hover:opacity-100 transition-opacity ${sidebarOpen ? '' : 'lg:hidden'}`}>
            <span className="text-[9px] font-bold text-navy-400 uppercase tracking-widest text-center">
              Proyecto Mesa de Ayuda
            </span>
            <span className="text-[8px] text-navy-500 font-medium">v2.0.0-uniajc</span>
          </div>
        </div>
      </aside>
    </>
  )
}
