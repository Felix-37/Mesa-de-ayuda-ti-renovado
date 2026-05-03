'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/lib/store'
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, timeAgo } from '@/lib/utils'
import type { Ticket } from '@/lib/types'

interface RecentTicketsProps {
  tickets: Ticket[] | null
  loading: boolean
}

function RecentTicketsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-44" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RecentTickets({ tickets, loading }: RecentTicketsProps) {
  const { setSelectedTicketId, setCurrentView } = useAppStore()

  if (loading) return <RecentTicketsSkeleton />
  if (!tickets || tickets.length === 0) return null

  const handleClick = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setCurrentView('ticket-detail')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tickets Recientes</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {/* Desktop table view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Asignado</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer"
                  onClick={() => handleClick(ticket.id)}
                >
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {ticket.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(ticket.status)}
                    >
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getPriorityColor(ticket.priority)}
                    >
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ticket.category?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ticket.assignedTo?.name ?? 'Sin asignar'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {timeAgo(ticket.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile card view */}
        <div className="space-y-3 md:hidden">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              className="w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50"
              onClick={() => handleClick(ticket.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm truncate flex-1">
                  {ticket.title}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(ticket.createdAt)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${getStatusColor(ticket.status)}`}
                >
                  {getStatusLabel(ticket.status)}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${getPriorityColor(ticket.priority)}`}
                >
                  {getPriorityLabel(ticket.priority)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {ticket.assignedTo?.name ?? 'Sin asignar'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
