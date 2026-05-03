'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useAppStore } from '@/lib/store'
import type { Ticket, TicketPriority, TicketStatus } from '@/lib/types'

// ── Zod schema ────────────────────────────────────────────────

const ticketFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  categoryId: z.string().min(1, 'Seleccione una categoría'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assignedToId: z.string().optional().or(z.literal('')),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

// ── Priority options ──────────────────────────────────────────

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: 'OPEN', label: 'Abierto' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'RESOLVED', label: 'Resuelto' },
  { value: 'CLOSED', label: 'Cerrado' },
]

// ── Component ─────────────────────────────────────────────────

export function TicketForm() {
  const {
    ticketFormOpen,
    setTicketFormOpen,
    editingTicket,
    setEditingTicket,
    categories,
    users,
    currentUser,
    addTicket,
    updateTicket,
  } = useAppStore()

  const isEditing = !!editingTicket

  const agents = users.filter((u) => u.role === 'AGENT' || u.role === 'ADMIN')

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      priority: 'MEDIUM',
      assignedToId: '',
      status: 'OPEN',
    },
  })

  // Reset form when dialog opens/closes or editingTicket changes
  useEffect(() => {
    if (ticketFormOpen) {
      if (editingTicket) {
        form.reset({
          title: editingTicket.title,
          description: editingTicket.description,
          categoryId: editingTicket.categoryId,
          priority: editingTicket.priority,
          assignedToId: editingTicket.assignedToId ?? '',
          status: editingTicket.status,
        })
      } else {
        form.reset({
          title: '',
          description: '',
          categoryId: '',
          priority: 'MEDIUM',
          assignedToId: '',
          status: 'OPEN',
        })
      }
    }
  }, [ticketFormOpen, editingTicket, form])

  const onSubmit = async (values: TicketFormValues) => {
    try {
      if (isEditing && editingTicket) {
        // PUT /api/tickets/[id]
        const body: Record<string, unknown> = {
          title: values.title,
          description: values.description,
          categoryId: values.categoryId,
          priority: values.priority,
          assignedToId: values.assignedToId || null,
        }
        if (values.status) {
          body.status = values.status
        }

        const res = await fetch(`/api/tickets/${editingTicket.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Error al actualizar el ticket')
        }

        const updated: Ticket = await res.json()
        updateTicket(updated.id, updated)
        toast.success('Ticket actualizado correctamente')
      } else {
        // POST /api/tickets
        if (!currentUser) {
          toast.error('Debe iniciar sesión para crear un ticket')
          return
        }

        const res = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: values.title,
            description: values.description,
            categoryId: values.categoryId,
            priority: values.priority,
            createdById: currentUser.id,
            assignedToId: values.assignedToId || null,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Error al crear el ticket')
        }

        const created: Ticket = await res.json()
        addTicket(created)
        toast.success('Ticket creado correctamente')
      }

      // Close dialog and reset
      setTicketFormOpen(false)
      setEditingTicket(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error inesperado')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingTicket(null)
    }
    setTicketFormOpen(open)
  }

  return (
    <Dialog open={ticketFormOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Ticket' : 'Nuevo Ticket'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los campos que desee actualizar.'
              : 'Complete los campos para crear un nuevo ticket de soporte.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el título del ticket" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el problema o solicitud en detalle"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoría */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prioridad */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione la prioridad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Asignar a */}
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignar a (opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado - solo al editar */}
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione el estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="min-w-[120px]"
                style={{ backgroundColor: '#1a3f7a' }}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Guardando...
                  </>
                ) : isEditing ? (
                  'Actualizar'
                ) : (
                  'Crear Ticket'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
