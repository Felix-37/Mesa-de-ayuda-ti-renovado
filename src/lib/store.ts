import { create } from 'zustand'
import type { User, Ticket, Category, AppView, TicketStatus } from './types'

interface AppState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void

  // Navigation
  currentView: AppView
  setCurrentView: (view: AppView) => void

  // Tickets
  tickets: Ticket[]
  setTickets: (tickets: Ticket[]) => void
  addTicket: (ticket: Ticket) => void
  updateTicket: (id: string, data: Partial<Ticket>) => void
  removeTicket: (id: string) => void

  // Selected ticket
  selectedTicketId: string | null
  setSelectedTicketId: (id: string | null) => void

  // Categories
  categories: Category[]
  setCategories: (categories: Category[]) => void

  // Users
  users: User[]
  setUsers: (users: User[]) => void

  // Filters
  statusFilter: TicketStatus | 'ALL'
  priorityFilter: string | 'ALL'
  categoryFilter: string | 'ALL'
  searchQuery: string
  setStatusFilter: (filter: TicketStatus | 'ALL') => void
  setPriorityFilter: (filter: string | 'ALL') => void
  setCategoryFilter: (filter: string | 'ALL') => void
  setSearchQuery: (query: string) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  ticketFormOpen: boolean
  setTicketFormOpen: (open: boolean) => void
  editingTicket: Ticket | null
  setEditingTicket: (ticket: Ticket | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  currentUser: null,
  isAuthenticated: false,
  login: (user) => set({ currentUser: user, isAuthenticated: true }),
  logout: () =>
    set({
      currentUser: null,
      isAuthenticated: false,
      currentView: 'dashboard',
      selectedTicketId: null,
    }),

  // Navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),

  // Tickets
  tickets: [],
  setTickets: (tickets) => set({ tickets }),
  addTicket: (ticket) => set((state) => ({ tickets: [ticket, ...state.tickets] })),
  updateTicket: (id, data) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  removeTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== id),
    })),

  // Selected ticket
  selectedTicketId: null,
  setSelectedTicketId: (id) => set({ selectedTicketId: id }),

  // Categories
  categories: [],
  setCategories: (categories) => set({ categories }),

  // Users
  users: [],
  setUsers: (users) => set({ users }),

  // Filters
  statusFilter: 'ALL',
  priorityFilter: 'ALL',
  categoryFilter: 'ALL',
  searchQuery: '',
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setPriorityFilter: (filter) => set({ priorityFilter: filter }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // UI
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  ticketFormOpen: false,
  setTicketFormOpen: (open) => set({ ticketFormOpen: open }),
  editingTicket: null,
  setEditingTicket: (ticket) => set({ editingTicket: ticket }),
}))
