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

export type Tone = 'formal' | 'informal';
export type Gender = 'masculine' | 'feminine' | 'non_binary' | 'neutral';

export interface BotRules {
  name: string;
  model: ModelId;
  tone: Tone;
  gender: Gender;
  greeting: string;
  maxLength: MaxLength;
  businessHours: {
    enabled: boolean;
    days: string[];
    from: string;
    to: string;
    tz: string;
  };
  humanHandoff: {
    team: string;
    activeAgents: number;
  };
  instructions: string;
  variables: string[];
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
  kind: 'pdf' | 'txt' | 'paste';
  sizeBytes: number;
  indexedAt: string;
  status: 'active' | 'review' | 'processing' | 'error';
}

export interface BotStats {
  conversations7d: number;
  conversationsDelta: number;
  iaResolution: number;
  humanHandoffRate: number;
  csatAverage: number | null;
}

export interface ModelOption {
  id: ModelId;
  name: string;
  provider: 'openai' | 'claude';
  cost: '$' | '$$' | '$$$';
  note: string;                                    // "rápido", "1M ctx"
}
