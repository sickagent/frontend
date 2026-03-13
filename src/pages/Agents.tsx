import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot, Plus, Trash2, Cpu,
  ChevronDown, ChevronUp, ExternalLink, Activity, Coins, Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { CopyButton } from '@/components/ui/CopyButton';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { listAgents, createAgent, deleteAgent } from '@/api/agents';
import type { Agent, AgentCreate } from '@/api/types';

type Tab = 'all' | 'online' | 'offline';

export function Agents() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<AgentCreate>({
    name: '', model: '', platform: '',
  });

  const { data: rawAgents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: listAgents,
  });
  const agents = rawAgents ?? [];

  const onlineCount = agents.filter((a: Agent) => a.availability === 'online').length;
  const offlineCount = agents.filter((a: Agent) => a.availability === 'offline').length;
  const busyCount = agents.filter((a: Agent) => a.availability === 'busy').length;

  const filtered = tab === 'all'
    ? agents
    : tab === 'online'
    ? agents.filter((a: Agent) => a.availability === 'online' || a.availability === 'busy')
    : agents.filter((a: Agent) => a.availability === 'offline');

  const tabs: TabItem<Tab>[] = [
    { id: 'all', label: 'All', count: agents.length, icon: <Bot className="w-4 h-4" /> },
    { id: 'online', label: 'Online', count: onlineCount + busyCount, icon: <Activity className="w-4 h-4" /> },
    { id: 'offline', label: 'Offline', count: offlineCount, icon: <Bot className="w-4 h-4" /> },
  ];

  const createMut = useMutation({
    mutationFn: (data: AgentCreate) => createAgent(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setCreateOpen(false);
      setForm({ name: '', model: '', platform: '' });
      navigate(`/app/agents/${result.agent.id}`, { state: { secret: result.secret } });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });


  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-fg">Agents</h1>
          <p className="text-sm text-fg-muted mt-1">{agents.length} agent{agents.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New agent
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs items={tabs} value={tab} onChange={(id) => { setTab(id); setExpandedId(null); }} />
      </div>

      {agents.length === 0 ? (
        <EmptyState
          icon={<Bot className="w-6 h-6" />}
          title="No agents yet"
          description="Create your first agent to start orchestrating tasks."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Create agent
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bot className="w-6 h-6" />}
          title={`No ${tab} agents`}
          description={tab === 'online' ? 'No agents are currently online or busy.' : 'All agents are currently online.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((agent: Agent, i: number) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover>
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === agent.id ? null : agent.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    agent.availability === 'online'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : agent.availability === 'busy'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-surface-4 text-fg-muted border border-surface-4'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-fg">{agent.name}</h3>
                      <StatusBadge status={agent.availability} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-fg-muted">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> {agent.model}
                      </span>
                      <span>{agent.platform}</span>
                      {agent.active_instances > 0 && (
                        <Badge variant="info">{agent.active_instances} instances</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-fg-secondary">
                      <Coins className="w-3 h-3 text-amber-400" /> {agent.balance ?? 0}
                    </span>
                    {(agent.skills ?? []).length > 0 && (
                      <span className="hidden sm:flex items-center gap-1 text-xs text-fg-muted">
                        <Brain className="w-3 h-3" /> {(agent.skills ?? []).length}
                      </span>
                    )}
                    {expandedId === agent.id ? (
                      <ChevronUp className="w-4 h-4 text-fg-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-fg-muted" />
                    )}
                  </div>
                </div>

                {expandedId === agent.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/40 overflow-hidden"
                  >
                    <div className="px-5 py-4 space-y-4">
                      {/* Skills */}
                      {(agent.skills ?? []).length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {(agent.skills ?? []).map((s) => (
                              <div key={s.id} className="px-3 py-1.5 rounded-lg bg-surface-3 border border-border/50">
                                <span className="text-sm text-fg-secondary">{s.id}</span>
                                <span className="text-xs text-fg-muted ml-2">{Math.round(s.confidence * 100)}%</span>
                                {s.domains.length > 0 && (
                                  <span className="text-xs text-fg-dimmed ml-1">({s.domains.join(', ')})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Limits */}
                      <div>
                        <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-2">Limits</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {agent.limits.max_spend_per_day != null && (
                            <div className="p-2 rounded-lg bg-surface-3"><span className="text-fg-muted">Spend/day:</span> <span className="text-fg-secondary">{agent.limits.max_spend_per_day}</span></div>
                          )}
                          {agent.limits.max_concurrent_tasks != null && (
                            <div className="p-2 rounded-lg bg-surface-3"><span className="text-fg-muted">Concurrent:</span> <span className="text-fg-secondary">{agent.limits.max_concurrent_tasks}</span></div>
                          )}
                          {agent.limits.max_subtask_depth != null && (
                            <div className="p-2 rounded-lg bg-surface-3"><span className="text-fg-muted">Depth:</span> <span className="text-fg-secondary">{agent.limits.max_subtask_depth}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex items-center gap-2 text-xs text-fg-dimmed">
                        <span>ID: <code className="text-fg-muted">{agent.id.slice(0, 12)}...</code></span>
                        <CopyButton text={agent.id} size="sm" />
                        <span className="mx-1">|</span>
                        <span>Created {new Date(agent.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                        <Link to={`/app/agents/${agent.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="secondary" size="sm">
                            <ExternalLink className="w-3.5 h-3.5" /> Configure
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete agent "${agent.name}"?`)) deleteMut.mutate(agent.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create agent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate(form);
          }}
          className="space-y-4"
        >
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. CodeReviewer-Pro"
            required
            autoFocus
          />

          <Input
            label="Platform"
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            placeholder="e.g. cursor, claude_code, vscode, custom"
            required
          />

          <Input
            label="Model"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="e.g. claude-sonnet-4, gpt-4o"
            required
          />

          {createMut.isError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {(createMut.error as Error).message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={createMut.isPending} className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
