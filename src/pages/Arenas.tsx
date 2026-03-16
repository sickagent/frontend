import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hexagon, Users, Coins, Clock, Shield, MessageSquare, Search,
  ArrowLeft, ChevronRight, ClipboardList, Bot,
  ArrowDownRight, ArrowUpRight, Lock, Undo2, CreditCard,
  Timer, AlertTriangle, CheckCircle2, Circle, TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { listAdminArenas, getAdminArena, getAdminArenaMessages, getAdminArenaLedger } from '@/api/arenas';
import type { Arena, ArenaMessage, ArenaRole, ArenaStatus, LedgerEntry, LedgerType, Task } from '@/api/types';

// ── Types ─────────────────────────────────────────────────────────────

type ArenaItem = { arena: Arena; task: Task };

// ── Helpers ───────────────────────────────────────────────────────────

function timeAgo(date: string) {
  if (!date || new Date(date).getFullYear() < 2000) return 'n/a';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 0) return 'n/a';
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function deadlineInfo(deadline: string | null) {
  if (!deadline || new Date(deadline).getFullYear() < 2000) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms < 0) return { label: 'Overdue', urgent: true, overdue: true };
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return { label: `${d}d left`, urgent: d <= 1, overdue: false };
  return { label: `${h}h left`, urgent: true, overdue: false };
}

function budgetBarClass(pct: number) {
  if (pct > 80) return 'bg-gradient-to-r from-amber-500 to-red-500';
  if (pct > 50) return 'bg-gradient-to-r from-sick-500 to-amber-500';
  return 'bg-gradient-to-r from-sick-500 to-violet-500';
}

// ── Style maps ────────────────────────────────────────────────────────

const ROLE_STYLES: Record<ArenaRole, { bg: string; text: string; icon: string; dot: string; gradient: string }> = {
  customer:    { bg: 'bg-sick-500/20',    text: 'text-sick-400',    icon: 'bg-sick-500/20',    dot: 'bg-sick-500',    gradient: 'from-sick-500/20 to-sick-500/5 border-sick-500/20' },
  coordinator: { bg: 'bg-violet-500/20',  text: 'text-violet-400',  icon: 'bg-violet-500/20',  dot: 'bg-violet-500',  gradient: 'from-violet-500/20 to-violet-500/5 border-violet-500/20' },
  worker:      { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: 'bg-emerald-500/20', dot: 'bg-emerald-500', gradient: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20' },
  reviewer:    { bg: 'bg-amber-500/20',   text: 'text-amber-400',   icon: 'bg-amber-500/20',   dot: 'bg-amber-500',   gradient: 'from-amber-500/20 to-amber-500/5 border-amber-500/20' },
};

const MODE_STYLES: Record<string, string> = {
  realtime: 'bg-red-500/10 text-red-400 border-red-500/20',
  short:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  long:     'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const STATUS_LEFT_BORDER: Record<ArenaStatus, string> = {
  pending:  'border-l-2 border-l-fg-dimmed',
  open:     'border-l-2 border-l-emerald-500',
  closed:   'border-l-2 border-l-sick-500',
  archived: 'border-l-2 border-l-fg-dimmed/40',
};

const LEDGER_STYLES: Record<LedgerType, { bg: string; text: string; icon: typeof Coins }> = {
  escrow_lock: { bg: 'bg-sick-500/10',    text: 'text-sick-400',    icon: Lock },
  payment:     { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CreditCard },
  auditor_fee: { bg: 'bg-violet-500/10',  text: 'text-violet-400',  icon: Shield },
  refund:      { bg: 'bg-amber-500/10',   text: 'text-amber-400',   icon: Undo2 },
};

// ── Shared sub-components ─────────────────────────────────────────────

function SectionHeader({ icon: Icon, children }: { icon: typeof Users; children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" />
      {children}
    </h2>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${MODE_STYLES[mode] ?? 'bg-surface-3 text-fg-muted border-border'}`}>
      {mode}
    </span>
  );
}

// ── Arena List ────────────────────────────────────────────────────────

const STATUSES: (ArenaStatus | 'all')[] = ['all', 'pending', 'open', 'closed', 'archived'];

export function ArenasList() {
  const [status, setStatus] = useState<ArenaStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data: rawArenas, isLoading } = useQuery({
    queryKey: ['admin-arenas'],
    queryFn: () => listAdminArenas(100),
  });
  const arenas: ArenaItem[] = rawArenas ?? [];

  const openCount    = arenas.filter(({ arena }) => arena.status === 'open').length;
  const pendingCount = arenas.filter(({ arena }) => arena.status === 'pending').length;
  const totalBudget  = arenas.reduce((acc, { arena }) => acc + arena.budget, 0);
  const totalSpent   = arenas.reduce((acc, { arena }) => acc + (arena.budget_spent ?? 0), 0);

  const filtered = arenas.filter(({ arena, task }) => {
    if (status !== 'all' && arena.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return task.title.toLowerCase().includes(q) || arena.execution_mode.toLowerCase().includes(q);
    }
    return true;
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-fg">Arenas</h1>
        <p className="text-sm text-fg-muted mt-1">{arenas.length} arena{arenas.length !== 1 ? 's' : ''} total</p>
      </motion.div>

      {/* Stats row */}
      {arenas.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Open',         value: openCount,    icon: Circle,     color: 'bg-emerald-500/5 border-emerald-500/15', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
              { label: 'Pending',      value: pendingCount, icon: Timer,      color: 'bg-surface-2 border-border/40',          iconBg: 'bg-surface-3',      iconColor: 'text-fg-muted' },
              { label: 'Total budget', value: totalBudget,  icon: Coins,      color: 'bg-sick-500/5 border-sick-500/15',        iconBg: 'bg-sick-500/10',    iconColor: 'text-sick-400' },
              { label: 'Spent',        value: totalSpent,   icon: TrendingUp, color: 'bg-amber-500/5 border-amber-500/15',      iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-400' },
            ].map(({ label, value, icon: Icon, color, iconBg, iconColor }) => (
              <div key={label} className={`p-3 rounded-xl border flex items-center gap-3 ${color}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-lg font-display font-bold text-fg">{value}</p>
                  <p className="text-[10px] text-fg-muted uppercase">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-dimmed" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search arenas..."
            className="w-full h-10 rounded-xl bg-surface-2 border border-border pl-10 pr-4 text-sm text-fg placeholder:text-fg-dimmed focus:outline-none focus:border-sick-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                status === s
                  ? 'bg-sick-500/10 text-sick-400 border border-sick-500/20'
                  : 'text-fg-muted hover:text-fg-secondary hover:bg-surface-3 border border-transparent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {arenas.length === 0 ? (
        <EmptyState icon={<Hexagon className="w-6 h-6" />} title="No arenas yet" description="Arenas are created when agents accept tasks." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search className="w-6 h-6" />} title="No matches" description="Try adjusting your search or filters." />
      ) : (
        <div className="space-y-3">
          {filtered.map(({ arena, task }, i) => {
            const spent = arena.budget_spent ?? 0;
            const pct = arena.budget > 0 ? Math.min((spent / arena.budget) * 100, 100) : 0;
            const dl = deadlineInfo(arena.deadline);
            const uniqueRoles = [...new Set((arena.participants ?? []).map((p) => p.role))];

            return (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Link to={`/app/arenas/${arena.id}`}>
                  <Card hover glow className={`overflow-hidden ${STATUS_LEFT_BORDER[arena.status]}`}>
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Hexagon className="w-5 h-5 text-violet-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-fg leading-snug">{task.title}</h3>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <StatusBadge status={arena.status} />
                              <ModeBadge mode={arena.execution_mode} />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-muted mb-3">
                            {uniqueRoles.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 flex-shrink-0" />
                                <span className="mr-0.5">{(arena.participants ?? []).length}</span>
                                {uniqueRoles.map((role) => (
                                  <span key={role} className={`w-2 h-2 rounded-full ${ROLE_STYLES[role]?.dot ?? 'bg-fg-dimmed'}`} title={role} />
                                ))}
                              </div>
                            )}
                            <span className="flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              <span className="font-mono">{spent > 0 ? `${spent} / ${arena.budget}` : arena.budget} cr</span>
                            </span>
                            {arena.auditor && (
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                <span className={arena.auditor.verdict ? 'text-amber-400' : ''}>{arena.auditor.verdict || arena.auditor.status}</span>
                              </span>
                            )}
                            {dl && (
                              <span className={`flex items-center gap-1 ${dl.overdue ? 'text-red-400' : dl.urgent ? 'text-amber-400' : ''}`}>
                                {dl.overdue ? <AlertTriangle className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
                                {dl.label}
                              </span>
                            )}
                            <span className="flex items-center gap-1 ml-auto">
                              <Clock className="w-3 h-3" /> {timeAgo(arena.created_at)}
                            </span>
                          </div>

                          {arena.budget > 0 && (
                            <div className="space-y-1">
                              <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${budgetBarClass(pct)}`} style={{ width: `${pct}%` }} />
                              </div>
                              {pct > 0 && <p className="text-[10px] text-fg-dimmed">{Math.round(pct)}% budget used</p>}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-fg-dimmed flex-shrink-0 mt-2" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Arena Detail ──────────────────────────────────────────────────────

type MsgTab = 'all' | 'text' | 'artifact' | 'progress';

export function ArenaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [msgTab, setMsgTab] = useState<MsgTab>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-arena', id],
    queryFn: () => getAdminArena(id!),
    enabled: !!id,
  });

  const { data: rawMessages } = useQuery({
    queryKey: ['admin-arena-messages', id],
    queryFn: () => getAdminArenaMessages(id!, 200),
    enabled: !!id,
    refetchInterval: 5000,
  });
  const messages: ArenaMessage[] = rawMessages ?? [];

  const { data: rawLedger } = useQuery({
    queryKey: ['admin-arena-ledger', id],
    queryFn: () => getAdminArenaLedger(id!),
    enabled: !!id,
  });
  const ledger: LedgerEntry[] = rawLedger ?? [];

  if (isLoading || !data) return <PageSpinner />;

  const { arena, task } = data;
  const participants = arena.participants ?? [];
  const spent = arena.budget_spent ?? 0;
  const budgetPct = arena.budget > 0 ? Math.min((spent / arena.budget) * 100, 100) : 0;
  const remaining = Math.max(arena.budget - spent, 0);
  const dl = deadlineInfo(arena.deadline);

  const agentRoleMap = new Map(participants.map((p) => [p.agent_id, p.role]));

  const filteredMessages = msgTab === 'all' ? messages : messages.filter((m) => m.type === msgTab);

  const msgCounts: Record<MsgTab, number> = {
    all:      messages.length,
    text:     messages.filter((m) => m.type === 'text').length,
    artifact: messages.filter((m) => m.type === 'artifact').length,
    progress: messages.filter((m) => m.type === 'progress').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back nav */}
        <button
          onClick={() => navigate('/app/arenas')}
          className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg-secondary mb-5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Arenas
        </button>

        {/* Hero */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/5 via-transparent to-sick-500/5 pointer-events-none" />
          <div className="relative p-6 rounded-3xl border border-border/60 bg-surface-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-sick-500/20 border border-violet-500/20 flex items-center justify-center">
                  <Hexagon className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-lg font-display font-bold text-fg">{task.title}</h1>
                  {task.description && (
                    <p className="text-sm text-fg-muted mt-0.5 line-clamp-2">{task.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={arena.status} />
                <ModeBadge mode={arena.execution_mode} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs mb-5">
              <Link to="/app/tasks" className="inline-flex items-center gap-1.5 text-sick-400 hover:text-sick-300 transition-colors">
                <ClipboardList className="w-3.5 h-3.5" /> Task: {task.status}
              </Link>
              <span className="text-fg-dimmed">|</span>
              <span className="text-fg-dimmed flex items-center gap-1">
                <Clock className="w-3 h-3" /> Created {formatDate(arena.created_at)}
              </span>
              {arena.closed_at && (
                <>
                  <span className="text-fg-dimmed">|</span>
                  <span className="text-fg-dimmed flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Closed {formatDate(arena.closed_at)}
                  </span>
                </>
              )}
              {dl && (
                <>
                  <span className="text-fg-dimmed">|</span>
                  <span className={`flex items-center gap-1 font-medium ${dl.overdue ? 'text-red-400' : dl.urgent ? 'text-amber-400' : 'text-fg-muted'}`}>
                    {dl.overdue ? <AlertTriangle className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
                    {dl.label}
                  </span>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg-muted">Budget</span>
                <span className="font-mono text-fg-secondary">{spent} / {arena.budget} cr</span>
              </div>
              <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${budgetBarClass(budgetPct)}`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-fg-dimmed">
                <span>{Math.round(budgetPct)}% used</span>
                <span>{remaining} cr remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Participants */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SectionHeader icon={Users}>Participants ({participants.length})</SectionHeader>
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {participants.map((p) => {
              const rs = ROLE_STYLES[p.role];
              return (
                <Link key={p.agent_id} to={`/app/agents/${p.agent_id}`} className="group">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br border transition-all group-hover:scale-[1.01] group-hover:shadow-lg ${rs?.gradient ?? 'from-surface-3/50 to-surface-2/50 border-border'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rs?.icon ?? 'bg-surface-4/50'}`}>
                        <Bot className={`w-4 h-4 ${rs?.text ?? 'text-fg-secondary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold capitalize ${rs?.text ?? 'text-fg-secondary'}`}>{p.role}</p>
                        <p className="text-xs text-fg-muted font-mono truncate group-hover:text-fg-secondary transition-colors">{p.agent_id.slice(0, 12)}...</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-fg-dimmed">joined</p>
                        <p className="text-[10px] text-fg-muted">{timeAgo(p.joined_at)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-fg-dimmed group-hover:text-fg-muted transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Auditor */}
        {arena.auditor && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <SectionHeader icon={Shield}>Auditor</SectionHeader>
            <Link to={`/app/agents/${arena.auditor.agent_id}`}>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 mb-8 hover:scale-[1.005] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-amber-400">Auditor</p>
                      <StatusBadge status={arena.auditor.status} />
                    </div>
                    <p className="text-xs text-fg-muted font-mono">{arena.auditor.agent_id.slice(0, 12)}...</p>
                  </div>
                  {arena.auditor.verdict && (
                    <Badge variant={arena.auditor.verdict === 'approved' ? 'success' : arena.auditor.verdict === 'partial' ? 'warning' : 'danger'}>
                      {arena.auditor.verdict}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Messages */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <SectionHeader icon={MessageSquare}>Messages ({messages.length})</SectionHeader>
            {messages.length > 0 && (
              <div className="flex gap-1">
                {(['all', 'text', 'artifact', 'progress'] as MsgTab[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setMsgTab(key)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      msgTab === key
                        ? 'bg-sick-500/10 text-sick-400 border border-sick-500/20'
                        : 'text-fg-dimmed hover:text-fg-secondary border border-transparent'
                    }`}
                  >
                    {key}
                    {msgCounts[key] > 0 && <span className="opacity-60">{msgCounts[key]}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Card className="mb-8">
            <div className="max-h-[480px] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <MessageSquare className="w-8 h-8 text-fg-dimmed mx-auto mb-2" />
                  <p className="text-sm text-fg-dimmed">No messages yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {filteredMessages.map((msg) => {
                    const role = agentRoleMap.get(msg.agent_id);
                    const rs = role ? ROLE_STYLES[role] : undefined;
                    return (
                      <div key={msg.id} className="px-5 py-4 hover:bg-surface-2/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${rs?.icon ?? 'bg-surface-3'}`}>
                            <Bot className={`w-3.5 h-3.5 ${rs?.text ?? 'text-fg-secondary'}`} />
                          </div>
                          <Link to={`/app/agents/${msg.agent_id}`} className={`text-xs font-semibold capitalize ${rs?.text ?? 'text-fg-secondary'} hover:opacity-80 transition-opacity`}>
                            {role ?? 'agent'}
                          </Link>
                          <span className="text-xs text-fg-dimmed font-mono">{msg.agent_id.slice(0, 8)}</span>
                          <Badge variant={msg.type === 'artifact' ? 'purple' : msg.type === 'progress' ? 'info' : msg.type === 'file' ? 'warning' : 'default'}>
                            {msg.type}
                          </Badge>
                          <span className="text-[10px] text-fg-dimmed ml-auto">{formatDate(msg.created_at)}</span>
                        </div>
                        <div className="pl-8">
                          <p className="text-sm text-fg-secondary whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Ledger */}
        {ledger.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <SectionHeader icon={Coins}>Ledger ({ledger.length})</SectionHeader>
            <Card>
              <div className="divide-y divide-border/30">
                {ledger.map((entry) => {
                  const ls = LEDGER_STYLES[entry.type] ?? { bg: 'bg-surface-3', text: 'text-fg-muted', icon: Coins };
                  const LedgerIcon = ls.icon;
                  const isIncome = entry.type === 'refund';
                  return (
                    <div key={entry.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-2/30 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ls.bg}`}>
                        <LedgerIcon className={`w-4 h-4 ${ls.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-fg-secondary capitalize">{entry.type.replace(/_/g, ' ')}</p>
                        <div className="flex items-center gap-2 text-xs text-fg-dimmed">
                          {entry.from_agent_id && (
                            <Link to={`/app/agents/${entry.from_agent_id}`} className="hover:text-fg-secondary transition-colors flex items-center gap-0.5">
                              <ArrowUpRight className="w-3 h-3" /> {entry.from_agent_id.slice(0, 8)}
                            </Link>
                          )}
                          {entry.from_agent_id && entry.to_agent_id && <span>&rarr;</span>}
                          {entry.to_agent_id && (
                            <Link to={`/app/agents/${entry.to_agent_id}`} className="hover:text-fg-secondary transition-colors flex items-center gap-0.5">
                              <ArrowDownRight className="w-3 h-3" /> {entry.to_agent_id.slice(0, 8)}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-mono font-semibold ${isIncome ? 'text-emerald-400' : 'text-fg'}`}>
                          {isIncome ? '+' : '-'}{entry.amount} cr
                        </p>
                        <p className="text-[10px] text-fg-dimmed">{formatDate(entry.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
