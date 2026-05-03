import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Basic counts
    const totalTickets = await db.ticket.count();
    const openTickets = await db.ticket.count({ where: { status: 'OPEN' } });
    const inProgressTickets = await db.ticket.count({ where: { status: 'IN_PROGRESS' } });
    const resolvedTickets = await db.ticket.count({ where: { status: 'RESOLVED' } });
    const closedTickets = await db.ticket.count({ where: { status: 'CLOSED' } });

    // Tickets by priority
    const lowPriority = await db.ticket.count({ where: { priority: 'LOW' } });
    const mediumPriority = await db.ticket.count({ where: { priority: 'MEDIUM' } });
    const highPriority = await db.ticket.count({ where: { priority: 'HIGH' } });
    const criticalPriority = await db.ticket.count({ where: { priority: 'CRITICAL' } });

    // Tickets by category
    const categoriesWithCounts = await db.category.findMany({
      include: {
        _count: {
          select: { tickets: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const ticketsByCategory = categoriesWithCounts.map((cat) => ({
      category: {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      },
      count: cat._count.tickets,
    }));

    // Recent tickets
    const recentTickets = await db.ticket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Tickets over time (last 7 days)
    const now = new Date();
    const ticketsOverTime = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = await db.ticket.count({
        where: {
          createdAt: {
            gte: day,
            lt: nextDay,
          },
        },
      });

      ticketsOverTime.push({
        date: day.toISOString().split('T')[0],
        count,
      });
    }

    return NextResponse.json({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      ticketsByPriority: {
        LOW: lowPriority,
        MEDIUM: mediumPriority,
        HIGH: highPriority,
        CRITICAL: criticalPriority,
      },
      ticketsByCategory,
      recentTickets,
      ticketsOverTime,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
