'use client'

import { useAppStore } from '@/lib/store'
import { getRoleLabel } from '@/lib/utils'
import type { AppView, UserRole } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Bell,
  Monitor,
  Download,
  Lock,
  LogOut,
  Mail,
  Eye,
} from 'lucide-react'

function getDefaultViewOptions(role: UserRole): Array<{ value: AppView; label: string }> {
  const common: Array<{ value: AppView; label: string }> = [
    { value: 'dashboard', label: 'Dashboard' },
  ]

  if (role === 'USER') {
    common.push({ value: 'my-tickets', label: 'Mis Tickets' })
  }

  if (role === 'AGENT' || role === 'ADMIN') {
    common.push(
      { value: 'kanban', label: 'Tablero Kanban' },
      { value: 'tickets', label: 'Tickets' }
    )
  }

  return common
}

export function SettingsView() {
  const { currentUser, settings, setSettings, logout } = useAppStore()

  if (!currentUser) return null

  const defaultViewOptions = getDefaultViewOptions(currentUser.role)

  const handleExportMyTickets = async () => {
    try {
      const res = await fetch(`/api/export?userId=${currentUser.id}&role=${currentUser.role}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mis-tickets-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Tickets exportados correctamente')
      } else {
        toast.error('Error al exportar tickets')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const handleExportAllTickets = async () => {
    try {
      const res = await fetch(`/api/export?userId=${currentUser.id}&role=${currentUser.role}&all=true`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `todos-tickets-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Todos los tickets exportados correctamente')
      } else {
        toast.error('Error al exportar tickets')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings({ [key]: value })
    toast.success('Configuración guardada')
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-5 text-uniajc-blue" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura cómo recibes las notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Mail className="size-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Notificaciones por correo</p>
                <p className="text-xs text-muted-foreground">Recibir notificaciones en tu email</p>
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="size-5 text-uniajc-blue" />
            Apariencia
          </CardTitle>
          <CardDescription>Personaliza la vista de la aplicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Eye className="size-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Modo compacto</p>
                <p className="text-xs text-muted-foreground">Reduce el espaciado en la interfaz</p>
              </div>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Monitor className="size-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Vista predeterminada</p>
                <p className="text-xs text-muted-foreground">Página de inicio al iniciar sesión</p>
              </div>
            </div>
            <Select
              value={settings.defaultView}
              onValueChange={(value) => handleSettingChange('defaultView', value as AppView)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {defaultViewOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="size-5 text-uniajc-blue" />
            Datos
          </CardTitle>
          <CardDescription>Exporta y gestiona tus datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-auto py-3"
            onClick={handleExportMyTickets}
          >
            <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <Download className="size-4 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Exportar mis tickets</p>
              <p className="text-xs text-muted-foreground">Descarga tus tickets en formato CSV</p>
            </div>
          </Button>

          {(currentUser.role === 'ADMIN' || currentUser.role === 'AGENT') && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              onClick={handleExportAllTickets}
            >
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Download className="size-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Exportar todos los tickets</p>
                <p className="text-xs text-muted-foreground">Descarga todos los tickets en formato CSV</p>
              </div>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="size-5 text-uniajc-blue" />
            Cuenta
          </CardTitle>
          <CardDescription>Gestiona tu cuenta y sesión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-auto py-3"
            onClick={() => useAppStore.getState().setCurrentView('profile')}
          >
            <div className="size-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Lock className="size-4 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Cambiar contraseña</p>
              <p className="text-xs text-muted-foreground">Actualiza tu contraseña de acceso</p>
            </div>
          </Button>

          <Separator />

          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-auto py-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={logout}
          >
            <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <LogOut className="size-4 text-red-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Cerrar sesión</p>
              <p className="text-xs text-red-400">Salir de tu cuenta</p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
