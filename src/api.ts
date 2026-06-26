import { supabase } from './lib/supabase';

const BASE = "/api";

export function emitInboxUnreadChanged(total?: number) {
  window.dispatchEvent(new CustomEvent("hermes:inbox-unread-changed", { detail: { total } }));
}

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(BASE + path, { ...options, headers });
  if (res.status === 401) {
    await supabase.auth.signOut();
    window.location.href = "/login";
    throw new Error("No autorizado");
  }
  if (res.status === 403) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === "string" ? err.error : "No tenés permiso para esta acción");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type MemberRole = "admin" | "agent";

export type AuthMember = {
  id: string;
  email: string;
  name: string;
  role: MemberRole;
  enabled?: boolean;
  companyId: string;
};

export const auth = {
  me: () => api<{ member: AuthMember }>("/auth/me"),
  login: (email: string, password: string) =>
    api<{ token: string; member: AuthMember }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    api<{ token: string; member: AuthMember }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
};

export type Conversation = {
  id: string;
  contactId: string;
  contact: { id: string; waId: string; name: string | null };
  status: "ai" | "human";
  unreadCount: number;
  aiRoleId: string | null;
  aiRole: { id: string; key: string; name: string } | null;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  messages: Array<{
    id: string;
    direction: string;
    body: string;
    fromAi: boolean;
    createdAt: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    status: "pending" | "in_progress" | "done";
    assignedToId: string | null;
    assignedTo: { id: string; name: string; email: string } | null;
    createdAt: string;
  }>;
  updatedAt: string;
};

export const conversations = {
  list: () => api<Conversation[]>("/conversations"),
  get: (id: string) => api<Conversation>(`/conversations/${id}`),
  takeOver: (id: string, assignToMe = true) =>
    api<Conversation>(`/conversations/${id}/take-over`, {
      method: "POST",
      body: JSON.stringify({ assignToMe }),
    }),
  releaseToAi: (id: string) =>
    api<Conversation>(`/conversations/${id}/release-to-ai`, {
      method: "POST",
    }),
  setAiRole: (id: string, aiRoleId: string) =>
    api<Conversation>(`/conversations/${id}/ai-role`, {
      method: "PATCH",
      body: JSON.stringify({ aiRoleId }),
    }),
  setReadState: async (id: string, unread: boolean) => {
    const updated = await api<Conversation>(`/conversations/${id}/read-state`, {
      method: "PATCH",
      body: JSON.stringify({ unread }),
    });
    emitInboxUnreadChanged();
    return updated;
  },
  send: (id: string, text: string) =>
    api<{ id: string }>(`/conversations/${id}/send`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  handoff: (id: string, botId: string | null) =>
    api<{ ok: boolean }>(`/conversations/${id}/handoff`, {
      method: "POST",
      body: JSON.stringify({ botId }),
    }),
};

export type Task = {
  id: string;
  conversationId: string;
  conversation?: {
    contact: { waId: string; name: string | null };
    messages?: Array<{ id: string; direction: string; body: string; fromAi: boolean; createdAt: string }>;
  };
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "done";
  createdById: string | null;
  createdBy: { id: string; name: string } | null;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  dueAt: string | null;
  createdAt: string;
};

export type ActivityActor = { id: string; name: string; email: string; role: string };
export type ActivityLog = {
  id: string;
  actorId: string | null;
  actor: ActivityActor | null;
  entityType: string;
  action: string;
  entityId: string | null;
  conversationId: string | null;
  taskId: string | null;
  meta: unknown;
  metaRaw: string | null;
  createdAt: string;
};

export type DashboardMetrics = {
  range: { days: number; since: string };
  conversations: { total: number; ai: number; human: number; unreadTotal: number };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    done: number;
    createdInRange: number;
    doneInRange: number;
  };
  activity: {
    totalEventsInRange: number;
    byAction: Array<{ action: string; count: number }>;
    topActors: Array<{ actor: ActivityActor; events: number }>;
  };
};

export const tasks = {
  list: (params?: { status?: string; assignedToId?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api<Task[]>(`/tasks${q ? "?" + q : ""}`);
  },
  get: (id: string) => api<Task>(`/tasks/${id}`),
  create: (data: {
    conversationId: string;
    title: string;
    description?: string;
    assignedToId?: string;
    dueAt?: string;
  }) =>
    api<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<{ title: string; description: string; status: "pending" | "in_progress" | "done"; assignedToId: string | null; dueAt: string | null }>) =>
    api<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => api<void>(`/tasks/${id}`, { method: "DELETE" }),
};

export type AiRoleExample = {
  id: string;
  aiRoleId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AiRoleKnowledgeFile = {
  id: string;
  aiRoleId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type AiRole = {
  id: string;
  key: string;
  name: string;
  systemPrompt?: string;
  examples?: AiRoleExample[];
  knowledgeFiles?: AiRoleKnowledgeFile[];
};
export const aiRoles = {
  list: () => api<AiRole[]>("/ai-roles"),
  update: (id: string, data: Partial<{ name: string; systemPrompt: string }>) =>
    api<Required<AiRole>>(`/ai-roles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  addExample: (id: string, data: { title: string; content: string }) =>
    api<AiRoleExample>(`/ai-roles/${id}/examples`, { method: "POST", body: JSON.stringify(data) }),
  updateExample: (id: string, exampleId: string, data: Partial<{ title: string; content: string }>) =>
    api<AiRoleExample>(`/ai-roles/${id}/examples/${exampleId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteExample: (id: string, exampleId: string) =>
    api<void>(`/ai-roles/${id}/examples/${exampleId}`, { method: "DELETE" }),
  uploadKnowledgeFile: async (id: string, file: File) => {
    const token = await getToken();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/ai-roles/${id}/knowledge-files`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "No se pudo subir el PDF");
    }
    return res.json() as Promise<AiRoleKnowledgeFile>;
  },
  deleteKnowledgeFile: (id: string, fileId: string) =>
    api<void>(`/ai-roles/${id}/knowledge-files/${fileId}`, { method: "DELETE" }),
};

export type TeamMemberRow = { id: string; name: string; email: string; role: MemberRole; enabled: boolean };

export const team = {
  list: () => api<TeamMemberRow[]>("/team"),
  create: (data: { email: string; password: string; name: string; role?: MemberRole }) =>
    api<TeamMemberRow>("/team", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ name: string; role: MemberRole; enabled: boolean }>) =>
    api<TeamMemberRow>(`/team/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => api<void>(`/team/${id}`, { method: "DELETE" }),
};

export const metrics = {
  dashboard: (params?: { days?: number }) => {
    const q = new URLSearchParams();
    if (params?.days) q.set("days", String(params.days));
    const qs = q.toString();
    return api<DashboardMetrics>(`/metrics/dashboard${qs ? "?" + qs : ""}`);
  },
};

export const audit = {
  list: (params?: {
    limit?: number;
    offset?: number;
    from?: string;
    to?: string;
    actorId?: string;
    entityType?: string;
    conversationId?: string;
    taskId?: string;
    action?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    if (params?.actorId) q.set("actorId", params.actorId);
    if (params?.entityType) q.set("entityType", params.entityType);
    if (params?.conversationId) q.set("conversationId", params.conversationId);
    if (params?.taskId) q.set("taskId", params.taskId);
    if (params?.action) q.set("action", params.action);
    const qs = q.toString();
    return api<{ logs: ActivityLog[]; total: number }>(`/audit${qs ? "?" + qs : ""}`);
  },
};

export type AppSettings = {
  whatsappPhoneNumber: string;
  whatsappPhoneNumberId: string;
  hasWhatsAppAccessToken: boolean;
  hasWhatsAppAppSecret: boolean;
  whatsappTokenExpired: boolean;
  hasOpenAiApiKey: boolean;
  hasAnthropicApiKey: boolean;
};

export const settings = {
  get: () => api<AppSettings>("/settings"),
  update: (data: Partial<{ whatsappPhoneNumber: string; whatsappPhoneNumberId: string; whatsappAccessToken: string; whatsappAppSecret: string; openAiApiKey: string; anthropicApiKey: string }>) =>
    api<AppSettings>("/settings", { method: "PATCH", body: JSON.stringify(data) }),
  validateAiKey: (provider: 'openai' | 'claude', apiKey: string) =>
    api<{ valid: true }>("/settings/validate-ai-key", {
      method: "POST",
      body: JSON.stringify({ provider, apiKey }),
    }),
};

// --- Bots ---

export interface BotBusinessHours {
  enabled: boolean;
  days: string[];
  from: string;
  to: string;
  tz: string;
}

export interface BotHumanHandoff {
  team: string;
  activeAgents: number;
}

export interface Bot {
  id: string;
  name: string;
  aiProvider: string | null;
  aiModel: string | null;
  gender: string;
  tone: string;
  greeting: string | null;
  maxLength: 'short' | 'medium' | 'long' | null;
  businessHours: BotBusinessHours | null;
  humanHandoff: BotHumanHandoff | null;
  active: boolean;
  is_active: boolean;
  is_default: boolean;
  template_type: 'recepcionista' | 'comercial' | null;
  createdAt: string;
  whatsappPhoneNumberId: string | null;
  systemPrompt: string | null;
  examples: { id: string; userMessage: string; botResponse: string; order: number }[];
  hasWhatsappToken?: boolean;
  hasWhatsappAppSecret?: boolean;
  hasAiApiKey?: boolean;
}

export interface BotStats {
  conversations7d: number;
  conversationsDelta: number;
  iaResolution: number;
  humanHandoffRate: number;
  csatAverage: number | null;
}

export type BotTemplate = {
  key: 'recepcionista' | 'comercial';
  name: string;
  description: string;
  systemPrompt: string;
};

export interface BotForm {
  name: string;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappAppSecret?: string;
  aiProvider?: string;
  aiApiKey?: string;
  aiModel?: string;
  systemPrompt?: string;
  gender: string;
  tone: string;
  greeting?: string;
  maxLength?: 'short' | 'medium' | 'long';
  businessHours?: BotBusinessHours;
  humanHandoff?: BotHumanHandoff;
  examples?: { userMessage: string; botResponse: string; order: number }[];
  templateType?: 'recepcionista' | 'comercial' | null;
}

export const bots = {
  list: () => api<Bot[]>("/bots"),
  get: (id: string) => api<Bot>(`/bots/${id}`),
  create: (data: Partial<BotForm>) =>
    api<{ id: string }>("/bots", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<BotForm>) =>
    api<void>("/bots/" + id, { method: "PATCH", body: JSON.stringify(data) }),
  toggleActive: (id: string, isActive: boolean) =>
    api<void>("/bots/" + id, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  setDefault: (id: string) =>
    api<{ id: string; name: string; is_default: boolean }>("/bots/" + id + "/set-default", { method: "PATCH" }),
  verify: (phoneNumberId: string, accessToken: string) =>
    api<{ valid: boolean; displayPhoneNumber: string }>("/bots/verify", {
      method: "POST",
      body: JSON.stringify({ phoneNumberId, accessToken }),
    }),
  testAi: (provider: string, apiKey: string, model: string) =>
    api<{ valid: boolean; response: string }>("/bots/test-ai", {
      method: "POST",
      body: JSON.stringify({ provider, apiKey, model }),
    }),
  stats: (id: string) => api<BotStats>(`/bots/${id}/stats`),
  testChat: (
    id: string,
    systemPrompt: string,
    history: { role: 'user' | 'assistant'; content: string }[]
  ) =>
    api<{ reply: string }>(`/bots/${id}/test-chat`, {
      method: 'POST',
      body: JSON.stringify({ systemPrompt, history }),
    }),
};

export const botTemplates = {
  list: () => api<BotTemplate[]>("/bots/templates"),
};

// --- Super Admin API ---

async function superApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const res = await fetch("/api/super" + path, { ...options, headers, credentials: "include" });
  if (res.status === 401) {
    window.location.href = "/super/login";
    throw new Error("No autorizado");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type SuperAdmin = { id: string; email: string; name: string };
export type CompanySummary = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  teamMemberCount: number;
  conversationCount: number;
  whatsappPhoneNumberId: string | null;
};

export type CompanyDetail = CompanySummary & {
  aiRoleCount: number;
  taskCount: number;
  hasWhatsAppAccessToken: boolean;
  hasWhatsAppAppSecret: boolean;
  hasOpenAiApiKey: boolean;
};

export type SuperCompanyTeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  enabled: boolean;
};

export type SuperUser = {
  id: string;
  user_id: string;
  company_id: string;
  email: string | null;
  name: string | null;
  role: string;
  enabled: boolean;
  created_at: string;
  companies: { id: string; name: string; slug: string } | null;
};

export type SuperCompanyBot = {
  id: string;
  name: string;
  active: boolean;
  aiProvider: string | null;
  aiModel: string | null;
  whatsappPhoneNumberId: string | null;
};

export type SuperDashboard = {
  companiesActive: number;
  usersTotal: number;
  conversationsToday: number;
  messagesToday: number;
  recentCompanies: { id: string; name: string; slug: string; active: boolean; createdAt: string }[];
  recentActivity: { id: string; company: string; companyId: string; contact: string; createdAt: string }[];
  topPlugins: { id: string; name: string; icon: string | null; count: number }[];
};

export type Plugin = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  price_usd: number;
  active: boolean;
  createdAt: string;
  companiesCount: number;
};

export type CompanyPlugin = {
  id: string;
  pluginId: string;
  name: string;
  icon: string | null;
  price_usd: number;
  assignedAt: string;
  assignedBy: string | null;
};

export type CompanyBilling = {
  plan: "free" | "starter" | "pro" | "custom";
  internal_notes: string;
  monthlyTotal: number;
  plugins: { id: string; pluginId: string; name: string; icon: string | null; price_usd: number; assignedAt: string }[];
};

export const superAdmin = {
  login: (email: string, password: string) =>
    superApi<{ admin: SuperAdmin }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => superApi<{ admin: SuperAdmin }>("/auth/me"),
  logout: () => superApi<void>("/auth/logout", { method: "POST" }),

  dashboard: {
    get: () => superApi<SuperDashboard>("/dashboard"),
  },

  companies: {
    list: () => superApi<CompanySummary[]>("/companies"),
    get: (id: string) => superApi<CompanyDetail>(`/companies/${id}`),
    getTeam: (id: string) => superApi<SuperCompanyTeamMember[]>(`/companies/${id}/team`),
    addMember: (id: string, data: { email: string; name: string; password?: string; role: "admin" | "agent" }) =>
      superApi<SuperCompanyTeamMember>(`/companies/${id}/team`, { method: "POST", body: JSON.stringify(data) }),
    updateMember: (id: string, memberId: string, data: { role?: "admin" | "agent"; enabled?: boolean }) =>
      superApi<SuperCompanyTeamMember>(`/companies/${id}/team/${memberId}`, { method: "PATCH", body: JSON.stringify(data) }),
    removeMember: (id: string, memberId: string) =>
      superApi<void>(`/companies/${id}/team/${memberId}`, { method: "DELETE" }),
    create: (data: { name: string; slug: string; adminEmail: string; adminPassword: string; adminName: string }) =>
      superApi<{ id: string; name: string; slug: string }>("/companies", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ name: string; active: boolean }>) =>
      superApi<{ id: string; name: string; slug: string; active: boolean }>(`/companies/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    getBots: (id: string) => superApi<SuperCompanyBot[]>(`/companies/${id}/bots`),
    toggleBotActive: (companyId: string, botId: string, active: boolean) =>
      superApi<{ ok: boolean }>(`/companies/${companyId}/bots/${botId}/active`, {
        method: "PATCH", body: JSON.stringify({ active }),
      }),
    getPlugins: (id: string) => superApi<CompanyPlugin[]>(`/companies/${id}/plugins`),
    assignPlugin: (id: string, pluginId: string, assignedBy?: string) =>
      superApi<CompanyPlugin>(`/companies/${id}/plugins`, {
        method: "POST", body: JSON.stringify({ pluginId, assignedBy }),
      }),
    revokePlugin: (id: string, companyPluginId: string) =>
      superApi<void>(`/companies/${id}/plugins/${companyPluginId}`, { method: "DELETE" }),
    getBilling: (id: string) => superApi<CompanyBilling>(`/companies/${id}/billing`),
    updateBilling: (id: string, data: { plan?: string; internal_notes?: string }) =>
      superApi<{ id: string; plan: string; internal_notes: string }>(`/companies/${id}/billing`, {
        method: "PATCH", body: JSON.stringify(data),
      }),
  },

  users: {
    list: () => superApi<SuperUser[]>("/users"),
    create: (data: { email: string; name: string; password: string; companyId: string; role: "admin" | "agent" }) =>
      superApi<SuperUser>("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ role: string; enabled: boolean }>) =>
      superApi<SuperUser>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    generateRecovery: (id: string) =>
      superApi<{ link: string }>(`/users/${id}/recovery`, { method: "POST" }),
  },

  plugins: {
    list: () => superApi<Plugin[]>("/plugins"),
    create: (data: { name: string; slug: string; description?: string; icon?: string; price_usd: number; active?: boolean }) =>
      superApi<Plugin>("/plugins", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ name: string; slug: string; description: string; icon: string; price_usd: number; active: boolean }>) =>
      superApi<Plugin>(`/plugins/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => superApi<void>(`/plugins/${id}`, { method: "DELETE" }),
  },
};
