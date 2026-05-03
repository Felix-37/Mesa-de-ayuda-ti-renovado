'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Users,
  Search,
  Shield,
  Headset,
  UserCircle,
  MoreHorizontal,
  Power,
  PowerOff,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAppStore } from '@/lib/store'
import type { User, UserRole } from '@/lib/types'
import { cn, formatDate, getRoleLabel } from '@/lib/utils'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Helpers ─────────────────────────────────────────────────────

function getRoleBadgeClasses(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'AGENT':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    case 'USER':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    default:
      return ''
  }
}

function getRoleAvatarClasses(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-blue-600 text-white'
    case 'AGENT':
      return 'bg-yellow-500 text-white'
    case 'USER':
      return 'bg-gray-500 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}

function getRoleIcon(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return <Shield className="size-3" />
    case 'AGENT':
      return <Headset className="size-3" />
    case 'USER':
      return <UserCircle className="size-3" />
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface UserWithCounts extends User {
  _count?: {
    createdTickets?: number
    assignedTickets?: number
    comments?: number
  }
}

// ── Loading Skeleton ────────────────────────────────────────────

function UserListSkeleton({ isTable }: { isTable: boolean }) {
  if (isTable) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="size-3 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────

export function UserList() {
  const { currentUser, users, setUsers } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // ── Fetch users ───────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data: UserWithCounts[] = await res.json()
      setUsers(data)
    } catch {
      toast.error('Error al cargar la lista de usuarios')
    } finally {
      setLoading(false)
    }
  }, [setUsers])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Update user ───────────────────────────────────────────────
  const updateUser = useCallback(
    async (id: string, payload: Partial<User>) => {
      try {
        setUpdatingId(id)
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        })
        if (!res.ok) throw new Error('Error al actualizar usuario')
        const updated: User = await res.json()

        // Update local store
        setUsers(
          users.map((u) => (u.id === id ? { ...u, ...updated } : u))
        )
        toast.success('Usuario actualizado correctamente')
      } catch {
        toast.error('Error al actualizar el usuario')
      } finally {
        setUpdatingId(null)
      }
    },
    [users, setUsers]
  )

  // ── Filtered users ────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let result = users as UserWithCounts[]

    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }

    return result
  }, [users, roleFilter, search])

  // ── Guard: only ADMIN ─────────────────────────────────────────
  if (currentUser?.role !== 'ADMIN') {
    return null
  }

  const activeCount = users.filter((u) => u.active).length
  const inactiveCount = users.length - activeCount

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="size-6 text-[#1a3f7a]" />
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrados
            {' · '}
            <span className="text-green-600 dark:text-green-400">{activeCount} activos</span>
            {' · '}
            <span className="text-red-600 dark:text-red-400">{inactiveCount} inactivos</span>
          </p>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as UserRole | 'ALL')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los roles</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="AGENT">Agente</SelectItem>
            <SelectItem value="USER">Usuario</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Loading ───────────────────────────────────────────── */}
      {loading ? (
        <>
          <div className="hidden md:block">
            <UserListSkeleton isTable />
          </div>
          <div className="md:hidden">
            <UserListSkeleton isTable={false} />
          </div>
        </>
      ) : filteredUsers.length === 0 ? (
        /* ── Empty state ──────────────────────────────────────── */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="size-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">
              No se encontraron usuarios
            </p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              {search || roleFilter !== 'ALL'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay usuarios registrados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Desktop Table ──────────────────────────────────── */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Usuario</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead className="text-right pr-4">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        updating={updatingId === user.id}
                        onToggleActive={() =>
                          updateUser(user.id, { active: !user.active })
                        }
                        onChangeRole={(role) =>
                          updateUser(user.id, { role })
                        }
                        isSelf={user.id === currentUser?.id}
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* ── Mobile Cards ───────────────────────────────────── */}
          <div className="md:hidden grid gap-3">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                updating={updatingId === user.id}
                onToggleActive={() =>
                  updateUser(user.id, { active: !user.active })
                }
                onChangeRole={(role) =>
                  updateUser(user.id, { role })
                }
                isSelf={user.id === currentUser?.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Desktop Row ─────────────────────────────────────────────────

function UserTableRow({
  user,
  updating,
  onToggleActive,
  onChangeRole,
  isSelf,
}: {
  user: UserWithCounts
  updating: boolean
  onToggleActive: () => void
  onChangeRole: (role: UserRole) => void
  isSelf: boolean
}) {
  return (
    <TableRow className={cn(updating && 'opacity-60 pointer-events-none')}>
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback
              className={cn(
                'text-xs font-semibold',
                getRoleAvatarClasses(user.role)
              )}
            >
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium leading-tight">
              {user.name}
              {isSelf && (
                <span className="text-xs text-muted-foreground ml-1">
                  (Tú)
                </span>
              )}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {user.email}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn('gap-1', getRoleBadgeClasses(user.role))}
        >
          {getRoleIcon(user.role)}
          {getRoleLabel(user.role)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-block size-2.5 rounded-full',
              user.active
                ? 'bg-green-500 shadow-sm shadow-green-400'
                : 'bg-red-500 shadow-sm shadow-red-400'
            )}
          />
          <span className="text-sm text-muted-foreground">
            {user.active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell className="text-right pr-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleActive}>
              {user.active ? (
                <>
                  <PowerOff className="size-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <Power className="size-4" />
                  Activar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">
              Cambiar rol
            </DropdownMenuLabel>
            {(['ADMIN', 'AGENT', 'USER'] as UserRole[])
              .filter((r) => r !== user.role)
              .map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => onChangeRole(role)}
                >
                  {getRoleIcon(role)}
                  {getRoleLabel(role)}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// ── Mobile Card ─────────────────────────────────────────────────

function UserCard({
  user,
  updating,
  onToggleActive,
  onChangeRole,
  isSelf,
}: {
  user: UserWithCounts
  updating: boolean
  onToggleActive: () => void
  onChangeRole: (role: UserRole) => void
  isSelf: boolean
}) {
  const [roleOpen, setRoleOpen] = useState(false)

  return (
    <Card className={cn(updating && 'opacity-60 pointer-events-none')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="size-11 shrink-0">
            <AvatarFallback
              className={cn(
                'text-sm font-semibold',
                getRoleAvatarClasses(user.role)
              )}
            >
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium truncate">
                {user.name}
                {isSelf && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (Tú)
                  </span>
                )}
              </p>
              {/* Status dot */}
              <span
                className={cn(
                  'inline-block size-2.5 rounded-full shrink-0',
                  user.active
                    ? 'bg-green-500 shadow-sm shadow-green-400'
                    : 'bg-red-500 shadow-sm shadow-red-400'
                )}
                title={user.active ? 'Activo' : 'Inactivo'}
              />
            </div>

            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn('gap-1 text-xs', getRoleBadgeClasses(user.role))}
              >
                {getRoleIcon(user.role)}
                {getRoleLabel(user.role)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(user.createdAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={onToggleActive}
              >
                {user.active ? (
                  <>
                    <PowerOff className="size-3" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Power className="size-3" />
                    Activar
                  </>
                )}
              </Button>

              {/* Role change inline */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setRoleOpen(!roleOpen)}
                >
                  Cambiar rol
                  <ChevronDown className="size-3" />
                </Button>
                {roleOpen && (
                  <>
                    {/* Backdrop to close */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setRoleOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 z-50 bg-popover border rounded-md shadow-md py-1 min-w-[140px]">
                      {(['ADMIN', 'AGENT', 'USER'] as UserRole[])
                        .filter((r) => r !== user.role)
                        .map((role) => (
                          <button
                            key={role}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                            onClick={() => {
                              onChangeRole(role)
                              setRoleOpen(false)
                            }}
                          >
                            {getRoleIcon(role)}
                            {getRoleLabel(role)}
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
