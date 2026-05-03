import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Status helpers ──────────────────────────────────────────────

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En Progreso',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
  }
  return labels[status] ?? status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}

// ── Priority helpers ────────────────────────────────────────────

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
  }
  return labels[priority] ?? priority
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }
  return colors[priority] ?? 'bg-gray-100 text-gray-800'
}

// ── Role helpers ────────────────────────────────────────────────

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    AGENT: 'Agente',
    USER: 'Usuario',
  }
  return labels[role] ?? role
}

// ── Date helpers ────────────────────────────────────────────────

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd MMM yyyy', { locale: es })
}

export function formatDateTime(date: string): string {
  return format(parseISO(date), 'dd MMM yyyy HH:mm', { locale: es })
}

export function timeAgo(date: string): string {
  const distance = formatDistanceToNow(parseISO(date), { locale: es, addSuffix: false })
  return `hace ${distance}`
}
