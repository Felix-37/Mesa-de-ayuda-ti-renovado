'use client'

import { Ticket, CircleDot, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsData {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
}

interface StatsCardsProps {
  data: StatsData | null
  loading: boolean
}

const statsConfig = [
  {
    key: 'totalTickets' as const,
    label: 'Total Tickets',
    icon: Ticket,
    gradient: 'from-uniajc-blue to-uniajc-blue-light',
    iconBg: 'bg-white/20',
    textColor: 'text-white',
    valueColor: 'text-white',
  },
  {
    key: 'openTickets' as const,
    label: 'Abiertos',
    icon: CircleDot,
    gradient: 'from-blue-500 to-blue-400',
    iconBg: 'bg-white/20',
    textColor: 'text-white',
    valueColor: 'text-white',
  },
  {
    key: 'inProgressTickets' as const,
    label: 'En Progreso',
    icon: Clock,
    gradient: 'from-uniajc-yellow to-uniajc-yellow-light',
    iconBg: 'bg-white/20',
    textColor: 'text-white',
    valueColor: 'text-white',
  },
  {
    key: 'resolvedTickets' as const,
    label: 'Resueltos',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-emerald-400',
    iconBg: 'bg-white/20',
    textColor: 'text-white',
    valueColor: 'text-white',
  },
  {
    key: 'closedTickets' as const,
    label: 'Cerrados',
    icon: XCircle,
    gradient: 'from-gray-500 to-gray-400',
    iconBg: 'bg-white/20',
    textColor: 'text-white',
    valueColor: 'text-white',
  },
]

function StatsCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 py-0">
      <Skeleton className="h-28 w-full rounded-none" />
    </Card>
  )
}

export function StatsCards({ data, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!data) return null

  const total = data.totalTickets || 1

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {statsConfig.map((config) => {
        const value = data[config.key]
        const percentage = Math.round((value / total) * 100)
        const Icon = config.icon

        return (
          <Card
            key={config.key}
            className="overflow-hidden border-0 py-0 transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className={`bg-gradient-to-br ${config.gradient} p-4 sm:p-6`}>
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.iconBg}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5">
                  <TrendingUp className="h-3 w-3 text-white" />
                  <span className="text-xs font-medium text-white">{percentage}%</span>
                </div>
              </div>
              <div className="mt-3">
                <p className={`text-2xl font-bold sm:text-3xl ${config.valueColor}`}>
                  {value}
                </p>
                <p className={`text-sm ${config.textColor} opacity-80`}>
                  {config.label}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
