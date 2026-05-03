'use client'

import { useAppStore } from '@/lib/store'
import { LoginForm } from '@/components/auth/login-form'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TicketList } from '@/components/tickets/ticket-list'
import { TicketDetail } from '@/components/tickets/ticket-detail'
import { TicketForm } from '@/components/tickets/ticket-form'
import { UserList } from '@/components/users/user-list'

function ViewRenderer() {
  const currentView = useAppStore((s) => s.currentView)

  switch (currentView) {
    case 'dashboard':
      return <DashboardView />
    case 'kanban':
      return <KanbanBoard />
    case 'tickets':
      return <TicketList />
    case 'ticket-detail':
      return <TicketDetail />
    case 'users':
      return <UserList />
    default:
      return <DashboardView />
  }
}

export default function Home() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-auto">
          <ViewRenderer />
        </main>
      </div>
      <TicketForm />
    </div>
  )
}
