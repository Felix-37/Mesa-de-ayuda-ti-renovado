export type UserRole = 'ADMIN' | 'AGENT' | 'USER'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string | null
  createdAt: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  categoryId: string
  createdById: string
  assignedToId?: string | null
  createdAt: string
  updatedAt: string
  category?: Category
  createdBy?: User
  assignedTo?: User | null
  comments?: Comment[]
}

export interface Comment {
  id: string
  content: string
  ticketId: string
  authorId: string
  createdAt: string
  author?: User
}

export interface DashboardStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
  ticketsByPriority: Record<TicketPriority, number>
  ticketsByCategory: { category: string; count: number; color: string }[]
  recentTickets: Ticket[]
  ticketsOverTime: { date: string; count: number }[]
}

export type AppView = 'dashboard' | 'kanban' | 'tickets' | 'my-tickets' | 'ticket-detail' | 'users' | 'profile' | 'settings'

export interface Notification {
  id: string
  type: 'TICKET_CREATED' | 'TICKET_ASSIGNED' | 'TICKET_UPDATED' | 'TICKET_COMMENT' | 'TICKET_RESOLVED' | 'TICKET_CLOSED'
  title: string
  message: string
  ticketId?: string
  read: boolean
  createdAt: string
}

export interface UserSettings {
  emailNotifications: boolean
  compactMode: boolean
  defaultView: AppView
}
