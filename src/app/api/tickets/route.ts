import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Helper to build RBAC-aware where clause for tickets
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
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('categoryId');
    const assignedToId = searchParams.get('assignedToId');
    const createdById = searchParams.get('createdById');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    // Apply RBAC filtering if userId and role are provided
    if (userId && role) {
      const rbacWhere = buildRbacWhere(userId, role);
      if (Object.keys(rbacWhere).length > 0) {
        // Merge RBAC conditions with existing filters
        if (rbacWhere.OR) {
          // For AGENT role, we need to combine OR with AND for other filters
          const otherFilters: Record<string, unknown> = {};
          if (status) otherFilters.status = status;
          if (priority) otherFilters.priority = priority;
          if (categoryId) otherFilters.categoryId = categoryId;
          if (assignedToId) otherFilters.assignedToId = assignedToId;
          if (createdById) otherFilters.createdById = createdById;

          if (Object.keys(otherFilters).length > 0 || search) {
            where.AND = [
              rbacWhere,
              ...(Object.keys(otherFilters).length > 0 ? [otherFilters] : []),
              ...(search ? [{
                OR: [
                  { title: { contains: search } },
                  { description: { contains: search } },
                ],
              }] : []),
            ];
          } else {
            Object.assign(where, rbacWhere);
          }
        } else {
          // For USER role, simple merge
          Object.assign(where, rbacWhere);
        }
      }
    } else {
      // No RBAC — apply filters directly (backward compatible)
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (categoryId) where.categoryId = categoryId;
      if (assignedToId) where.assignedToId = assignedToId;
      if (createdById) where.createdById = createdById;

      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
        ];
      }
    }

    const tickets = await db.ticket.findMany({
      where,
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, categoryId, createdById, assignedToId, role } = body;

    if (!title || !description || !categoryId || !createdById) {
      return NextResponse.json(
        { error: 'Title, description, categoryId, and createdById are required' },
        { status: 400 }
      );
    }

    // Only ADMIN can assign a ticket on creation
    let finalAssignedToId: string | null = null;
    if (assignedToId) {
      if (role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Solo el administrador puede asignar tickets' },
          { status: 403 }
        );
      }
      finalAssignedToId = assignedToId;
    }

    const ticket = await db.ticket.create({
      data: {
        title,
        description,
        status: 'OPEN',
        priority: priority || 'MEDIUM',
        categoryId,
        createdById,
        assignedToId: finalAssignedToId,
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
