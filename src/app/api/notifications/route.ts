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
      ],
    };
  }
  // USER role — only own tickets
  return { createdById: userId };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build notifications from recent ticket activity based on RBAC
    const notifications: Array<{
      id: string;
      type: 'TICKET_CREATED' | 'TICKET_ASSIGNED' | 'TICKET_UPDATED' | 'TICKET_COMMENT' | 'TICKET_RESOLVED' | 'TICKET_CLOSED';
      title: string;
      message: string;
      ticketId: string;
      read: boolean;
      createdAt: string;
    }> = [];

    if (role === 'USER') {
      // For USER: notifications about their own tickets
      const userTickets = await db.ticket.findMany({
        where: { createdById: userId },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          assignedTo: { select: { id: true, name: true } },
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              authorId: true,
              author: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      });

      for (const ticket of userTickets) {
        // Ticket assigned notification
        if (ticket.assignedTo) {
          notifications.push({
            id: `assigned-${ticket.id}`,
            type: 'TICKET_ASSIGNED',
            title: 'Ticket asignado',
            message: `"${ticket.title}" fue asignado a ${ticket.assignedTo.name}`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Ticket resolved
        if (ticket.status === 'RESOLVED') {
          notifications.push({
            id: `resolved-${ticket.id}`,
            type: 'TICKET_RESOLVED',
            title: 'Ticket resuelto',
            message: `"${ticket.title}" ha sido resuelto`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Ticket closed
        if (ticket.status === 'CLOSED') {
          notifications.push({
            id: `closed-${ticket.id}`,
            type: 'TICKET_CLOSED',
            title: 'Ticket cerrado',
            message: `"${ticket.title}" ha sido cerrado`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Comments from others (not the user's own comments)
        for (const comment of ticket.comments) {
          if (comment.authorId !== userId) {
            notifications.push({
              id: `comment-${comment.id}`,
              type: 'TICKET_COMMENT',
              title: 'Nuevo comentario',
              message: `${comment.author.name} comentó en "${ticket.title}"`,
              ticketId: ticket.id,
              read: false,
              createdAt: comment.createdAt.toISOString(),
            });
          }
        }
      }
    } else if (role === 'AGENT') {
      // For AGENT: notifications about assigned + unassigned tickets
      const agentTickets = await db.ticket.findMany({
        where: {
          OR: [
            { assignedToId: userId },
            { assignedToId: null },
          ],
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
          assignedToId: true,
          createdBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
          comments: {
            take: 2,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              authorId: true,
              author: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 15,
      });

      for (const ticket of agentTickets) {
        // New ticket notification (for unassigned ones the agent can pick up)
        if (!ticket.assignedToId) {
          notifications.push({
            id: `created-${ticket.id}`,
            type: 'TICKET_CREATED',
            title: 'Nuevo ticket sin asignar',
            message: `${ticket.createdBy.name} creó "${ticket.title}"`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.createdAt.toISOString(),
          });
        }

        // Assigned to this agent
        if (ticket.assignedToId === userId) {
          notifications.push({
            id: `assigned-${ticket.id}`,
            type: 'TICKET_ASSIGNED',
            title: 'Ticket asignado',
            message: `"${ticket.title}" te fue asignado`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Ticket resolved
        if (ticket.status === 'RESOLVED') {
          notifications.push({
            id: `resolved-${ticket.id}`,
            type: 'TICKET_RESOLVED',
            title: 'Ticket resuelto',
            message: `"${ticket.title}" ha sido resuelto`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Ticket closed
        if (ticket.status === 'CLOSED') {
          notifications.push({
            id: `closed-${ticket.id}`,
            type: 'TICKET_CLOSED',
            title: 'Ticket cerrado',
            message: `"${ticket.title}" ha sido cerrado`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Comments from others on assigned tickets
        for (const comment of ticket.comments) {
          if (comment.authorId !== userId) {
            notifications.push({
              id: `comment-${comment.id}`,
              type: 'TICKET_COMMENT',
              title: 'Nuevo comentario',
              message: `${comment.author.name} comentó en "${ticket.title}"`,
              ticketId: ticket.id,
              read: false,
              createdAt: comment.createdAt.toISOString(),
            });
          }
        }
      }
    } else {
      // ADMIN: all recent activity
      const recentTickets = await db.ticket.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
          assignedToId: true,
          createdBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
          comments: {
            take: 2,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              authorId: true,
              author: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 15,
      });

      for (const ticket of recentTickets) {
        // New ticket created
        notifications.push({
          id: `created-${ticket.id}`,
          type: 'TICKET_CREATED',
          title: 'Nuevo ticket',
          message: `${ticket.createdBy.name} creó "${ticket.title}"`,
          ticketId: ticket.id,
          read: false,
          createdAt: ticket.createdAt.toISOString(),
        });

        // Ticket assigned
        if (ticket.assignedTo) {
          notifications.push({
            id: `assigned-${ticket.id}`,
            type: 'TICKET_ASSIGNED',
            title: 'Ticket asignado',
            message: `"${ticket.title}" fue asignado a ${ticket.assignedTo.name}`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Ticket resolved
        if (ticket.status === 'RESOLVED') {
          notifications.push({
            id: `resolved-${ticket.id}`,
            type: 'TICKET_RESOLVED',
            title: 'Ticket resuelto',
            message: `"${ticket.title}" ha sido resuelto`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Ticket closed
        if (ticket.status === 'CLOSED') {
          notifications.push({
            id: `closed-${ticket.id}`,
            type: 'TICKET_CLOSED',
            title: 'Ticket cerrado',
            message: `"${ticket.title}" ha sido cerrado`,
            ticketId: ticket.id,
            read: false,
            createdAt: ticket.updatedAt.toISOString(),
          });
        }

        // Comments
        for (const comment of ticket.comments) {
          if (comment.authorId !== userId) {
            notifications.push({
              id: `comment-${comment.id}`,
              type: 'TICKET_COMMENT',
              title: 'Nuevo comentario',
              message: `${comment.author.name} comentó en "${ticket.title}"`,
              ticketId: ticket.id,
              read: false,
              createdAt: comment.createdAt.toISOString(),
            });
          }
        }
      }
    }

    // Sort by createdAt desc and take top 20
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const result = notifications.slice(0, 20);

    // Mark some as "read" based on age (older than 1 hour = read)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const n of result) {
      if (new Date(n.createdAt) < oneHourAgo) {
        n.read = true;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
