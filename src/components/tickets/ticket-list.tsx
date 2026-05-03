'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Search,
  ArrowUpDown,
  Loader2,
  Plus,
  TicketX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

import { useAppStore } from '@/lib/store'
import type { Ticket, TicketStatus, TicketPriority } from '@/lib/types'
import {
  cn,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  formatDate,
} from '@/lib/utils'

// ── Sort type ─────────────────────────────────────────────────

type SortField = 'createdAt' | 'title' | 'status' | 'priority'
type SortDir = 'asc' | 'desc'

// ── Constants ─────────────────────────────────────────────────

const PAGE_SIZE = 10

const statusFilterOptions: { value: TicketStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'OPEN', label: 'Abierto' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'RESOLVED', label: 'Resuelto' },
  { value: 'CLOSED', label: 'Cerrado' },
]

const priorityFilterOptions: { value: TicketPriority | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas las prioridades' },
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

// ── Component ─────────────────────────────────────────────────

interface TicketListProps {
  myTicketsOnly?: boolean
}

export function TicketList({ myTicketsOnly = false }: TicketListProps) {
  const {
    tickets,
    setTickets,
    categories,
    setCategories,
    currentUser,
    statusFilter,
    priorityFilter,
    categoryFilter,
    searchQuery,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    setSearchQuery,
    setCurrentView,
    setSelectedTicketId,
    setTicketFormOpen,
    setEditingTicket,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  // ── Fetch categories ────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch {
      // silently fail — categories may already be in store
    }
  }, [setCategories])

  // ── Fetch tickets with filters ──────────────────────────────
  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter)
      if (categoryFilter !== 'ALL') params.set('categoryId', categoryFilter)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      if (myTicketsOnly && currentUser) {
        params.set('createdById', currentUser.id)
      }
      // RBAC: always pass userId and role so the API filters appropriately
      if (currentUser) {
        params.set('userId', currentUser.id)
        params.set('role', currentUser.role)
      }

      const res = await fetch(`/api/tickets?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar tickets')
      const data: Ticket[] = await res.json()
      setTickets(data)
    } catch {
      toast.error('No se pudieron cargar los tickets')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery, setTickets, myTicketsOnly, currentUser])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery])

  // ── Sort tickets ────────────────────────────────────────────
  const userFilteredTickets = myTicketsOnly && currentUser
    ? tickets.filter((t) => t.createdById === currentUser.id)
    : tickets

  const sortedTickets = [...userFilteredTickets].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'status': {
        const order: Record<string, number> = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2, CLOSED: 3 }
        cmp = (order[a.status] ?? 0) - (order[b.status] ?? 0)
        break
      }
      case 'priority': {
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        cmp = (order[a.priority] ?? 0) - (order[b.priority] ?? 0)
        break
      }
      case 'createdAt':
      default:
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  // ── Paginate ────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / PAGE_SIZE))
  const paginatedTickets = sortedTickets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  // ── Sort handler ────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // ── Row click → detail ──────────────────────────────────────
  const handleRowClick = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setCurrentView('ticket-detail')
  }

  // ── New ticket ──────────────────────────────────────────────
  const handleNewTicket = () => {
    setEditingTicket(null)
    setTicketFormOpen(true)
  }

  // ── Helpers ─────────────────────────────────────────────────
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={cn(
        'ml-1 inline size-3',
        sortField === field ? 'opacity-100' : 'opacity-30'
      )}
    />
  )

  // ── Loading skeleton ────────────────────────────────────────
  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-60" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{myTicketsOnly ? 'Mis Tickets' : 'Tickets'}</h1>
        <Button
          onClick={handleNewTicket}
          style={{ backgroundColor: '#1a3f7a' }}
          className="shrink-0"
        >
          <Plus className="mr-2 size-4" />
          Nuevo Ticket
        </Button>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TicketStatus | 'ALL')}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(v) => setPriorityFilter(v as TicketPriority | 'ALL')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityFilterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v)}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Empty state */}
      {sortedTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <TicketX className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">No se encontraron tickets</p>
          <p className="text-sm text-muted-foreground">
            Intente cambiar los filtros o cree un nuevo ticket.
          </p>
        </div>
      )}

      {/* Desktop: Table view */}
      {sortedTickets.length > 0 && (
        <>
          {/* Hidden on small screens */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center hover:underline"
                      onClick={() => handleSort('title')}
                    >
                      Título <SortIcon field="title" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center hover:underline"
                      onClick={() => handleSort('status')}
                    >
                      Estado <SortIcon field="status" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center hover:underline"
                      onClick={() => handleSort('priority')}
                    >
                      Prioridad <SortIcon field="priority" />
                    </button>
                  </TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center hover:underline"
                      onClick={() => handleSort('createdAt')}
                    >
                      Fecha <SortIcon field="createdAt" />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(ticket.id)}
                  >
                    <TableCell className="font-mono text-xs">
                      {ticket.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium max-w-[250px] truncate">
                      {ticket.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getStatusColor(ticket.status))}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getPriorityColor(ticket.priority))}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.category && (
                        <Badge variant="outline" className="text-xs">
                          <span
                            className="mr-1.5 inline-block size-2 rounded-full"
                            style={{ backgroundColor: ticket.category.color }}
                          />
                          {ticket.category.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src={ticket.assignedTo.avatar ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(ticket.assignedTo.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[120px]">
                            {ticket.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: Card layout */}
          <div className="flex flex-col gap-3 md:hidden">
            {paginatedTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleRowClick(ticket.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm leading-tight truncate">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        #{ticket.id.substring(0, 8)} · {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge className={cn('text-[10px] px-1.5 py-0', getStatusColor(ticket.status))}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                    <Badge className={cn('text-[10px] px-1.5 py-0', getPriorityColor(ticket.priority))}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                    {ticket.category && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {ticket.category.name}
                      </Badge>
                    )}
                  </div>

                  {ticket.assignedTo && (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage src={ticket.assignedTo.avatar ?? undefined} />
                        <AvatarFallback className="text-[8px]">
                          {getInitials(ticket.assignedTo.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {ticket.assignedTo.name}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, sortedTickets.length)} de{' '}
                {sortedTickets.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="icon"
                    className="size-8"
                    onClick={() => setPage(p)}
                    style={p === page ? { backgroundColor: '#1a3f7a' } : undefined}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
