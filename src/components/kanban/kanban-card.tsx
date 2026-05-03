'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, User } from 'lucide-react'
import type { Ticket } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { cn, getPriorityLabel, getPriorityColor, timeAgo } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface KanbanCardProps {
  ticket: Ticket
  overlay?: boolean
}

const priorityDotColors: Record<string, string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Inner card content shared between sortable card and drag overlay */
function CardContent({ ticket }: { ticket: Ticket }) {
  const assignedName = ticket.assignedTo?.name ?? ticket.createdBy?.name ?? ''
  const categoryColor = ticket.category?.color ?? '#6b7280'

  return (
    <>
      {/* Category indicator line */}
      <div
        className="mb-2 h-1 w-6 rounded-full"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Title */}
      <h4 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
        {ticket.title}
      </h4>

      {/* Badges row */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge
          variant="secondary"
          className={cn(
            'gap-1 px-1.5 py-0 text-[10px] font-semibold',
            getPriorityColor(ticket.priority),
          )}
        >
          <span
            className={cn(
              'inline-block size-1.5 rounded-full',
              priorityDotColors[ticket.priority],
            )}
          />
          {getPriorityLabel(ticket.priority)}
        </Badge>

        {ticket.category && (
          <Badge
            variant="outline"
            className="px-1.5 py-0 text-[10px]"
            style={{ borderColor: categoryColor, color: categoryColor }}
          >
            {ticket.category.name}
          </Badge>
        )}
      </div>

      {/* Footer: avatar + time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {assignedName ? (
            <div className="flex size-5 items-center justify-center rounded-full bg-[#1a3f7a] text-[9px] font-bold text-white">
              {getInitials(assignedName)}
            </div>
          ) : (
            <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="size-3" />
            </div>
          )}
          <span className="max-w-[80px] truncate text-[10px] text-muted-foreground">
            {assignedName || 'Sin asignar'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="size-3" />
          <span>{timeAgo(ticket.createdAt)}</span>
        </div>
      </div>
    </>
  )
}

export function KanbanCard({ ticket, overlay }: KanbanCardProps) {
  const { setSelectedTicketId, setCurrentView } = useAppStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: {
      ticket,
      status: ticket.status,
    },
    disabled: overlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleClick = () => {
    if (overlay) return
    setSelectedTicketId(ticket.id)
    setCurrentView('ticket-detail')
  }

  // When used as drag overlay, render without sortable wrappers
  if (overlay) {
    return (
      <Card className="cursor-grabbing rounded-lg border bg-card p-3 shadow-xl rotate-2">
        <CardContent ticket={ticket} />
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        isDragging && 'z-50 opacity-30',
      )}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <CardContent ticket={ticket} />
    </Card>
  )
}
