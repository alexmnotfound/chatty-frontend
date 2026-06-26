import type { BotRules, BotStats, ModelOption, Example, BotFile } from './types';

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'gpt-4o-mini',              name: 'GPT-4o mini',  provider: 'openai', cost: '$',   note: 'rápido y económico' },
  { id: 'gpt-4o',                   name: 'GPT-4o',       provider: 'openai', cost: '$$',  note: 'equilibrado' },
  { id: 'gpt-4.1',                  name: 'GPT-4.1',      provider: 'openai', cost: '$$',  note: 'última generación' },
  { id: 'gpt-4.1-mini',             name: 'GPT-4.1 mini', provider: 'openai', cost: '$',   note: 'rápido' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku', provider: 'claude', cost: '$',  note: 'muy rápido' },
  { id: 'claude-sonnet-4-6',        name: 'Claude Sonnet', provider: 'claude', cost: '$$', note: 'equilibrado' },
  { id: 'claude-opus-4-8',          name: 'Claude Opus',  provider: 'claude', cost: '$$$', note: 'máxima calidad' },
];

export const mockRules: BotRules = {
  name: 'Vendedor',
  model: 'gpt-4o-mini',
  tone: 'informal',
  gender: 'neutral',
  greeting: '¡Hola! Soy Vendedor 👋 ¿Qué estás buscando hoy?',
  maxLength: 'short',
  businessHours: { enabled: true, days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], from: '09:00', to: '18:00', tz: 'America/Bogotá' },
  humanHandoff:  { team: 'ventas', activeAgents: 3 },
  instructions: `Sos Vendedor, el asistente comercial de {{empresa}}. Hablás con clientes potenciales por WhatsApp.

Objetivo: entender la necesidad, recomendar 1–2 productos y, si hay intención de compra, derivar al equipo humano.

Reglas:
- Tono cálido y profesional, rioplatense.
- No inventes precios ni stock. Si dudás, revisá {{stock_disponible}} o derivá.
- Si el cliente pide hablar con alguien, derivá inmediatamente.
- No hables de la competencia.`,
  variables: ['cliente.nombre', 'empresa', 'horario_actual', 'stock_disponible'],
  examples: mockExamples(),
  files: mockFiles(),
};

export const mockStats: BotStats = {
  conversations7d: 1284,
  conversationsDelta: 12,
  iaResolution: 82,
  humanHandoffRate: 18,
  csatAverage: 4.6,
};

function mockExamples(): Example[] {
  return [
    { id: 'e1', category: 'Consulta precio', userSays: '¿Cuánto sale la hamburguesa doble?', botReplies: 'La doble está $4.800. ¿Te la agrego con papas?', status: 'learned' },
    { id: 'e2', category: 'Reclamo',         userSays: 'Me llegó frío el pedido',             botReplies: 'Qué mal, perdón. Te paso con una persona del equipo ahora.', status: 'handoff' },
    { id: 'e3', category: 'Horario',         userSays: '¿Hasta qué hora atienden?',           botReplies: 'Abrimos de lunes a viernes de 9 a 18 h.', status: 'learned' },
  ];
}

function mockFiles(): BotFile[] {
  return [
    { id: 'f1', name: 'catalogo-2026-q1.pdf',          kind: 'pdf', sizeBytes: 1_200_000, indexedAt: 'hace 2 h',     status: 'active' },
    { id: 'f2', name: 'precios-lista-mayoristas.xlsx', kind: 'xls', sizeBytes:   340_000, indexedAt: 'ayer',         status: 'active' },
    { id: 'f3', name: 'politicas-devoluciones.docx',   kind: 'doc', sizeBytes:    88_000, indexedAt: 'hace 3 días',  status: 'review' },
  ];
}
