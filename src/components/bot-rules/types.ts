export type ModelId =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001'
  | 'claude-opus-4-8';
export type MaxLength = 'short' | 'medium' | 'long';
export type TabId = 'parameters' | 'instructions' | 'examples' | 'files';

export interface BotRules {
  name: string;
  model: ModelId;
  tone: number;                                    // 0..100
  greeting: string;
  maxLength: MaxLength;
  businessHours: {
    enabled: boolean;
    days: string;                                  // e.g. "Lun–Vie"
    from: string;                                  // "09:00"
    to: string;                                    // "18:00"
    tz: string;                                    // "America/Bogotá"
  };
  humanHandoff: {
    enabled: boolean;
    team: string;                                  // "ventas"
    activeAgents: number;
  };
  instructions: string;
  variables: string[];                             // ["cliente.nombre", ...]
  examples: Example[];
  files: BotFile[];
}

export interface Example {
  id: string;
  category: string;                                // "Consulta precio"
  userSays: string;
  botReplies: string;
  status: 'learned' | 'handoff' | 'pending';
}

export interface BotFile {
  id: string;
  name: string;
  kind: 'pdf' | 'xls' | 'doc';
  sizeBytes: number;
  indexedAt: string;                               // relative: "hace 2 h"
  status: 'active' | 'review';
}

export interface BotStats {
  conversations7d: number;
  conversationsDelta: number;                      // % e.g. 12 or -3
  iaResolution: number;                            // %
  humanHandoffRate: number;                        // %
  csatAverage: number;                             // 0..5
}

export interface ModelOption {
  id: ModelId;
  name: string;
  provider: 'openai' | 'claude';
  cost: '$' | '$$' | '$$$';
  note: string;                                    // "rápido", "1M ctx"
}
