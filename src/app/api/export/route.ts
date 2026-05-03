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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('categoryId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build RBAC where clause
    const rbacWhere = buildRbacWhere(userId, role || 'USER');

    // Merge with optional filters
    const filters: Record<string, unknown> = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (categoryId) filters.categoryId = categoryId;

    // Combine RBAC with filters
    let where: Record<string, unknown>;
    if (Object.keys(filters).length > 0) {
      if (rbacWhere.OR) {
        // AGENT role with OR — need AND wrapper
        where = {
          AND: [rbacWhere, filters],
        };
      } else {
        where = { ...rbacWhere, ...filters };
      }
    } else {
      where = rbacWhere;
    }

    const tickets = await db.ticket.findMany({
      where,
      include: {
        category: { select: { name: true } },
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = [
      'ID',
      'Título',
      'Descripción',
      'Estado',
      'Prioridad',
      'Categoría',
      'Creado Por',
      'Asignado A',
      'Fecha Creación',
      'Fecha Actualización',
    ];

    const statusLabels: Record<string, string> = {
      OPEN: 'Abierto',
      IN_PROGRESS: 'En Progreso',
      RESOLVED: 'Resuelto',
      CLOSED: 'Cerrado',
    };

    const priorityLabels: Record<string, string> = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      CRITICAL: 'Crítica',
    };

    const rows = tickets.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      statusLabels[t.status] || t.status,
      priorityLabels[t.priority] || t.priority,
      t.category?.name || '',
      t.createdBy?.name || '',
      t.assignedTo?.name || 'Sin asignar',
      t.createdAt.toISOString(),
      t.updatedAt.toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=tickets-${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('Export tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
