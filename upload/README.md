# Mesa de Ayuda TI

Aplicacion web para gestionar tickets de soporte con autenticacion en Firebase, datos en Supabase y una interfaz Kanban construida con Next.js 14.

## Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Firebase Authentication
- Supabase PostgreSQL + migraciones SQL
- Docker para despliegue

## Estructura

- `src/`: codigo fuente de la aplicacion
- `public/`: assets publicos
- `supabase/`: configuracion local y migraciones de base de datos

## Instalacion

### Requisitos previos

- Node.js `18.17+` o `20.x`
- `npm` `9+`
- Git
- Un proyecto de Firebase con Authentication habilitado
- Un proyecto de Supabase con URL y anon key disponibles
- Opcional: Supabase CLI `2.x` y Docker Desktop si vas a correr la base de datos localmente

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd helpdesk
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Duplica el archivo de ejemplo y completa tus credenciales:

```powershell
Copy-Item .env.example .env.local
```

Variables requeridas en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave anon local de Supabase>
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 4. Preparar la base de datos

Si usas una instancia remota de Supabase, aplica las migraciones en ese proyecto y continua al siguiente paso.

Si vas a trabajar con Supabase local:

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:setup-local
```

Esto levantara el stack local usando `supabase/config.toml`, aplicara las migraciones dentro de `supabase/migrations/` y despues ejecutara el bootstrap local para:

- crear el bucket `ticket-attachments`
- registrar `soporte@yopmail.com` como administrador local

La integracion local entre Firebase y Supabase toma el JWT de Firebase directamente desde el navegador. Para que Supabase local lo acepte, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` debe apuntar al proyecto real de Firebase que usas en desarrollo.

### 5. Ejecutar el proyecto

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Scripts utiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run supabase:start
npm run supabase:stop
npm run supabase:status
npm run supabase:reset
npm run supabase:setup-local
```

## Notas de repositorio

- `package-lock.json` se conserva versionado porque este proyecto usa `npm` como gestor principal.
- Los artefactos regenerables y locales quedan fuera del repo: `node_modules/`, `.next/`, `quality/`, `testsprite_tests/`, `.claude/`, `.kiro/`, y el estado local de Supabase.
- La configuracion esencial del proyecto si permanece versionada: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `components.json`, `Dockerfile`, `.dockerignore` y las migraciones SQL.
