'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Inbox } from 'lucide-react'
import type { Ticket, TicketStatus } from '@/lib/types'
import { cn, getStatusLabel } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { KanbanCard } from './kanban-card'

interface KanbanColumnProps {
  status: TicketStatus
  tickets: Ticket[]
}

const statusColors: Record<TicketStatus, string> = {
  OPEN: '#3b82f6',        // blue-500
  IN_PROGRESS: '#f59e0b', // amber-500
  RESOLVED: '#22c55e',    // green-500
  CLOSED: '#9ca3af',      // gray-400
}

const statusBgColors: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-50 dark:bg-blue-950/30',
  IN_PROGRESS: 'bg-amber-50 dark:bg-amber-950/30',
  RESOLVED: 'bg-green-50 dark:bg-green-950/30',
  CLOSED: 'bg-gray-50 dark:bg-gray-900/30',
}

export function KanbanColumn({ status, tickets }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      status,
    },
  })

  const ticketIds = tickets.map((t) => t.id)

  return (
    <div
      className={cn(
        'flex w-[280px] min-w-[280px] flex-shrink-0 flex-col rounded-xl border bg-muted/30 sm:w-[300px] sm:min-w-[300px]',
        isOver && 'ring-2 ring-[#1a3f7a]/40',
      )}
    >
      {/* Column header */}
      <div className={cn('rounded-t-xl px-3 pt-3', statusBgColors[status])}>
        {/* Status color indicator bar */}
        <div
          className="mb-2 h-1 w-full rounded-full"
          style={{ backgroundColor: statusColors[status] }}
        />

        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: statusColors[status] }}
            />
            <h3 className="text-sm font-bold text-foreground">
              {getStatusLabel(status)}
            </h3>
          </div>
          <span
            className="flex size-6 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: statusColors[status] }}
          >
            {tickets.length}
          </span>
        </div>
      </div>

      {/* Cards area */}
      <ScrollArea className="flex-1">
        <div ref={setNodeRef} className="min-h-[120px] p-2">
          <SortableContext
            items={ticketIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {tickets.map((ticket) => (
                <KanbanCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {tickets.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                <Inbox className="size-8 opacity-40" />
                <p className="text-xs">Sin tickets</p>
              </div>
            )}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  )
}
