'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'
import type { TicketPriority } from '@/lib/types'

interface ChartsData {
  ticketsByPriority: Record<TicketPriority, number>
  ticketsByCategory: { category: string; count: number; color: string }[]
  ticketsOverTime: { date: string; count: number }[]
}

interface ChartsProps {
  data: ChartsData | null
  loading: boolean
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#3b82f6',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
}

const CATEGORY_FALLBACK_COLORS = [
  '#1a3f7a',
  '#f5c518',
  '#2a5298',
  '#fbd84b',
  '#475569',
  '#0891b2',
]

const CHART_COLORS = {
  area: '#1a3f7a',
  areaLight: '#2a5298',
  grid: '#e2e8f0',
  axisText: '#64748b',
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-lg dark:bg-gray-800">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </p>
      {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export function Charts({ data, loading }: ChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    )
  }

  if (!data) return null

  // Transform priority data for bar chart
  const priorityData = (Object.entries(data.ticketsByPriority) as [TicketPriority, number][]).map(
    ([key, value]) => ({
      name: PRIORITY_LABELS[key],
      value,
      fill: PRIORITY_COLORS[key],
    })
  )

  // Transform category data for pie chart - filter out categories with 0 tickets
  const categoryData = data.ticketsByCategory
    .filter((cat) => cat.count > 0)
    .map((cat, index) => ({
      name: typeof cat.category === 'string' ? cat.category : (cat.category as { name: string }).name,
      value: cat.count,
      color: cat.color || (typeof cat.category === 'string' ? '' : (cat.category as { color: string }).color) || CATEGORY_FALLBACK_COLORS[index % CATEGORY_FALLBACK_COLORS.length],
    }))

  // Format date labels for the area chart
  const timeData = data.ticketsOverTime.map((item) => {
    const date = new Date(item.date + 'T12:00:00')
    const dayLabel = date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
    return { ...item, label: dayLabel }
  })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Bar Chart - Tickets by Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tickets por Prioridad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: CHART_COLORS.axisText, fontSize: 12 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                />
                <YAxis
                  tick={{ fill: CHART_COLORS.axisText, fontSize: 12 }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tickets" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart - Tickets by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tickets por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.length > 0 ? categoryData : [{ name: 'Sin datos', value: 1, color: '#e2e8f0' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    categoryData.length === 0 ? '' : `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={categoryData.length > 0}
                >
                  {categoryData.length > 0 ? categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color || CATEGORY_FALLBACK_COLORS[index % CATEGORY_FALLBACK_COLORS.length]} />
                  )) : <Cell fill="#e2e8f0" />}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Area Chart - Tickets Over Time */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tickets en los Últimos 7 Días</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {timeData.every((d) => d.count === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BarChart3 className="size-12 opacity-30 mb-2" />
                <p className="text-sm">No hay tickets en los últimos 7 días</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.area} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.area} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: CHART_COLORS.axisText, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.grid }}
                  />
                  <YAxis
                    tick={{ fill: CHART_COLORS.axisText, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.grid }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Tickets"
                    stroke={CHART_COLORS.area}
                    strokeWidth={2}
                    fill="url(#colorTickets)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
