import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, Filter, Search, Clock, Zap,
  Hexagon, Tag, Coins,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { AdminPage } from '@/components/layout/AdminPage';
import { listAdminTasks } from '@/api/tasks';
import type { Task, TaskStatus } from '@/api/types';

const STATUSES: (TaskStatus | 'all')[] = ['all', 'open', 'accepted', 'in_progress', 'completed', 'failed', 'cancelled'];

function timeAgo(date: string) {
  if (new Date(date).getFullYear() < 2000) return 'n/a';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 0) return 'n/a';
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function TaskCard({ task }: { task: Task }) {
  const content = (
    <Card hover className="px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-fg-secondary truncate">{task.title}</h3>
            {task.arena_id && (
              <span className="inline-flex items-center gap-1 text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded">
                <Hexagon className="w-2.5 h-2.5" /> Arena
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-fg-muted truncate mb-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {(task.required_skills ?? []).map((s) => (
              <span key={s} className="inline-flex items-center gap-1 text-[10px] font-mono text-fg-muted bg-surface-3 px-2 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5" /> {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={task.status} />
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-fg-muted">
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3" /> {task.bounty}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Zap className="w-3 h-3" /> {task.execution_mode}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(task.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  if (task.arena_id) {
    return <Link to={`/app/arenas/${task.arena_id}`}>{content}</Link>;
  }
  return content;
}

export function Tasks() {
  const [status, setStatus] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data: rawTasks, isLoading } = useQuery({
    queryKey: ['admin-tasks', status],
    queryFn: () => listAdminTasks({
      status: status === 'all' ? undefined : status,
      limit: 200,
    }),
  });
  const tasks = rawTasks ?? [];

  const filtered = search
    ? tasks.filter((t: Task) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.required_skills ?? []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
    : tasks;

  if (isLoading) return <PageSpinner />;

  return (
    <AdminPage
      title="Tasks"
      description={`${tasks.length} task${tasks.length !== 1 ? 's' : ''} total`}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-dimmed" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-10 rounded-xl bg-surface-2 border border-border pl-10 pr-4 text-sm text-fg placeholder:text-fg-dimmed focus:outline-none focus:border-sick-500/50 transition-colors"
          />
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex gap-2 rounded-2xl border border-border/50 bg-surface-1/80 p-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`h-11 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                  status === s
                    ? 'bg-surface-0 text-sick-400 border-sick-500/20 shadow-sm'
                    : 'text-fg-muted hover:text-fg-secondary hover:bg-surface-2 border-transparent'
                }`}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-6 h-6" />}
          title={search ? 'No results' : 'No tasks found'}
          description={search ? 'Try a different search term.' : 'Tasks created by your agents will appear here.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task: Task, i: number) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <TaskCard task={task} />
            </motion.div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
