import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Build RBAC where clause for ticket queries
 */
function buildRbacWhere(userId: string, role: string): Record<string, unknown> {
  if (role === 'ADMIN') {
    return {};
  }
  if (role === 'AGENT') {
    return {
      OR: [
        { assignedToId: userId },
        { assignedToId: null },
        { createdById: userId },
      ],
    };
  }
  // USER role — only own tickets
  return { createdById: userId };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    // Base where clause from RBAC
    const rbacWhere = userId && role ? buildRbacWhere(userId, role) : {};

    // Basic counts with RBAC
    const totalTickets = await db.ticket.count({ where: rbacWhere });
    const openTickets = await db.ticket.count({ where: { ...rbacWhere, status: 'OPEN' } });
    const inProgressTickets = await db.ticket.count({ where: { ...rbacWhere, status: 'IN_PROGRESS' } });
    const resolvedTickets = await db.ticket.count({ where: { ...rbacWhere, status: 'RESOLVED' } });
    const closedTickets = await db.ticket.count({ where: { ...rbacWhere, status: 'CLOSED' } });

    // Tickets by priority with RBAC
    const lowPriority = await db.ticket.count({ where: { ...rbacWhere, priority: 'LOW' } });
    const mediumPriority = await db.ticket.count({ where: { ...rbacWhere, priority: 'MEDIUM' } });
    const highPriority = await db.ticket.count({ where: { ...rbacWhere, priority: 'HIGH' } });
    const criticalPriority = await db.ticket.count({ where: { ...rbacWhere, priority: 'CRITICAL' } });

    // Tickets by category with RBAC
    const categoriesWithCounts = await db.category.findMany({
      include: {
        _count: {
          select: { tickets: { where: rbacWhere } },
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

    // Recent tickets with RBAC
    const recentTickets = await db.ticket.findMany({
      where: rbacWhere,
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

    // Tickets over time (last 7 days) with RBAC
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
          ...rbacWhere,
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
