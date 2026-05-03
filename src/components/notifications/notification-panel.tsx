'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import type { Notification } from '@/lib/types'
import { timeAgo } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Bell,
  Ticket,
  UserPlus,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  XCircle,
  CheckCheck,
} from 'lucide-react'

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'TICKET_CREATED':
      return <Ticket className="size-4 text-blue-500" />
    case 'TICKET_ASSIGNED':
      return <UserPlus className="size-4 text-green-500" />
    case 'TICKET_UPDATED':
      return <RefreshCw className="size-4 text-orange-500" />
    case 'TICKET_COMMENT':
      return <MessageSquare className="size-4 text-purple-500" />
    case 'TICKET_RESOLVED':
      return <CheckCircle2 className="size-4 text-emerald-500" />
    case 'TICKET_CLOSED':
      return <XCircle className="size-4 text-gray-500" />
    default:
      return <Bell className="size-4 text-muted-foreground" />
  }
}

export function NotificationPanel() {
  const { currentUser, notifications, setNotifications, markAllNotificationsRead, setSelectedTicketId, setCurrentView } = useAppStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}&role=${currentUser.role}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [currentUser, setNotifications])

  useEffect(() => {
    if (currentUser) {
      fetchNotifications()
      // Refresh every 60 seconds
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [currentUser, fetchNotifications])

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.ticketId) {
      setSelectedTicketId(notification.ticketId)
      setCurrentView('ticket-detail')
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="size-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0">
        <div className="flex items-center justify-between p-4 pb-3">
          <h3 className="font-semibold text-sm">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-uniajc-blue hover:text-uniajc-blue-dark"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-3.5 mr-1" />
              Marcar todo como leído
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-96">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-6 border-2 border-uniajc-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="size-8 mb-2 opacity-40" />
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors flex gap-3 ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="size-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
