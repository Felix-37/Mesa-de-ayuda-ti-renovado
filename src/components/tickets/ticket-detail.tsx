'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Edit3,
  Loader2,
  Send,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlayCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useAppStore } from '@/lib/store'
import type { Ticket, Comment, TicketStatus } from '@/lib/types'
import {
  cn,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  formatDate,
  formatDateTime,
  timeAgo,
} from '@/lib/utils'

// ── Status transition config ──────────────────────────────────

const statusTransitions: Record<TicketStatus, { next: TicketStatus[]; icon: React.ElementType }> = {
  OPEN: {
    next: ['IN_PROGRESS'],
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    next: ['RESOLVED', 'OPEN'],
    icon: PlayCircle,
  },
  RESOLVED: {
    next: ['CLOSED', 'IN_PROGRESS'],
    icon: CheckCircle2,
  },
  CLOSED: {
    next: ['OPEN'],
    icon: XCircle,
  },
}

const transitionLabels: Record<string, string> = {
  OPEN_TO_IN_PROGRESS: 'Iniciar Progreso',
  IN_PROGRESS_TO_RESOLVED: 'Marcar Resuelto',
  IN_PROGRESS_TO_OPEN: 'Reabrir',
  RESOLVED_TO_CLOSED: 'Cerrar Ticket',
  RESOLVED_TO_IN_PROGRESS: 'Reabrir',
  CLOSED_TO_OPEN: 'Reabrir',
}

// ── Component ─────────────────────────────────────────────────

export function TicketDetail() {
  const {
    selectedTicketId,
    setCurrentView,
    setEditingTicket,
    setTicketFormOpen,
    currentUser,
    updateTicket,
  } = useAppStore()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Fetch ticket detail
  const fetchTicket = useCallback(async () => {
    if (!selectedTicketId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}?userId=${currentUser?.id ?? ''}&role=${currentUser?.role ?? ''}`)
      if (!res.ok) throw new Error('Error al cargar el ticket')
      const data: Ticket = await res.json()
      setTicket(data)
      setComments(data.comments ?? [])
    } catch {
      toast.error('No se pudo cargar el detalle del ticket')
    } finally {
      setLoading(false)
    }
  }, [selectedTicketId, currentUser])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  // Handle status change
  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}?userId=${currentUser?.id ?? ''}&role=${currentUser?.role ?? ''}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId: currentUser?.id, role: currentUser?.role }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al cambiar el estado')
      }
      const updated: Ticket = await res.json()
      setTicket(updated)
      updateTicket(updated.id, updated)
      toast.success(`Estado cambiado a "${getStatusLabel(newStatus)}"`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Handle add comment
  const handleAddComment = async () => {
    if (!ticket || !commentText.trim() || !currentUser) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          authorId: currentUser.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al agregar comentario')
      }
      const newComment: Comment = await res.json()
      setComments((prev) => [...prev, newComment])
      setCommentText('')
      toast.success('Comentario agregado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setSubmittingComment(false)
    }
  }

  // Handle edit
  const handleEdit = () => {
    if (!ticket) return
    setEditingTicket(ticket)
    setTicketFormOpen(true)
  }

  // Go back - determine the correct view based on role
  const handleBack = () => {
    if (currentUser?.role === 'USER') {
      setCurrentView('kanban')
    } else {
      setCurrentView('tickets')
    }
  }

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <AlertCircle className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Ticket no encontrado</p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 size-4" />
          Volver
        </Button>
      </div>
    )
  }

  const transitions = statusTransitions[ticket.status]

  // Get initials from name
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0 mt-0.5">
            <ArrowLeft className="size-5" />
          </Button>
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight md:text-2xl break-words">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-xs">
                #{ticket.id.substring(0, 8)}
              </span>
              <span>·</span>
              <span>Creado {timeAgo(ticket.createdAt)}</span>
            </div>
          </div>
        </div>
        {/* Edit button - only for ADMIN/AGENT or ticket creator */}
        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'AGENT' || ticket.createdById === currentUser?.id) && (
          <Button variant="outline" onClick={handleEdit} className="shrink-0">
            <Edit3 className="mr-2 size-4" />
            Editar
          </Button>
        )}
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2">
        <Badge className={cn('text-xs', getStatusColor(ticket.status))}>
          {getStatusLabel(ticket.status)}
        </Badge>
        <Badge className={cn('text-xs', getPriorityColor(ticket.priority))}>
          {getPriorityLabel(ticket.priority)}
        </Badge>
        {ticket.category && (
          <Badge variant="outline" className="text-xs">
            <span
              className="mr-1.5 inline-block size-2 rounded-full"
              style={{ backgroundColor: ticket.category.color }}
            />
            {ticket.category.name}
          </Badge>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </CardContent>
      </Card>

      {/* People info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Created by */}
        {ticket.createdBy && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4" />
                Creado por
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={ticket.createdBy.avatar ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(ticket.createdBy.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{ticket.createdBy.name}</p>
                  <p className="text-xs text-muted-foreground">{ticket.createdBy.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned to */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="size-4" />
              Asignado a
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ticket.assignedTo ? (
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={ticket.assignedTo.avatar ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(ticket.assignedTo.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{ticket.assignedTo.name}</p>
                  <p className="text-xs text-muted-foreground">{ticket.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin asignar</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dates */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <span>Creado: {formatDateTime(ticket.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <span>Actualizado: {formatDateTime(ticket.updatedAt)}</span>
        </div>
      </div>

      {/* Status change buttons - only for ADMIN/AGENT */}
      {(currentUser?.role === 'ADMIN' || currentUser?.role === 'AGENT') && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cambiar Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {transitions.next.map((nextStatus) => {
              const key = `${ticket.status}_TO_${nextStatus}`
              const label = transitionLabels[key] || getStatusLabel(nextStatus)
              const Icon = statusTransitions[nextStatus].icon
              return (
                <Button
                  key={nextStatus}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(nextStatus)}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Icon className="mr-1.5 size-3.5" />
                  )}
                  {label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
      )}

      <Separator />

      {/* Comments section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Comentarios ({comments.length})
        </h2>

        <ScrollArea className="max-h-96">
          <div className="space-y-4 pr-4">
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                No hay comentarios aún. Sea el primero en comentar.
              </p>
            )}
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={comment.author?.avatar ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.author ? getInitials(comment.author.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {comment.author?.name ?? 'Usuario desconocido'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Add comment form */}
        {currentUser && (
          <div className="flex gap-2 pt-2">
            <Textarea
              placeholder="Escriba un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px] flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleAddComment()
                }
              }}
            />
            <Button
              onClick={handleAddComment}
              disabled={!commentText.trim() || submittingComment}
              size="icon"
              className="shrink-0 self-end"
              style={{ backgroundColor: '#1a3f7a' }}
            >
              {submittingComment ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
