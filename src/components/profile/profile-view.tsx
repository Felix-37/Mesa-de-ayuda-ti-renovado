'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { getRoleLabel, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Lock,
  Save,
  Ticket,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react'

export function ProfileView() {
  const { currentUser, login, tickets } = useAppStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [stats, setStats] = useState({ created: 0, resolved: 0, pending: 0, assigned: 0, inProgress: 0, total: 0 })

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    const userTickets = tickets.filter((t) => t.createdById === currentUser.id)
    const assignedTickets = tickets.filter((t) => t.assignedToId === currentUser.id)

    if (currentUser.role === 'USER') {
      setStats({
        created: userTickets.length,
        resolved: userTickets.filter((t) => t.status === 'RESOLVED').length,
        pending: userTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        assigned: 0,
        inProgress: 0,
        total: 0,
      })
    } else if (currentUser.role === 'AGENT') {
      setStats({
        created: 0,
        assigned: assignedTickets.length,
        resolved: assignedTickets.filter((t) => t.status === 'RESOLVED').length,
        pending: assignedTickets.filter((t) => t.status === 'OPEN').length,
        inProgress: assignedTickets.filter((t) => t.status === 'IN_PROGRESS').length,
        total: 0,
      })
    } else {
      setStats({
        created: userTickets.length,
        resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
        pending: tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        assigned: assignedTickets.length,
        inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
        total: tickets.length,
      })
    }
  }, [currentUser, tickets])

  if (!currentUser) return null

  const userInitials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-uniajc-yellow text-uniajc-blue-dark'
      case 'AGENT':
        return 'bg-green-500 text-white'
      default:
        return 'bg-uniajc-blue text-white'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-uniajc-yellow text-uniajc-blue-dark border-0'
      case 'AGENT':
        return 'bg-green-100 text-green-800 border-0'
      default:
        return 'bg-gray-100 text-gray-800 border-0'
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Los campos nombre y email son obligatorios')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name: name.trim(),
          email: email.trim(),
        }),
      })

      if (res.ok) {
        const updatedUser = await res.json()
        login({ ...currentUser, ...updatedUser })
        toast.success('Perfil actualizado correctamente')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al actualizar perfil')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Todos los campos de contraseña son obligatorios')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('La nueva contraseña y la confirmación no coinciden')
      return
    }

    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    setChangingPassword(true)
    try {
      // Verify current password
      const verifyRes = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          password: currentPassword,
        }),
      })

      if (!verifyRes.ok) {
        toast.error('La contraseña actual es incorrecta')
        setChangingPassword(false)
        return
      }

      // Update password
      const updateRes = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          password: newPassword,
        }),
      })

      if (updateRes.ok) {
        toast.success('Contraseña actualizada correctamente')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error('Error al actualizar la contraseña')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-uniajc-blue to-uniajc-blue-light" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
            <Avatar className={`size-20 border-4 border-white shadow-lg ${getAvatarColor(currentUser.role)}`}>
              {currentUser.avatar && (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              )}
              <AvatarFallback className="text-2xl font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2 sm:pb-1">
              <h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs px-2 py-0.5 h-5 rounded-full font-semibold ${getRoleBadgeColor(currentUser.role)}`}>
                  {getRoleLabel(currentUser.role)}
                </Badge>
                <span className="text-sm text-muted-foreground">{currentUser.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {currentUser.role === 'USER' && (
          <>
            <StatCard icon={<Ticket className="size-5" />} label="Tickets Creados" value={stats.created} color="bg-blue-50 text-blue-600" />
            <StatCard icon={<CheckCircle2 className="size-5" />} label="Resueltos" value={stats.resolved} color="bg-green-50 text-green-600" />
            <StatCard icon={<Clock className="size-5" />} label="Pendientes" value={stats.pending} color="bg-amber-50 text-amber-600" />
          </>
        )}
        {currentUser.role === 'AGENT' && (
          <>
            <StatCard icon={<Ticket className="size-5" />} label="Asignados" value={stats.assigned} color="bg-blue-50 text-blue-600" />
            <StatCard icon={<CheckCircle2 className="size-5" />} label="Resueltos" value={stats.resolved} color="bg-green-50 text-green-600" />
            <StatCard icon={<Clock className="size-5" />} label="En Progreso" value={stats.inProgress} color="bg-amber-50 text-amber-600" />
          </>
        )}
        {currentUser.role === 'ADMIN' && (
          <>
            <StatCard icon={<BarChart3 className="size-5" />} label="Total Tickets" value={stats.total} color="bg-blue-50 text-blue-600" />
            <StatCard icon={<CheckCircle2 className="size-5" />} label="Resueltos" value={stats.resolved} color="bg-green-50 text-green-600" />
            <StatCard icon={<Clock className="size-5" />} label="Pendientes" value={stats.pending} color="bg-amber-50 text-amber-600" />
          </>
        )}
      </div>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-5 text-uniajc-blue" />
            Información Personal
          </CardTitle>
          <CardDescription>Actualiza tu nombre y correo electrónico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  placeholder="Tu nombre"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="Tu email"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-uniajc-blue hover:bg-uniajc-blue-dark text-white"
          >
            <Save className="size-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card data-section="password">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="size-5 text-uniajc-blue" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Contraseña Actual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-9"
                placeholder="••••••"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="bg-uniajc-blue hover:bg-uniajc-blue-dark text-white"
          >
            <Lock className="size-4 mr-2" />
            {changingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-5 text-uniajc-blue" />
            Información de Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Fecha de registro:</span>
              <p className="font-medium">{formatDate(currentUser.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Última actualización:</span>
              <p className="font-medium">{formatDate(currentUser.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`size-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
