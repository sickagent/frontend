import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  User, Key, Save, Bot, Activity, Brain,
  Cpu, Clock, Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CopyButton } from '@/components/ui/CopyButton';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { useAuth } from '@/hooks/useAuth';
import { updateMe, issueApiKey } from '@/api/auth';
import { listAgents } from '@/api/agents';
import type { Agent } from '@/api/types';
import { Link } from 'react-router-dom';

type Tab = 'profile' | 'agents';

function StatMini({ icon: Icon, label, value, color }: { icon: typeof Bot; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border/40">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg font-display font-bold text-fg">{value}</p>
        <p className="text-[10px] text-fg-muted uppercase">{label}</p>
      </div>
    </div>
  );
}

/* ── Profile Tab ─────────────────────────────────────────────────────── */
function ProfileTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [apiKey, setApiKey] = useState<string | null>(null);

  const updateMut = useMutation({
    mutationFn: () => updateMe(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });

  const apiKeyMut = useMutation({
    mutationFn: issueApiKey,
    onSuccess: (data) => setApiKey(data.api_key),
  });

  return (
    <div className="space-y-6">
      {/* Avatar + info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="flex items-center gap-5 py-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sick-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-sick-500/20">
              {(user?.name || user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-fg">{user?.name || 'Unnamed'}</h2>
              <p className="text-sm text-fg-muted">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-xs text-fg-dimmed font-mono">ID: {user?.id}</p>
                {user?.id && <CopyButton text={user.id} />}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Display name */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
              <User className="w-4 h-4 text-fg-muted" /> Display name
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); updateMut.mutate(); }} className="flex gap-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" className="flex-1" />
              <Button type="submit" loading={updateMut.isPending}>
                <Save className="w-4 h-4" /> Save
              </Button>
            </form>
            {updateMut.isSuccess && <p className="text-xs text-emerald-400 mt-2">Profile updated.</p>}
          </CardContent>
        </Card>
      </motion.div>

      {/* API Key */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
              <Key className="w-4 h-4 text-fg-muted" /> API Key
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-fg-muted">
              Use this key to authenticate API requests via <code className="text-sick-400">X-API-Key</code> header.
            </p>
            {apiKey && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-0 border border-border/50">
                <code className="flex-1 text-xs text-fg break-all font-mono select-all">{apiKey}</code>
                <CopyButton text={apiKey} />
              </div>
            )}
            <Button variant="secondary" onClick={() => apiKeyMut.mutate()} loading={apiKeyMut.isPending}>
              <Key className="w-4 h-4" />
              {apiKey ? 'Rotate key' : 'Generate API key'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ── Agents Tab ──────────────────────────────────────────────────────── */

function timeSince(date: string | null) {
  if (!date || new Date(date).getFullYear() < 2000) return 'Never';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 0) return 'Never';
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function AgentsTab() {
  const { data: rawAgents } = useQuery({ queryKey: ['agents'], queryFn: listAgents });
  const agents = rawAgents ?? [];

  const onlineCount = agents.filter((a: Agent) => a.availability === 'online').length;
  const busyCount = agents.filter((a: Agent) => a.availability === 'busy').length;
  const totalBalance = agents.reduce((acc: number, a: Agent) => acc + (a.balance ?? 0), 0);
  const totalSkills = [...new Set(agents.flatMap((a: Agent) => (a.skills ?? []).map((s) => s.id)))].length;

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={<Bot className="w-6 h-6" />}
        title="No agents"
        description="Register your first agent to see statistics here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview counters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatMini icon={Bot} label="Total" value={agents.length} color="bg-sick-500/10 text-sick-400" />
          <StatMini icon={Activity} label="Online" value={onlineCount} color="bg-emerald-500/10 text-emerald-400" />
          <StatMini icon={Coins} label="Balance" value={`${totalBalance} cr`} color="bg-amber-500/10 text-amber-400" />
          <StatMini icon={Brain} label="Skills" value={totalSkills} color="bg-violet-500/10 text-violet-400" />
        </div>
      </motion.div>

      {/* Agent list */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="space-y-3">
          {agents.map((agent: Agent) => {
            const skillCount = (agent.skills ?? []).length;
            return (
              <Link key={agent.id} to={`/app/agents/${agent.id}`}>
                <Card hover className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      agent.availability === 'online'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : agent.availability === 'busy'
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-surface-3 border border-border'
                    }`}>
                      <Bot className={`w-5 h-5 ${
                        agent.availability === 'online' ? 'text-emerald-400' :
                        agent.availability === 'busy' ? 'text-amber-400' : 'text-fg-muted'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-fg-secondary truncate">{agent.name}</p>
                        <StatusBadge status={agent.availability} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-fg-muted">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> {agent.model}
                        </span>
                        <span>{agent.platform}</span>
                        {skillCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Brain className="w-3 h-3" /> {skillCount} skill{skillCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-xs">
                      <span className="font-mono text-fg-secondary flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-400" /> {agent.balance ?? 0} cr
                      </span>
                      {agent.active_instances > 0 && (
                        <Badge variant="info">{agent.active_instances} instance{agent.active_instances !== 1 ? 's' : ''}</Badge>
                      )}
                      <span className="text-fg-dimmed flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeSince(agent.last_seen_at)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Profile Page ───────────────────────────────────────────────── */
export function Profile() {
  const [tab, setTab] = useState<Tab>('profile');

  const tabs: TabItem<Tab>[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'agents', label: 'Agents', icon: <Bot className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-fg">Profile</h1>
        <p className="text-sm text-fg-muted mt-1">
          {tab === 'profile' ? 'Manage your account' : 'Your agent fleet overview'}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs items={tabs} value={tab} onChange={setTab} />
      </div>

      {/* Tab content */}
      {tab === 'profile' ? <ProfileTab /> : <AgentsTab />}
    </div>
  );
}
