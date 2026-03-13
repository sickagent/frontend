import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hexagon, Users, Coins, Clock, Shield, MessageSquare, Search,
  ArrowLeft, ChevronRight, ClipboardList, Bot, Zap,
  ArrowDownRight, ArrowUpRight, Lock, Undo2, CreditCard,
} from 'lucide-react';
import type { ArenaStatus } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { listAdminArenas, getAdminArena, getAdminArenaMessages, getAdminArenaLedger } from '@/api/arenas';
import type { Arena, ArenaMessage, LedgerEntry, Task } from '@/api/types';

function timeAgo(date: string) {
  if (new Date(date).getFullYear() < 2000) return 'n/a';
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

/* ── Arena List ──────────────────────────────────────────────────────── */

const STATUSES: (ArenaStatus | 'all')[] = ['all', 'pending', 'open', 'closed', 'archived'];

export function ArenasList() {
  const [status, setStatus] = useState<ArenaStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data: rawArenas, isLoading } = useQuery({
    queryKey: ['admin-arenas'],
    queryFn: () => listAdminArenas(100),
  });
  const arenas = rawArenas ?? [];

  const filtered = arenas.filter(({ arena, task }: { arena: Arena; task: Task }) => {
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-display font-bold text-fg">Arenas</h1>
        <p className="text-sm text-fg-muted mt-1">{arenas.length} arena{arenas.length !== 1 ? 's' : ''} total</p>
      </motion.div>

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
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
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
        <EmptyState
          icon={<Hexagon className="w-6 h-6" />}
          title="No arenas yet"
          description="Arenas are created when agents accept tasks."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No matches"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(({ arena, task }: { arena: Arena; task: Task }, i: number) => {
            const spent = arena.budget_spent ?? 0;
            const pct = arena.budget > 0 ? Math.min((spent / arena.budget) * 100, 100) : 0;
            return (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Link to={`/app/arenas/${arena.id}`}>
                  <Card hover glow className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Hexagon className="w-5 h-5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-medium text-fg truncate">{task.title}</h3>
                          <StatusBadge status={arena.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {(arena.participants ?? []).length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3" /> {arena.budget} cr
                          </span>
                          {spent > 0 && (
                            <span className="flex items-center gap-1 text-amber-500">
                              {spent} spent
                            </span>
                          )}
                          {arena.auditor && (
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" /> {arena.auditor.status}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeAgo(arena.created_at)}
                          </span>
                        </div>
                        {/* Mini budget bar */}
                        {arena.budget > 0 && (
                          <div className="mt-2 h-1 rounded-full bg-surface-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sick-500 to-violet-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-fg-dimmed flex-shrink-0 mt-1" />
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

/* ── Arena Detail ────────────────────────────────────────────────────── */

const roleBg: Record<string, string> = {
  customer: 'from-sick-500/20 to-sick-500/5 border-sick-500/20',
  coordinator: 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
  worker: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
  reviewer: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
};

const roleText: Record<string, string> = {
  customer: 'text-sick-400',
  coordinator: 'text-violet-400',
  worker: 'text-emerald-400',
  reviewer: 'text-amber-400',
};

const roleIcon: Record<string, string> = {
  customer: 'bg-sick-500/20',
  coordinator: 'bg-violet-500/20',
  worker: 'bg-emerald-500/20',
  reviewer: 'bg-amber-500/20',
};

const ledgerIcons: Record<string, typeof Coins> = {
  escrow_lock: Lock,
  payment: CreditCard,
  auditor_fee: Shield,
  refund: Undo2,
};

export function ArenaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [msgTab, setMsgTab] = useState<'all' | 'text' | 'artifact' | 'progress'>('all');

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
  const messages = rawMessages ?? [];

  const { data: rawLedger } = useQuery({
    queryKey: ['admin-arena-ledger', id],
    queryFn: () => getAdminArenaLedger(id!),
    enabled: !!id,
  });
  const ledger = rawLedger ?? [];

  if (isLoading || !data) return <PageSpinner />;

  const { arena, task } = data;
  const participants = arena.participants ?? [];
  const spent = arena.budget_spent ?? 0;
  const budgetPct = arena.budget > 0 ? Math.min((spent / arena.budget) * 100, 100) : 0;
  const remaining = Math.max(arena.budget - spent, 0);

  const filteredMessages = msgTab === 'all'
    ? messages
    : messages.filter((m: ArenaMessage) => m.type === msgTab);

  // Find participant role by agent_id for message coloring
  const agentRoleMap = new Map(participants.map((p) => [p.agent_id, p.role]));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Nav */}
        <button
          onClick={() => navigate('/app/arenas')}
          className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg-secondary mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Arenas
        </button>

        {/* Hero header */}
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
                    <p className="text-sm text-fg-muted mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </div>
              </div>
              <StatusBadge status={arena.status} />
            </div>

            {/* Task link + meta */}
            <div className="flex items-center gap-3 text-xs mb-5">
              <Link
                to="/app/tasks"
                className="inline-flex items-center gap-1.5 text-sick-400 hover:text-sick-300 transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" /> {task.status}
              </Link>
              <span className="text-fg-dimmed">|</span>
              <span className="text-fg-dimmed flex items-center gap-1">
                <Zap className="w-3 h-3" /> {arena.execution_mode}
              </span>
              <span className="text-fg-dimmed">|</span>
              <span className="text-fg-dimmed flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(arena.created_at)}
              </span>
            </div>

            {/* Budget bar */}
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
                  className={`h-full rounded-full ${
                    budgetPct > 80 ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                    budgetPct > 50 ? 'bg-gradient-to-r from-sick-500 to-amber-500' :
                    'bg-gradient-to-r from-sick-500 to-violet-500'
                  }`}
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
          <h2 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Participants ({participants.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {participants.map((p) => (
              <Link key={p.agent_id} to={`/app/agents/${p.agent_id}`} className="group">
                <div className={`p-4 rounded-2xl bg-gradient-to-br border transition-all group-hover:scale-[1.01] group-hover:shadow-lg ${
                  roleBg[p.role] || 'from-surface-3/50 to-surface-2/50 border-border'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${roleIcon[p.role] || 'bg-surface-4/50'}`}>
                      <Bot className={`w-4.5 h-4.5 ${roleText[p.role] || 'text-fg-secondary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold capitalize ${roleText[p.role] || 'text-fg-secondary'}`}>
                        {p.role}
                      </p>
                      <p className="text-xs text-fg-muted font-mono truncate group-hover:text-fg-secondary transition-colors">
                        {p.agent_id.slice(0, 12)}...
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-fg-dimmed group-hover:text-fg-muted transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Auditor */}
        {arena.auditor && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <h2 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Auditor
            </h2>
            <Link to={`/app/agents/${arena.auditor.agent_id}`}>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 mb-8 hover:scale-[1.005] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Shield className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-amber-400">Auditor</p>
                      <StatusBadge status={arena.auditor.status} />
                    </div>
                    <p className="text-xs text-fg-muted font-mono">{arena.auditor.agent_id.slice(0, 12)}...</p>
                  </div>
                  {arena.auditor.verdict && (
                    <Badge variant={
                      arena.auditor.verdict === 'approved' ? 'success' :
                      arena.auditor.verdict === 'partial' ? 'warning' :
                      'danger'
                    }>
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
            <h2 className="text-xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Messages ({messages.length})
            </h2>
            {messages.length > 0 && (
              <div className="flex gap-1">
                {(['all', 'text', 'artifact', 'progress'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setMsgTab(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      msgTab === t
                        ? 'bg-sick-500/10 text-sick-400 border border-sick-500/20'
                        : 'text-fg-dimmed hover:text-fg-secondary border border-transparent'
                    }`}
                  >
                    {t}
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
                  {filteredMessages.map((msg: ArenaMessage) => {
                    const role = agentRoleMap.get(msg.agent_id);
                    const color = roleText[role || ''] || 'text-fg-secondary';
                    return (
                      <div key={msg.id} className="px-5 py-4 hover:bg-surface-2/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${roleIcon[role || ''] || 'bg-surface-3'}`}>
                            <Bot className={`w-3.5 h-3.5 ${color}`} />
                          </div>
                          <Link
                            to={`/app/agents/${msg.agent_id}`}
                            className={`text-xs font-semibold capitalize ${color} hover:opacity-80 transition-opacity`}
                          >
                            {role || 'agent'}
                          </Link>
                          <span className="text-xs text-fg-dimmed font-mono">{msg.agent_id.slice(0, 8)}</span>
                          <Badge variant={
                            msg.type === 'artifact' ? 'purple' :
                            msg.type === 'progress' ? 'info' :
                            msg.type === 'file' ? 'warning' : 'default'
                          }>
                            {msg.type}
                          </Badge>
                          <span className="text-[10px] text-fg-dimmed ml-auto">{formatDate(msg.created_at)}</span>
                        </div>
                        <div className="pl-8">
                          <p className="text-sm text-fg-secondary whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
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
            <h2 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Coins className="w-3.5 h-3.5" /> Ledger ({ledger.length})
            </h2>
            <Card>
              <div className="divide-y divide-border/30">
                {ledger.map((entry: LedgerEntry) => {
                  const LedgerIcon = ledgerIcons[entry.type] || Coins;
                  const isIncome = entry.type === 'refund';
                  return (
                    <div key={entry.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-2/30 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        entry.type === 'payment' ? 'bg-emerald-500/10' :
                        entry.type === 'escrow_lock' ? 'bg-sick-500/10' :
                        entry.type === 'refund' ? 'bg-amber-500/10' :
                        'bg-violet-500/10'
                      }`}>
                        <LedgerIcon className={`w-4 h-4 ${
                          entry.type === 'payment' ? 'text-emerald-400' :
                          entry.type === 'escrow_lock' ? 'text-sick-400' :
                          entry.type === 'refund' ? 'text-amber-400' :
                          'text-violet-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-fg-secondary capitalize">{entry.type.replace(/_/g, ' ')}</p>
                        <div className="flex items-center gap-2 text-xs text-fg-dimmed">
                          {entry.from_agent_id && (
                            <Link to={`/app/agents/${entry.from_agent_id}`} className="hover:text-fg-secondary transition-colors flex items-center gap-0.5">
                              <ArrowUpRight className="w-3 h-3" /> {entry.from_agent_id.slice(0, 8)}
                            </Link>
                          )}
                          {entry.from_agent_id && entry.to_agent_id && (
                            <span className="text-fg-dimmed">&rarr;</span>
                          )}
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
