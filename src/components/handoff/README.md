# Bot Rules — handoff pack

Listo para pegar en `frontend/src/`. Respeta tus convenciones (`SurfaceCard`, `Button`, `Badge`, tokens de `index.css`, español rioplatense, sin CSS-in-JS).

## Estructura

```
frontend/src/
├── pages/
│   └── BotRules.tsx                     ← nueva página
└── components/
    └── bot-rules/
        ├── BotRules.css                 ← estilos scoped con prefijo .br-
        ├── types.ts
        ├── mockData.ts
        ├── PageHeader.tsx
        ├── StatStrip.tsx
        ├── TabBar.tsx
        ├── ParametersSection.tsx
        ├── ModelPicker.tsx
        ├── ToneSlider.tsx
        ├── FieldRow.tsx
        ├── Toggle.tsx
        ├── InstructionsSection.tsx
        ├── ExamplesSection.tsx
        ├── FilesSection.tsx
        └── LivePreviewPanel.tsx
```

## Pasos de integración

### 1. Copiar la carpeta

Copiá `handoff/bot-rules/` → `frontend/src/components/bot-rules/`
Copiá `handoff/BotRules.tsx` → `frontend/src/pages/BotRules.tsx`

### 2. Agregar la ruta

En tu router (probablemente `App.tsx` o donde estén las rutas):

```tsx
import BotRules from './pages/BotRules';
// ...
<Route path="/bots/:botId/rules" element={<BotRules />} />
```

O si preferís una ruta fija para el bot seleccionado:
```tsx
<Route path="/bot-rules" element={<BotRules />} />
```

### 3. Actualizar el sidebar

En `Layout.tsx`, bajo la sección **IA**, cambiá el link existente de "Reglas de bots" para apuntar a `/bots/:botId/rules` (o `/bot-rules`). Ya usás `IconBot` de `SidebarIcons.tsx` — perfecto.

### 4. Conectar con tu API

Buscá los `TODO: connect API` en `BotRules.tsx`. Los 4 puntos son:
- `GET /bots/:botId/rules` → reemplaza el `useState(mockRules)`
- `PATCH /bots/:botId/rules` → en el handler de "Guardar"
- `POST /bots/:botId/rules/publish` → en el handler de "Publicar"
- `GET /bots/:botId/stats` → reemplaza `mockStats`

Mientras tanto corre perfecto con los mocks.

### 5. Iconos

Usa `lucide-react` (ya instalado). Si falta alguno:
```
Eye, History, Code2, Rocket, Sliders, Edit3, MessageSquare,
FileText, Upload, ChevronDown, Send, PanelRight
```

## Qué NO hace falta tocar

- `index.css` — todos los tokens ya existen.
- `theme.ts` — funciona en light y dark automáticamente.
- `components/ui/Button.tsx`, `Badge.tsx`, `SurfaceCard.tsx`, `FormGroup.tsx` — se reutilizan.

## Dark mode

Todo el CSS usa variables de tema. Probá con `document.documentElement.setAttribute('data-theme','dark')` — debería verse bien sin cambios.

## Copy (revisión final)

Usa `vos` en todas partes, ellipsis `…` (no `...`), `¿` al abrir preguntas. Los textos ya siguen esta convención.
