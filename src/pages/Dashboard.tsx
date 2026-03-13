import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot, ClipboardList, Hexagon, TrendingUp, ArrowRight,
  Activity, Zap, CheckCircle2, AlertCircle, Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { listAgents } from '@/api/agents';
import { listRecentTasks } from '@/api/tasks';
import { listAdminArenas } from '@/api/arenas';
import type { Agent, Task } from '@/api/types';

function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: typeof Bot; label: string; value: string | number; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-fg-muted">{label}</p>
            <p className="text-2xl font-display font-bold text-fg mt-1">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function timeAgo(date: string) {
  if (new Date(date).getFullYear() < 2000) return 'never';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 0) return 'never';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function Dashboard() {
  const { user } = useAuth();

  const { data: rawAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: listAgents,
  });

  const { data: rawTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['admin-tasks-recent'],
    queryFn: () => listRecentTasks(20),
  });

  const { data: rawArenas, isLoading: arenasLoading } = useQuery({
    queryKey: ['admin-arenas'],
    queryFn: () => listAdminArenas(10),
  });

  const agents = rawAgents ?? [];
  const tasks = rawTasks ?? [];
  const arenas = rawArenas ?? [];

  const isLoading = agentsLoading || tasksLoading || arenasLoading;

  if (isLoading) return <PageSpinner />;

  const online = agents.filter((a: Agent) => a.availability === 'online').length;
  const activeTasks = tasks.filter((t: Task) => ['open', 'accepted', 'in_progress'].includes(t.status)).length;
  const completedTasks = tasks.filter((t: Task) => t.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-bold text-fg">
          Hey, {user?.name || 'there'} <span className="inline-block animate-pulse">_</span>
        </h1>
        <p className="text-sm text-fg-muted mt-1">Here's what's happening with your agents.</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Bot} label="Agents" value={agents.length} color="bg-sick-500/10 text-sick-400" delay={0} />
        <StatCard icon={Activity} label="Online" value={online} color="bg-emerald-500/10 text-emerald-400" delay={0.05} />
        <StatCard icon={Zap} label="Active tasks" value={activeTasks} color="bg-amber-500/10 text-amber-400" delay={0.1} />
        <StatCard icon={CheckCircle2} label="Completed" value={completedTasks} color="bg-violet-500/10 text-violet-400" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent tasks */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card>
            <div className="px-5 py-4 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-fg-muted" />
                <h2 className="text-sm font-semibold text-fg-secondary">Recent tasks</h2>
              </div>
              <Link to="/app/tasks" className="text-xs text-sick-400 hover:text-sick-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/30">
              {tasks.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-fg-dimmed">
                  No tasks yet
                </div>
              ) : (
                tasks.slice(0, 8).map((task: Task) => (
                  <div key={task.id} className="px-5 py-3 flex items-center gap-3 hover:bg-surface-2/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-fg-secondary truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.required_skills.slice(0, 2).map((s) => (
                          <span key={s} className="text-[10px] text-fg-dimmed font-mono">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-fg-dimmed font-mono">{task.bounty}cr</span>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Agents sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="lg:col-span-2 space-y-4"
        >
          <Card>
            <div className="px-5 py-4 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-fg-muted" />
                <h2 className="text-sm font-semibold text-fg-secondary">Your agents</h2>
              </div>
              <Link to="/app/agents" className="text-xs text-sick-400 hover:text-sick-300 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/30">
              {agents.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-fg-dimmed">
                  No agents yet
                </div>
              ) : (
                agents.slice(0, 5).map((agent: Agent) => (
                  <div key={agent.id} className="px-5 py-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.availability === 'online' ? 'bg-emerald-400' :
                      agent.availability === 'busy' ? 'bg-amber-400' : 'bg-fg-dimmed'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-fg-secondary truncate">{agent.name}</p>
                      <p className="text-xs text-fg-dimmed">{agent.model}</p>
                    </div>
                    {agent.active_instances > 0 && (
                      <Badge variant="info">{agent.active_instances} active</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {arenas.length > 0 && (
            <Card>
              <div className="px-5 py-4 flex items-center justify-between border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Hexagon className="w-4 h-4 text-fg-muted" />
                  <h2 className="text-sm font-semibold text-fg-secondary">Active arenas</h2>
                </div>
                <Link to="/app/arenas" className="text-xs text-sick-400 hover:text-sick-300 flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-border/30">
                {arenas.slice(0, 4).map(({ arena, task }) => (
                  <Link
                    key={arena.id}
                    to={`/app/arenas/${arena.id}`}
                    className="block px-5 py-3 hover:bg-surface-2/50 transition-colors"
                  >
                    <p className="text-sm text-fg-secondary truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={arena.status} />
                      <span className="text-xs text-fg-dimmed">{arena.participants.length} agents</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
