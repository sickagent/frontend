// ── API Envelope ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  message: string;
  error: string;
  data: T;
}

// ── Auth ──────────────────────────────────────────────────────────────
export interface TokensResponse {
  access_token: string;
  refresh_token: string;
}

export interface Owner {
  id: string;
  email: string;
  name: string | null;
}

// ── Agent ─────────────────────────────────────────────────────────────
export interface Skill {
  id: string;
  confidence: number;
  domains: string[];
}

export interface AgentPermissions {
  accept_from?: string[];
  reject_from?: string[];
  can_create_subtasks?: boolean;
  can_escalate?: boolean;
  auto_accept_own_network?: boolean;
  skills_visibility?: 'public' | 'network_only' | 'private';
  allow_escalation_to_me?: boolean;
  require_owner_approval_above?: number;
}

export interface AgentLimits {
  max_spend_per_day?: number;
  max_spend_per_task?: number;
  min_bounty_accept?: number;
  max_concurrent_tasks?: number;
  max_concurrent_arenas?: number;
  max_subtask_depth?: number;
  escalation_multiplier?: number;
  max_tasks_created_per_hour?: number;
  max_messages_per_minute?: number;
  max_api_calls_per_minute?: number;
}

export interface AgentBehavior {
  notify_owner_on?: string[];
  heartbeat_interval?: number;
  execution_modes?: string[];
  cooldown_after_failure?: number;
}

export interface Agent {
  id: string;
  owner_id: string;
  name: string;
  model: string;
  platform: string;
  availability: 'online' | 'offline' | 'busy';
  active_instances: number;
  last_seen_at: string;
  skills: Skill[];
  permissions: AgentPermissions;
  limits: AgentLimits;
  behavior: AgentBehavior;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface AgentCreate {
  name: string;
  model: string;
  platform: string;
  skills?: Skill[];
  permissions?: AgentPermissions;
  limits?: AgentLimits;
  behavior?: AgentBehavior;
}

// ── Network ───────────────────────────────────────────────────────────
export interface NetworkMember {
  owner_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  joined_at: string | null;
  invited_by: string | null;
}

export interface Network {
  id: string;
  owner_id: string;
  name: string | null;
  type: 'personal' | 'extended';
  members: NetworkMember[];
  created_at: string;
  updated_at: string;
}

export interface NetworkMembership {
  network_id: string;
  owner_id: string;
  status: string;
  invited_by: string | null;
}

// ── Task ──────────────────────────────────────────────────────────────
export type TaskStatus = 'open' | 'accepted' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type SearchScope = 'personal' | 'extended' | 'global';
export type ExecutionMode = 'realtime' | 'short' | 'medium' | 'long';

export interface Task {
  id: string;
  creator_agent_id: string;
  owner_id: string;
  title: string;
  description: string;
  required_skills: string[];
  bounty: number;
  search_scope: SearchScope;
  execution_mode: ExecutionMode;
  status: TaskStatus;
  deadline: string | null;
  arena_id: string | null;
  parent_task_id: string | null;
  assigned_agent_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Arena ─────────────────────────────────────────────────────────────
export type ArenaStatus = 'pending' | 'open' | 'closed' | 'archived';
export type ArenaRole = 'customer' | 'coordinator' | 'worker' | 'reviewer';
export type AuditorStatus = 'pending' | 'accepted' | 'rejected';
export type AuditorVerdict = 'approved' | 'partial' | 'rejected' | 'fraud';
export type MessageType = 'text' | 'artifact' | 'progress' | 'file';
export type LedgerType = 'escrow_lock' | 'payment' | 'auditor_fee' | 'refund';

export interface ArenaParticipant {
  agent_id: string;
  role: ArenaRole;
  joined_at: string;
}

export interface ArenaAuditor {
  agent_id: string;
  status: AuditorStatus;
  verdict: AuditorVerdict;
}

export interface Arena {
  id: string;
  task_id: string;
  parent_arena_id: string | null;
  participants: ArenaParticipant[];
  auditor: ArenaAuditor | null;
  budget: number;
  budget_spent: number;
  execution_mode: ExecutionMode;
  deadline: string | null;
  status: ArenaStatus;
  created_at: string;
  closed_at: string | null;
}

export interface ArenaMessage {
  id: string;
  arena_id: string;
  agent_id: string;
  content: string;
  type: MessageType;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  from_agent_id: string | null;
  to_agent_id: string | null;
  amount: number;
  type: LedgerType;
  arena_id: string | null;
  task_id: string | null;
  created_at: string;
}

// ── Stats ─────────────────────────────────────────────────────────────
export interface PublicStats {
  agents_total: number;
  tasks_open: number;
  tasks_accepted: number;
  tasks_in_progress: number;
  tasks_completed: number;
  tasks_failed: number;
  arenas_total: number;
  skills_tag_cloud: { name: string; count: number }[];
}

// ── Team Template ─────────────────────────────────────────────────────
export interface TeamTemplateStep {
  role_key: string;
  title_template: string;
  description_template: string;
  required_skills: string[];
  depends_on_step_indices: number[];
}

export interface TeamTemplate {
  id: string;
  name: string;
  owner_id: string;
  steps: TeamTemplateStep[];
  created_at: string;
  updated_at: string;
}
