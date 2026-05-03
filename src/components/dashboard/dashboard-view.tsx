'use client'

import { useEffect, useState, useCallback } from 'react'
import { StatsCards } from './stats-cards'
import { Charts } from './charts'
import { RecentTickets } from './recent-tickets'
import type { TicketPriority, Ticket } from '@/lib/types'

interface DashboardData {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
  ticketsByPriority: Record<TicketPriority, number>
  ticketsByCategory: {
    category: { id: string; name: string; color: string; icon?: string | null }
    count: number
  }[]
  recentTickets: Ticket[]
  ticketsOverTime: { date: string; count: number }[]
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Error al cargar datos del dashboard')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="mt-4 text-lg font-medium text-foreground">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 rounded-lg bg-uniajc-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-uniajc-blue-light"
        >
          Reintentar
        </button>
      </div>
    )
  }

  // Transform category data for Charts component compatibility
  const chartData = data
    ? {
        ticketsByPriority: data.ticketsByPriority,
        ticketsByCategory: data.ticketsByCategory.map((cat) => ({
          category: cat.category.name,
          count: cat.count,
          color: cat.category.color,
        })),
        ticketsOverTime: data.ticketsOverTime,
      }
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Panel de Control
        </h1>
        <p className="mt-1 text-muted-foreground">
          Resumen general de la Mesa de Ayuda TI — UNIAJC
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards data={data} loading={loading} />

      {/* Charts */}
      <Charts data={chartData} loading={loading} />

      {/* Recent Tickets */}
      <RecentTickets
        tickets={data?.recentTickets ?? null}
        loading={loading}
      />
    </div>
  )
}
