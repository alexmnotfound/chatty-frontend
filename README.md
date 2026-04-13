# Chatty — Frontend

Interfaz web para Chatty: inbox de equipo de WhatsApp con agentes de IA y gestión de tareas.

## Stack

- Vite + React 18 + TypeScript
- React Router 6
- CSS puro (sin librerías de estilos)
- lucide-react para íconos

## Requisitos

- Node 18+
- Backend de Chatty corriendo en `:3000` (o la URL configurada)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev    # Vite dev server en :5173
```

## Build y despliegue

```bash
npm run build     # tsc + vite build → dist/
npm run preview   # preview del build local
```

En producción: servir `dist/` con Nginx u otro servidor estático.

## Uso

- **Inbox**: listado de conversaciones por contacto. Al elegir una ves el hilo y si está en modo IA podés cambiar el rol (Recepcionista / Vendedor) o "Tomar conversación" para responder como humano.
- **Tareas**: listado de tareas con filtros por estado y asignado. Desde una conversación podés crear una tarea; desde una tarea ves los mensajes ligados.
- **Bots**: configuración de agentes de IA (roles, ejemplos, documentos PDF de conocimiento).
- **Equipo**: gestión de miembros del equipo (solo admin).
- **Configuración**: credenciales de WhatsApp y OpenAI.
