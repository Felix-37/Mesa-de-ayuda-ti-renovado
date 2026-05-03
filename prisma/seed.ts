import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Categories
  const hardware = await prisma.category.create({
    data: { name: 'Hardware', color: '#3B82F6', icon: 'Monitor' },
  });
  const software = await prisma.category.create({
    data: { name: 'Software', color: '#10B981', icon: 'Code' },
  });
  const red = await prisma.category.create({
    data: { name: 'Red', color: '#EF4444', icon: 'Wifi' },
  });
  const acceso = await prisma.category.create({
    data: { name: 'Acceso', color: '#F59E0B', icon: 'Key' },
  });

  console.log('✅ Categories created');

  // Create Users
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@uniajc.edu.co',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  const agente = await prisma.user.create({
    data: {
      email: 'agente@uniajc.edu.co',
      name: 'Carlos Agente',
      password: hashedPassword,
      role: 'AGENT',
      active: true,
    },
  });

  const usuario = await prisma.user.create({
    data: {
      email: 'usuario@uniajc.edu.co',
      name: 'María Usuario',
      password: hashedPassword,
      role: 'USER',
      active: true,
    },
  });

  const usuario2 = await prisma.user.create({
    data: {
      email: 'juan.perez@uniajc.edu.co',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: 'USER',
      active: true,
    },
  });

  const agente2 = await prisma.user.create({
    data: {
      email: 'ana.martinez@uniajc.edu.co',
      name: 'Ana Martínez',
      password: hashedPassword,
      role: 'AGENT',
      active: true,
    },
  });

  console.log('✅ Users created');

  // Create Tickets
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Computador del laboratorio 302 no enciende',
        description: 'El computador ubicado en la posición 5 del laboratorio 302 no enciende. Se ha verificado que está conectado a la corriente pero no hay señal de encendido. Posiblemente es problema de la fuente de poder.',
        status: 'OPEN',
        priority: 'HIGH',
        categoryId: hardware.id,
        createdById: usuario.id,
        assignedToId: agente.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Error al abrir Microsoft Office',
        description: 'Al intentar abrir Word o Excel, aparece un mensaje de error que dice "La aplicación no puede iniciarse correctamente". Ya se intentó reparar pero el problema persiste.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        categoryId: software.id,
        createdById: usuario2.id,
        assignedToId: agente.id,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Sin conexión a internet en el bloque B',
        description: 'Desde esta mañana no hay conexión a internet en todo el bloque B. Los estudiantes no pueden acceder a las plataformas educativas. Es urgente ya que hay evaluaciones programadas.',
        status: 'OPEN',
        priority: 'CRITICAL',
        categoryId: red.id,
        createdById: admin.id,
        assignedToId: agente2.id,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Solicitud de acceso al sistema de matrícula',
        description: 'Necesito acceso al sistema de matrícula para poder realizar las inscripciones del próximo semestre. Mi rol es coordinador académico.',
        status: 'OPEN',
        priority: 'MEDIUM',
        categoryId: acceso.id,
        createdById: usuario.id,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Impresora del piso 3 atascada',
        description: 'La impresora multifuncional del piso 3 está atascada y muestra error E3. Se ha intentado reiniciar pero sigue sin funcionar.',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        categoryId: hardware.id,
        createdById: usuario2.id,
        assignedToId: agente.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Actualización de Windows fallida',
        description: 'La última actualización de Windows causó que el equipo sea muy lento y algunos programas no funcionan correctamente. Se necesita restaurar o revertir la actualización.',
        status: 'RESOLVED',
        priority: 'HIGH',
        categoryId: software.id,
        createdById: usuario.id,
        assignedToId: agente2.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Restablecimiento de contraseña del correo institucional',
        description: 'No puedo acceder a mi correo institucional. Intenté restablecer la contraseña pero no me llega el correo de recuperación.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        categoryId: acceso.id,
        createdById: usuario2.id,
        assignedToId: agente.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Proyector del aula 201 no muestra imagen',
        description: 'El proyector del aula 201 enciende pero no muestra imagen desde ningún equipo. Se han probado diferentes cables VGA y HDMI pero sigue sin funcionar.',
        status: 'CLOSED',
        priority: 'MEDIUM',
        categoryId: hardware.id,
        createdById: usuario.id,
        assignedToId: agente2.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'VPN no conecta desde fuera del campus',
        description: 'Los docentes reportan que no pueden conectarse a la VPN desde sus casas para acceder a los recursos internos de la universidad.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        categoryId: red.id,
        createdById: admin.id,
        assignedToId: agente2.id,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Instalación de software estadístico R',
        description: 'Se requiere instalar el software R y RStudio en los 20 equipos del laboratorio de ingeniería para las clases del próximo módulo.',
        status: 'OPEN',
        priority: 'LOW',
        categoryId: software.id,
        createdById: usuario.id,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    }),
    prisma.ticket.create({
      data: {
        title: 'Cuenta de usuario bloqueada en Moodle',
        description: 'Mi cuenta en la plataforma Moodle aparece bloqueada y no puedo acceder a mis cursos. Necesito que la desbloqueen urgente porque tengo entregas pendientes.',
        status: 'CLOSED',
        priority: 'HIGH',
        categoryId: acceso.id,
        createdById: usuario2.id,
        assignedToId: agente.id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('✅ Tickets created');

  // Create Comments
  const commentsData = [
    // Ticket 1 (Hardware - computador no enciende)
    {
      content: 'Ya revisé físicamente el equipo. Efectivamente no enciende, voy a revisar la fuente de poder.',
      ticketId: tickets[0].id,
      authorId: agente.id,
    },
    {
      content: 'Gracias por la pronta atención. Es urgente porque los estudiantes lo necesitan para su proyecto.',
      ticketId: tickets[0].id,
      authorId: usuario.id,
    },
    // Ticket 2 (Software - Office)
    {
      content: 'Estoy revisando la instalación de Office. Parece que falta una actualización crítica.',
      ticketId: tickets[1].id,
      authorId: agente.id,
    },
    // Ticket 3 (Red - sin internet bloque B)
    {
      content: 'Confirmo la falla. El switch principal del bloque B no responde. Estoy en camino para revisar físicamente.',
      ticketId: tickets[2].id,
      authorId: agente2.id,
    },
    {
      content: 'Es muy urgente, hay evaluaciones programadas para hoy a las 2pm. Por favor priorizar.',
      ticketId: tickets[2].id,
      authorId: admin.id,
    },
    // Ticket 6 (Software - Windows actualización) - RESOLVED
    {
      content: 'Se revirtió la actualización y el equipo funciona normalmente ahora.',
      ticketId: tickets[5].id,
      authorId: agente2.id,
    },
    {
      content: 'Confirmo que ya funciona correctamente. Muchas gracias!',
      ticketId: tickets[5].id,
      authorId: usuario.id,
    },
    // Ticket 7 (Acceso - contraseña) - RESOLVED
    {
      content: 'Se restableció la contraseña. Se envió un correo temporal a su correo personal registrado.',
      ticketId: tickets[6].id,
      authorId: agente.id,
    },
    // Ticket 9 (Red - VPN)
    {
      content: 'Identifiqué el problema. Hay un certificado SSL vencido en el servidor VPN. Estoy renovándolo.',
      ticketId: tickets[8].id,
      authorId: agente2.id,
    },
    {
      content: 'El certificado fue renovado. Probando conexión desde sitio externo...',
      ticketId: tickets[8].id,
      authorId: agente2.id,
    },
    // Ticket 8 (Hardware - proyector) - CLOSED
    {
      content: 'Se reemplazó la lámpara del proyector. Ahora funciona correctamente.',
      ticketId: tickets[7].id,
      authorId: agente2.id,
    },
    // Ticket 11 (Acceso - Moodle bloqueada) - CLOSED
    {
      content: 'La cuenta fue desbloqueada. El problema fue por múltiples intentos fallidos de acceso.',
      ticketId: tickets[10].id,
      authorId: agente.id,
    },
    {
      content: 'Ya puedo acceder. Gracias por la ayuda.',
      ticketId: tickets[10].id,
      authorId: usuario2.id,
    },
  ];

  for (const commentData of commentsData) {
    await prisma.comment.create({ data: commentData });
  }

  console.log('✅ Comments created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
