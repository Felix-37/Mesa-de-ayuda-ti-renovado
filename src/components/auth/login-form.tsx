'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import type { UserRole } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const { login } = useAppStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('USER')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setConfirmPassword('')
    setRole('USER')
    setError('')
    setShowPassword(false)
  }

  const handleModeToggle = (newMode: 'login' | 'register') => {
    setMode(newMode)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email || !password) {
      setError('Por favor complete todos los campos requeridos')
      return
    }

    if (mode === 'register') {
      if (!name) {
        setError('Por favor ingrese su nombre')
        return
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }
    }

    setLoading(true)

    try {
      const url = '/api/auth'
      const method = mode === 'login' ? 'POST' : 'PUT'
      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, name, role }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ha ocurrido un error')
        return
      }

      login(data)
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const demoCredentials = [
    { label: 'Admin', email: 'admin@uniajc.edu.co', role: 'ADMIN' },
    { label: 'Agente', email: 'agente@uniajc.edu.co', role: 'AGENT' },
    { label: 'Usuario', email: 'usuario@uniajc.edu.co', role: 'USER' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-uniajc-blue p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-yellow-500/10 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <Image
                src="/logo.png"
                alt="UNIAJC Logo"
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl font-black text-navy-900 tracking-tight">
              Mesa de Ayuda TI
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm">
              Universidad Antonio José Camacho
            </CardDescription>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-muted p-1 mt-4">
            <button
              type="button"
              onClick={() => handleModeToggle('login')}
              className={`flex-1 rounded-md py-2 text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle('register')}
              className={`flex-1 rounded-md py-2 text-sm font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Registrarse
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm border border-destructive/20">
                {error}
              </div>
            )}

            {/* Name field - Register only */}
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@uniajc.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password - Register only */}
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Role Selection - Register only */}
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="AGENT">Agente</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-navy-900 hover:bg-navy-800 text-white h-11 text-base font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {mode === 'login' ? 'Iniciando sesión...' : 'Registrando...'}
                </>
              ) : (
                mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'
              )}
            </Button>

            {/* Demo credentials hint */}
            <div className="text-center text-xs text-muted-foreground space-y-2 pt-3 border-t">
              <p className="font-bold text-navy-800 uppercase tracking-wider text-[10px]">
                Credenciales de prueba
              </p>
              <div className="grid grid-cols-3 gap-2">
                {demoCredentials.map((cred) => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => {
                      setEmail(cred.email)
                      setPassword('123456')
                      setMode('login')
                    }}
                    className="rounded-lg border p-2 hover:bg-muted transition-colors text-center"
                  >
                    <p className="font-bold text-[10px] text-navy-900">{cred.label}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{cred.email}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                Contraseña: 123456
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
