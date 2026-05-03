'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Plus, Search, Filter } from 'lucide-react'
import type { Ticket, TicketStatus, TicketPriority, Category } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { cn, getPriorityLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'OPEN', label: 'Abierto' },
  { status: 'IN_PROGRESS', label: 'En Progreso' },
  { status: 'RESOLVED', label: 'Resuelto' },
  { status: 'CLOSED', label: 'Cerrado' },
]

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

export function KanbanBoard() {
  const {
    tickets,
    setTickets,
    updateTicket,
    categories,
    setCategories,
    setTicketFormOpen,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
  } = useAppStore()

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch tickets on mount
  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch('/api/tickets')
        if (res.ok) {
          const data = await res.json()
          setTickets(data)
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchTickets()
    fetchCategories()
  }, [setTickets, setCategories])

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (priorityFilter !== 'ALL' && ticket.priority !== priorityFilter) return false
    if (categoryFilter !== 'ALL' && ticket.categoryId !== categoryFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        ticket.title.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Group tickets by status
  const ticketsByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = filteredTickets.filter((t) => t.status === col.status)
      return acc
    },
    {} as Record<TicketStatus, Ticket[]>,
  )

  // Drag handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const ticket = tickets.find((t) => t.id === active.id)
      if (ticket) {
        setActiveTicket(ticket)
      }
    },
    [tickets],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      // Find the target status
      let targetStatus: TicketStatus | null = null

      // If over a column (droppable area with status)
      if (COLUMNS.some((col) => col.status === overId)) {
        targetStatus = overId as TicketStatus
      }
      // If over another ticket, find its status
      else {
        const overTicket = tickets.find((t) => t.id === overId)
        if (overTicket) {
          targetStatus = overTicket.status
        }
      }

      if (!targetStatus) return

      // Find the active ticket
      const activeTicket = tickets.find((t) => t.id === activeId)
      if (!activeTicket || activeTicket.status === targetStatus) return

      // Optimistically update the store
      updateTicket(activeId, { status: targetStatus })
    },
    [tickets, updateTicket],
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveTicket(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      // Determine target status
      let targetStatus: TicketStatus | null = null

      if (COLUMNS.some((col) => col.status === overId)) {
        targetStatus = overId as TicketStatus
      } else {
        const overTicket = tickets.find((t) => t.id === overId)
        if (overTicket) {
          targetStatus = overTicket.status
        }
      }

      if (!targetStatus) return

      const activeTicket = tickets.find((t) => t.id === activeId)
      if (!activeTicket || activeTicket.status === targetStatus) return

      // Update via API
      try {
        const res = await fetch(`/api/tickets/${activeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus }),
        })

        if (!res.ok) {
          // Revert on failure
          updateTicket(activeId, { status: activeTicket.status })
          console.error('Failed to update ticket status')
        }
      } catch (error) {
        // Revert on failure
        updateTicket(activeId, { status: activeTicket.status })
        console.error('Error updating ticket status:', error)
      }
    },
    [tickets, updateTicket],
  )

  const handleDragCancel = useCallback(() => {
    setActiveTicket(null)
  }, [])

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header with filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Tablero Kanban
          </h2>
          <Button
            onClick={() => setTicketFormOpen(true)}
            className="gap-1.5 bg-[#1a3f7a] text-white hover:bg-[#1a3f7a]/90"
          >
            <Plus className="size-4" />
            Nuevo Ticket
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-[300px]">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />

            <Select
              value={priorityFilter}
              onValueChange={(val) =>
                setPriorityFilter(val as TicketPriority | 'ALL')
              }
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(val) => setCategoryFilter(val)}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {categories.map((cat: Category) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(priorityFilter !== 'ALL' ||
            categoryFilter !== 'ALL' ||
            searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => {
                setPriorityFilter('ALL')
                setCategoryFilter('ALL')
                setSearchQuery('')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Kanban board columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <ScrollArea className="flex-1" orientation="horizontal">
          <div className="flex gap-4 pb-4">
            {isLoading ? (
              // Loading skeleton
              COLUMNS.map((col) => (
                <div
                  key={col.status}
                  className="flex w-[280px] min-w-[280px] flex-col rounded-xl border bg-muted/30 p-4 sm:w-[300px] sm:min-w-[300px]"
                >
                  <div className="mb-3 h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="flex flex-col gap-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-24 animate-pulse rounded-lg bg-muted"
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.status}
                  status={col.status}
                  tickets={ticketsByStatus[col.status]}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={null}>
          {activeTicket ? (
            <div className="w-[270px]">
              <KanbanCard ticket={activeTicket} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
