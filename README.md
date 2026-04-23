# Chatty — Frontend

Interfaz web para Chatty: plataforma SaaS de inbox de equipo de WhatsApp con agentes de IA y gestión de tareas.

## Stack

- Vite + React 18 + TypeScript
- React Router 6
- CSS puro (sin librerías de estilos)
- lucide-react para íconos

## Requisitos

- Node 18+
- Backend de Chatty corriendo en `:3000`

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev    # Vite dev server en :5173
```

El dev server hace proxy de `/api` y `/webhook` al backend en `:3000` (configurado en `vite.config.ts`).

## Build y despliegue

```bash
npm run build     # tsc + vite build -> dist/
npm run preview   # preview del build local
```

En producción: servir `dist/` con Nginx u otro servidor estático, con proxy reverso de `/api` y `/webhook` al backend.

## Arquitectura multi-tenant

Chatty soporta múltiples empresas. Hay dos niveles de acceso:

### Super Admin (`/super/login`)

Administrador global de la plataforma. Puede:
- Ver todas las empresas registradas
- Crear nuevas empresas (con su admin inicial)
- Habilitar/deshabilitar empresas

Credenciales por defecto del seed: `super@chatty.com` / `superadmin123`

### Empresa (`/login`)

Cada empresa tiene sus propios usuarios y datos. Roles:

- **Admin**: gestiona equipo, bots, credenciales de WhatsApp/OpenAI, ve dashboard y auditoría
- **Agente**: atiende conversaciones y tareas

Credenciales demo del seed: `admin@demo.com` / `admin123`

## Páginas

- **Inbox**: conversaciones por contacto. Modo IA (con roles Recepcionista/Vendedor) o modo humano.
- **Tareas**: listado con filtros por estado y asignado. Se crean desde conversaciones.
- **Dashboard**: métricas de conversaciones, tareas y actividad.
- **Bots**: configuración de agentes de IA (prompt, ejemplos, PDFs de conocimiento).
- **Equipo**: gestión de miembros (solo admin).
- **Configuración**: credenciales de WhatsApp y OpenAI por empresa, tema claro/oscuro.
- **Super Admin**: panel de gestión de empresas (solo super admin).
