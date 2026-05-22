# 🎓 Mesa de Ayuda UNIAJC — Sistema de Tickets TI

Sistema web de mesa de ayuda (Help Desk) para la gestión de tickets de soporte técnico de la Institución Universitaria Antonio José Camacho (UNIAJC). Desarrollado con Next.js 16, TypeScript, Prisma ORM y SQLite.

---

## 📋 Descripción General

La aplicación permite a los usuarios de la institución reportar problemas técnicos (hardware, software, red, accesos) mediante tickets de soporte. Un equipo de agentes atiende y resuelve estos tickets, mientras que los administradores tienen control total sobre el sistema incluyendo asignación de tickets y gestión de usuarios.

### Roles y Permisos (RBAC)

| Rol | Vista de Tickets | Asignar Tickets | Gestión Usuarios |
|---|---|---|---|
| **ADMIN** | Todos los tickets | ✅ Sí | ✅ Sí |
| **AGENT** | Asignados a sí + Sin asignar + Propios | ❌ No | ❌ No |
| **USER** | Solo los creados por sí mismo | ❌ No | ❌ No |

### Funcionalidades principales

- 🔐 Autenticación con email/contraseña (bcrypt)
- 📊 Dashboard con estadísticas y gráficos (ADMIN/AGENT)
- 📋 Tablero Kanban con drag & drop (ADMIN/AGENT) / Solo lectura (USER)
- 🎫 CRUD completo de tickets con filtros y búsqueda
- 💬 Sistema de comentarios por ticket
- 🔔 Notificaciones basadas en actividad de tickets
- 👤 Perfil de usuario y configuración
- 📥 Exportación de tickets a CSV
- 📱 Diseño responsivo con identidad visual UNIAJC

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
src/
├── app/
│   ├── globals.css          # Estilos globales + variables CSS UNIAJC
│   ├── layout.tsx           # Layout raíz con metadata
│   ├── page.tsx             # Página principal (SPA — ruta única "/")
│   └── api/                 # API Routes (backend)
│       ├── auth/            # Autenticación (login/registro)
│       ├── categories/      # Categorías de tickets
│       ├── dashboard/       # Estadísticas del dashboard
│       ├── export/          # Exportación CSV
│       ├── notifications/   # Notificaciones por rol
│       ├── tickets/         # CRUD de tickets + comentarios
│       └── users/           # Gestión de usuarios
├── components/
│   ├── auth/                # Formulario de login/registro
│   ├── dashboard/           # Vista de dashboard con gráficos
│   ├── kanban/              # Tablero Kanban (board, column, card)
│   ├── layout/              # Header y Sidebar de la aplicación
│   ├── notifications/       # Panel de notificaciones
│   ├── profile/             # Vista de perfil de usuario
│   ├── settings/            # Configuración de la aplicación
│   ├── tickets/             # Lista, detalle y formulario de tickets
│   ├── ui/                  # Componentes primitivos shadcn/ui (40+)
│   └── users/               # Gestión de usuarios (admin)
├── hooks/                   # Custom React hooks
├── lib/
│   ├── db.ts                # Cliente Prisma singleton
│   ├── store.ts             # Store global Zustand
│   ├── types.ts             # Tipos TypeScript compartidos
│   └── utils.ts             # Utilidades (cn, formateo de fechas, labels)
prisma/
├── schema.prisma            # Esquema de base de datos
└── seed.ts                  # Datos iniciales de prueba
db/
└── custom.db                # Base de datos SQLite
```

### Patrón de Arquitectura

La aplicación funciona como una **SPA (Single Page Application)** dentro de Next.js App Router:

- **Una sola ruta** (`/`) renderiza todo el contenido
- La navegación se maneja vía **estado en Zustand** (`currentView`) — no hay rutas de Next.js adicionales
- El componente `ViewRenderer` en `page.tsx` intercambia vistas según el estado
- Los datos se obtienen mediante **API Routes** internas (`/api/...`)
- El estado del cliente se centraliza en **Zustand** (auth, tickets, filtros, UI)

### Modelo de Datos

```
User ──< Ticket (createdById)   "Un usuario crea muchos tickets"
User ──< Ticket (assignedToId)  "Un agente tiene muchos tickets asignados"
User ──< Comment                "Un usuario escribe muchos comentarios"
Category ──< Ticket             "Una categoría agrupa muchos tickets"
Ticket ──< Comment              "Un ticket tiene muchos comentarios"
```

---

## ⚙️ Requisitos Previos

| Dependencia | Versión | Cómo verificar |
|---|---|---|
| **Node.js** | ≥ 18 | `node --version` |
| **npm** | ≥ 9 (incluido con Node.js) | `npm --version` |
| **SQLite** | Incluido con Prisma | No requiere instalación |

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=file:./db/custom.db
```

> La ruta puede ser absoluta o relativa. El archivo SQLite se crea automáticamente al ejecutar `prisma db push`.

---

## 🚀 Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Felix-37/Mesa-de-ayuda-ti-renovado.git
cd Mesa-de-ayuda-ti-renovado
npm install
```

### 2. Configurar entorno y base de datos

```bash
# Copiar el archivo de configuración de entorno
copy .env.example .env        # Windows (CMD)
cp .env.example .env           # macOS/Linux

# Crear el esquema en SQLite
npm run db:push

# Generar el cliente Prisma
npm run db:generate

# Cargar datos de prueba (usuarios, tickets, comentarios)
npm run db:seed
```

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

> **💡 Resumen rápido (3 comandos después de clonar):**
> ```bash
> npm install
> copy .env.example .env && npm run db:push && npm run db:generate && npm run db:seed
> npm run dev
> ```

### 4. Credenciales de prueba

Después de ejecutar el seed, estos usuarios están disponibles:

| Email | Contraseña | Rol |
|---|---|---|
| `admin@uniajc.edu.co` | `123456` | ADMIN |
| `agente@uniajc.edu.co` | `123456` | AGENT |
| `ana.martinez@uniajc.edu.co` | `123456` | AGENT |
| `usuario@uniajc.edu.co` | `123456` | USER |
| `juan.perez@uniajc.edu.co` | `123456` | USER |

### Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Build de producción (standalone output)
npm run lint         # Linting con ESLint
npm run db:push      # Sincronizar esquema Prisma → SQLite
npm run db:generate  # Generar cliente Prisma
npm run db:seed      # Cargar datos iniciales
npm run db:reset     # Resetear base de datos
```

---

## 🔄 Flujo de Funcionamiento

### Ciclo de vida de un Ticket

```
[Usuario crea ticket] → OPEN
                         ↓  (Agente/Admin inicia progreso)
                    IN_PROGRESS
                         ↓  (Agente/Admin marca resuelto)
                      RESOLVED
                         ↓  (Admin/Agente cierra ticket)
                       CLOSED
                         ↓  (Se puede reabrir → OPEN)
```

### Flujo de autenticación

1. El usuario ingresa email y contraseña en `LoginForm`
2. Se envía `POST /api/auth` con `{ email, password }`
3. El backend busca el usuario, compara con bcrypt y retorna el objeto user (sin contraseña)
4. El store Zustand almacena `currentUser` e `isAuthenticated: true`
5. La vista cambia según el rol: USER → `kanban`, ADMIN/AGENT → `dashboard`

### Flujo de datos en la aplicación

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Componente  │────▶│  Zustand      │────▶│  API Route       │
│  (React UI)  │◀────│  Store        │◀────│  (Next.js)       │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │  Prisma Client   │
                                           │  (SQLite)        │
                                           └─────────────────┘
```

1. **Componentes React** disparan acciones (click, submit, drag)
2. **Zustand store** actualiza el estado optimista y llama a la API
3. **API Routes** ejecutan consultas Prisma contra SQLite
4. La respuesta actualiza el store y el UI se re-renderiza

### Sistema de notificaciones

Las notificaciones se **generan dinámicamente** a partir de la actividad de tickets — no hay tabla de notificaciones en la DB:

1. Cada 60 segundos el frontend ejecuta `GET /api/notifications?userId=...&role=...`
2. El backend consulta tickets recientes según el rol del usuario
3. Se generan notificaciones basadas en: tickets creados, asignados, resueltos, cerrados y comentarios
4. Las notificaciones con más de 1 hora se marcan como leídas automáticamente
5. El usuario puede marcar todas como leídas desde el panel

### Gestión de estado (Zustand Store)

El store global en `src/lib/store.ts` contiene:

| Slice | Estado | Descripción |
|---|---|---|
| **Auth** | `currentUser`, `isAuthenticated` | Usuario actual y sesión |
| **Navigation** | `currentView` | Vista activa (dashboard, kanban, tickets, etc.) |
| **Tickets** | `tickets`, `selectedTicketId` | Lista de tickets y selección |
| **Filters** | `statusFilter`, `priorityFilter`, `categoryFilter`, `searchQuery` | Filtros activos |
| **UI** | `sidebarOpen`, `ticketFormOpen`, `editingTicket` | Estado de la interfaz |
| **Settings** | `settings` | Preferencias del usuario (localStorage) |
| **Notifications** | `notifications` | Lista de notificaciones |

---

## 🌐 Endpoints / API

### Autenticación

#### `POST /api/auth` — Iniciar sesión

```json
// Request
{ "email": "admin@uniajc.edu.co", "password": "123456" }

// Response 200
{ "id": "cmoq...", "email": "admin@uniajc.edu.co", "name": "Administrador", "role": "ADMIN", "active": true, "createdAt": "...", "updatedAt": "..." }

// Response 401
{ "error": "Invalid credentials" }
```

#### `PUT /api/auth` — Registrar usuario

```json
// Request
{ "email": "nuevo@uniajc.edu.co", "name": "Nuevo Usuario", "password": "123456", "role": "USER" }

// Response 201
{ "id": "cmoq...", "email": "nuevo@uniajc.edu.co", "name": "Nuevo Usuario", "role": "USER", "active": true, ... }
```

---

### Tickets

#### `GET /api/tickets` — Listar tickets (con RBAC)

| Parámetro | Tipo | Descripción |
|---|---|---|
| `userId` | query string | ID del usuario (requerido para RBAC) |
| `role` | query string | Rol del usuario (`ADMIN`, `AGENT`, `USER`) |
| `status` | query string | Filtrar por estado |
| `priority` | query string | Filtrar por prioridad |
| `categoryId` | query string | Filtrar por categoría |
| `search` | query string | Buscar en título y descripción |

```json
// Response 200 — Array de tickets con relaciones incluidas
[
  {
    "id": "cmoq...",
    "title": "Computador no enciende",
    "description": "...",
    "status": "OPEN",
    "priority": "HIGH",
    "category": { "id": "...", "name": "Hardware", "color": "#3B82F6" },
    "createdBy": { "id": "...", "name": "María Usuario", "email": "..." },
    "assignedTo": { "id": "...", "name": "Carlos Agente", "email": "..." },
    "comments": [...]
  }
]
```

#### `POST /api/tickets` — Crear ticket

```json
// Request
{
  "title": "Nuevo problema",
  "description": "Descripción detallada del problema",
  "categoryId": "cmoq...",
  "priority": "MEDIUM",
  "createdById": "cmoq...",
  "assignedToId": "cmoq...",   // Solo ADMIN puede asignar
  "role": "ADMIN"              // Requerido para validación de permisos
}

// Response 201 — Ticket creado con relaciones
```

#### `GET /api/tickets/[id]` — Obtener ticket por ID

| Parámetro | Tipo | Descripción |
|---|---|---|
| `userId` | query string | Para verificación RBAC |
| `role` | query string | Para verificación RBAC |

#### `PUT /api/tickets/[id]` — Actualizar ticket

```json
// Request
{
  "title": "Título actualizado",          // Opcional
  "description": "Nueva descripción",     // Opcional
  "status": "IN_PROGRESS",                // Opcional
  "priority": "HIGH",                     // Opcional
  "categoryId": "cmoq...",                // Opcional
  "assignedToId": "cmoq...",              // Solo ADMIN
  "userId": "cmoq...",                    // Para RBAC
  "role": "ADMIN"                         // Para RBAC
}

// Response 403 si un no-ADMIN intenta asignar:
{ "error": "Solo el administrador puede asignar tickets" }
```

#### `DELETE /api/tickets/[id]?userId=...&role=...` — Eliminar ticket

---

### Comentarios

#### `GET /api/tickets/[id]/comments` — Listar comentarios de un ticket

#### `POST /api/tickets/[id]/comments` — Agregar comentario

```json
// Request
{ "content": "Este es mi comentario", "authorId": "cmoq..." }

// Response 201
{ "id": "cmoq...", "content": "Este es mi comentario", "author": { "name": "María" }, ... }
```

---

### Dashboard

#### `GET /api/dashboard?userId=...&role=...` — Estadísticas del dashboard

```json
// Response 200
{
  "totalTickets": 11,
  "openTickets": 3,
  "inProgressTickets": 3,
  "resolvedTickets": 2,
  "closedTickets": 3,
  "ticketsByPriority": { "LOW": 2, "MEDIUM": 4, "HIGH": 3, "CRITICAL": 2 },
  "ticketsByCategory": [
    { "category": { "name": "Hardware", "color": "#3B82F6" }, "count": 3 }
  ],
  "recentTickets": [...],
  "ticketsOverTime": [
    { "date": "2025-01-10", "count": 2 },
    { "date": "2025-01-11", "count": 5 }
  ]
}
```

---

### Notificaciones

#### `GET /api/notifications?userId=...&role=...` — Obtener notificaciones

Genera notificaciones dinámicamente basadas en la actividad de tickets del usuario.

```json
// Response 200 — Array de notificaciones (máximo 20)
[
  {
    "id": "assigned-cmoq...",
    "type": "TICKET_ASSIGNED",
    "title": "Ticket asignado",
    "message": "\"Computador no enciende\" fue asignado a Carlos Agente",
    "ticketId": "cmoq...",
    "read": false,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

**Tipos de notificación:** `TICKET_CREATED`, `TICKET_ASSIGNED`, `TICKET_UPDATED`, `TICKET_COMMENT`, `TICKET_RESOLVED`, `TICKET_CLOSED`

---

### Exportación

#### `GET /api/export?userId=...&role=...&all=true` — Exportar tickets a CSV

Retorna un archivo CSV con encabezados en español. Incluye todos los tickets visibles según el rol del usuario.

---

### Categorías

#### `GET /api/categories` — Listar categorías con conteo de tickets

#### `POST /api/categories` — Crear categoría

```json
// Request
{ "name": "Hardware", "color": "#3B82F6", "icon": "Monitor" }
```

---

### Usuarios

#### `GET /api/users` — Listar todos los usuarios (sin contraseñas)

#### `PUT /api/users` — Actualizar usuario

```json
// Request
{ "id": "cmoq...", "name": "Nuevo Nombre", "role": "AGENT", "active": true }
```

#### `GET /api/auth/[id]` — Obtener usuario por ID (sin contraseña)

---

## 🤝 Guía de Contribución

### Convenciones de código

- **TypeScript estricto** en todo el proyecto
- **ES6+ import/export** — no usar `require()`
- **Componentes funcionales** con React hooks — no clases
- **`'use client'`** en componentes que usan estado, efectos o event handlers
- **shadcn/ui** para componentes UI — no crear componentes custom si existe en `src/components/ui/`
- **Tailwind CSS** para estilos — evitar CSS-in-JS o estilos en línea (excepto valores dinámicos)
- **Zustand** para estado global — no usar React Context para estado compartido
- **API Routes** para lógica backend — no usar Server Actions

### Estructura de archivos

- Componentes: `src/components/{dominio}/{nombre}.tsx`
- API Routes: `src/app/api/{recurso}/route.ts`
- Tipos compartidos: `src/lib/types.ts`
- Utilidades: `src/lib/utils.ts`

### Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `TicketDetail.tsx` |
| Funciones utilitarias | camelCase | `getStatusLabel()` |
| Constantes | UPPER_SNAKE | `COLUMNS`, `PRIORITIES` |
| Tipos/Interfaces | PascalCase | `Ticket`, `AppView` |
| Archivos | kebab-case | `ticket-detail.tsx` |
| Rutas API | kebab-case | `/api/tickets` |

### Formato de commits

```
tipo(alcance): descripción breve

tipo: feat | fix | docs | style | refactor | test | chore
alcance: auth | tickets | kanban | dashboard | notifications | ui | api
```

Ejemplos:
```
feat(tickets): agregar filtro por categoría
fix(kanban): corregir drag en modo lectura para USER
docs(api): documentar endpoint de notificaciones
```

### Proceso de PR

1. Crear rama desde `main`: `feat/mi-feature` o `fix/mi-fix`
2. Desarrollar y probar localmente con `npm run dev`
3. Verificar lint: `npm run lint` (sin errores)
4. Abrir Pull Request con descripción del cambio
5. Esperar revisión antes de merge

---

## 🐛 Errores Comunes y Soluciones

### `Error: P1001 Can't reach database server`

**Problema:** Prisma no puede conectarse a SQLite.

**Solución:**
```bash
# Verificar que el archivo .env existe y tiene la ruta correcta
type .env          # Windows
cat .env           # macOS/Linux
# Debe mostrar: DATABASE_URL=file:./db/custom.db

# Sincronizar el esquema
npm run db:push
```

### `Module not found: Can't resolve '@prisma/client'`

**Problema:** El cliente Prisma no se ha generado.

**Solución:**
```bash
npm run db:generate
```

### Las credenciales de prueba no funcionan

**Problema:** La base de datos no tiene los datos de seed o se corrompió.

**Solución:**
```bash
# Re-seedear la base de datos
npm run db:seed
```

### `EADDRINUSE: address already in use :::3000`

**Problema:** El puerto 3000 ya está en uso.

**Solución:**
```bash
# Windows: encontrar y matar el proceso
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>

# O simplemente reiniciar el servidor
npm run dev
```

### El sidebar no se abre en desktop

**Problema:** El sidebar se cerró y no hay botón visible para reabrirlo.

**Solución:** Al cerrar el sidebar en desktop, aparece el botón hamburguesa (☰) en el header. Clic para reabrir. También puedes usar el botón de expandir (▶) que aparece sobre el sidebar colapsado.

### Las notificaciones no se ven completas

**Problema:** El panel de notificaciones se desborda.

**Solución:** El panel tiene scroll nativo. Usa la rueda del ratón dentro del panel para ver todas las notificaciones. El máximo es 20 notificaciones con altura máxima de 24rem.

### Los cambios en el esquema no se reflejan

**Problema:** Se modificó `schema.prisma` pero la DB no cambió.

**Solución:**
```bash
npm run db:push    # Aplica cambios al schema
npm run db:generate # Regenera el cliente
```

### Error de TypeScript después de cambiar tipos

**Problema:** Los tipos en `src/lib/types.ts` no coinciden con los datos de la API.

**Solución:** Asegurarse de que los tipos en `types.ts` coincidan con el esquema de Prisma y las respuestas de la API. El servidor de desarrollo debe reiniciarse automáticamente.

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework web con App Router |
| **TypeScript 5** | Lenguaje tipado |
| **Prisma ORM** | ORM para SQLite |
| **SQLite** | Base de datos embebida |
| **Zustand** | Estado global del cliente |
| **shadcn/ui** | Biblioteca de componentes UI |
| **Tailwind CSS 4** | Framework de estilos |
| **Radix UI** | Primitivos de accesibilidad |
| **@dnd-kit** | Drag & drop para Kanban |
| **Recharts** | Gráficos del dashboard |
| **React Hook Form + Zod** | Formularios y validación |
| **Lucide React** | Iconos |
| **Sonner** | Notificaciones toast |
| **bcryptjs** | Hash de contraseñas |
| **date-fns** | Formateo de fechas en español |

---

## 📄 Licencia

Proyecto interno — Institución Universitaria Antonio José Camacho (UNIAJC)
