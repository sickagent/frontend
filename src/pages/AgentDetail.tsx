import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Bot, Cpu, Shield, Zap, Settings2, Brain,
  Plus, X, RefreshCw, Key, Trash2, Clock, Activity,
  Eye, Users, Layers, MessageSquare, AlertTriangle, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { CopyButton } from '@/components/ui/CopyButton';
import { Toggle } from '@/components/ui/Toggle';
import { NumberInput } from '@/components/ui/NumberInput';
import { MultiToggle } from '@/components/ui/MultiToggle';
import { IconButton } from '@/components/ui/IconButton';
import { getAgent, updateAgent, deleteAgent, regenerateSecret, issueAgentToken } from '@/api/agents';
import type { Agent, AgentCreate, Skill, AgentPermissions, AgentLimits, AgentBehavior } from '@/api/types';

const SKILL_PRESETS = [
  'code_review', 'python', 'golang', 'javascript', 'rust', 'typescript',
  'security_audit', 'web_research', 'data_analysis', 'documentation',
  'ui_ux', 'system_design', 'architecture', 'testing', 'refactoring',
  'ci_cd', 'docker', 'kubernetes', 'ml', 'data_engineering',
];
const VISIBILITY_OPTIONS = ['public', 'network_only', 'private'] as const;
const ACCEPT_FROM_OPTIONS = ['own_network', 'friends', 'global'] as const;
const EXECUTION_MODES = ['realtime', 'short', 'medium', 'long'] as const;
const NOTIFY_OPTIONS = ['error', 'budget_80pct', 'dispute', 'escalation'] as const;

export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: agent, isLoading, isError } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => getAgent(id!),
    enabled: !!id,
    retry: false,
  });

  // Local form state
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [platform, setPlatform] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [perms, setPerms] = useState<AgentPermissions>({});
  const [limits, setLimits] = useState<AgentLimits>({});
  const [behavior, setBehavior] = useState<AgentBehavior>({});
  const [newSkillId, setNewSkillId] = useState('');
  const [secretBanner, setSecretBanner] = useState<string | null>(
    (location.state as { secret?: string })?.secret ?? null,
  );
  const [tokenBanner, setTokenBanner] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!agent) return;
    setName(agent.name);
    setModel(agent.model);
    setPlatform(agent.platform);
    setSkills(agent.skills ?? []);
    setPerms(agent.permissions ?? {});
    setLimits(agent.limits ?? {});
    setBehavior(agent.behavior ?? {});
    setDirty(false);
  }, [agent]);

  const mark = () => setDirty(true);

  const saveMut = useMutation({
    mutationFn: () => {
      const data: AgentCreate = { name, model, platform, skills, permissions: perms, limits, behavior };
      return updateAgent(id!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setDirty(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteAgent(id!),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['agents'] }); navigate('/app/agents'); },
  });

  const regenMut = useMutation({
    mutationFn: () => regenerateSecret(id!),
    onSuccess: (r) => setSecretBanner(r.secret),
  });

  const tokenMut = useMutation({
    mutationFn: () => issueAgentToken(id!),
    onSuccess: (r) => setTokenBanner(r.access_token),
  });

  if (isLoading) return <PageSpinner />;

  if (isError || !agent) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg-secondary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <Card>
            <CardContent className="py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-border flex items-center justify-center mx-auto mb-4">
                <Bot className="w-7 h-7 text-fg-muted" />
              </div>
              <h2 className="text-lg font-display font-bold text-fg-secondary mb-1">Agent</h2>
              <p className="text-xs text-fg-dimmed font-mono mb-3">{id}</p>
              <p className="text-sm text-fg-muted max-w-sm mx-auto">
                This agent belongs to another owner. Detailed information is not available.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const addSkill = () => {
    if (!newSkillId.trim()) return;
    if (skills.find((s) => s.id === newSkillId.trim())) return;
    setSkills([...skills, { id: newSkillId.trim(), confidence: 0.8, domains: [] }]);
    setNewSkillId('');
    mark();
  };

  const removeSkill = (sid: string) => {
    setSkills(skills.filter((s) => s.id !== sid));
    mark();
  };

  const updateSkill = (sid: string, field: keyof Skill, value: unknown) => {
    setSkills(skills.map((s) => s.id === sid ? { ...s, [field]: value } : s));
    mark();
  };

  const timeSince = (date: string | null) => {
    if (!date || new Date(date).getFullYear() < 2000) return 'Never';
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 0) return 'Never';
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back + header */}
        <button
          onClick={() => navigate('/app/agents')}
          className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg-secondary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to agents
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center ${
              agent.availability === 'online'
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : agent.availability === 'busy'
                ? 'bg-amber-500/10 border border-amber-500/20'
                : 'bg-surface-3 border border-border'
            }`}>
              <Bot className={`w-6 h-6 ${
                agent.availability === 'online' ? 'text-emerald-400' :
                agent.availability === 'busy' ? 'text-amber-400' : 'text-fg-muted'
              }`} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-display font-bold text-fg truncate">{agent.name}</h1>
              <div className="flex items-center gap-2 mt-1 min-w-0">
                <StatusBadge status={agent.availability} />
                <span className="text-xs text-fg-muted font-mono truncate max-w-[120px] sm:max-w-none">{agent.id}</span>
              </div>
            </div>
          </div>
          {dirty && (
            <Button onClick={() => saveMut.mutate()} loading={saveMut.isPending} className="flex-shrink-0">
              <Save className="w-4 h-4" /> Save changes
            </Button>
          )}
        </div>

        {saveMut.isError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {(saveMut.error as Error).message}
          </div>
        )}

        {/* Agent info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 text-center">
            <Activity className="w-4 h-4 text-fg-muted mx-auto mb-1" />
            <p className="text-lg font-display font-bold text-fg">{agent.active_instances}</p>
            <p className="text-[10px] text-fg-muted uppercase">Active instances</p>
          </Card>
          <Card className="p-4 text-center">
            <Clock className="w-4 h-4 text-fg-muted mx-auto mb-1" />
            <p className="text-sm font-medium text-fg-secondary">{timeSince(agent.last_seen_at)}</p>
            <p className="text-[10px] text-fg-muted uppercase">Last seen</p>
          </Card>
          <Card className="p-4 text-center">
            <Brain className="w-4 h-4 text-fg-muted mx-auto mb-1" />
            <p className="text-lg font-display font-bold text-fg">{skills.length}</p>
            <p className="text-[10px] text-fg-muted uppercase">Skills</p>
          </Card>
          <Card className="p-4 text-center">
            <Layers className="w-4 h-4 text-fg-muted mx-auto mb-1" />
            <p className="text-sm font-medium text-fg-secondary">{new Date(agent.created_at).toLocaleDateString()}</p>
            <p className="text-[10px] text-fg-muted uppercase">Created</p>
          </Card>
        </div>

        <div className="space-y-6">
          {/* -- Basic info ---- */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
                <Bot className="w-4 h-4 text-fg-muted" /> Basic configuration
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Name" value={name} onChange={(e) => { setName(e.target.value); mark(); }} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Platform"
                  value={platform}
                  onChange={(e) => { setPlatform(e.target.value); mark(); }}
                  placeholder="e.g. cursor, claude_code, vscode"
                />
                <Input
                  label="Model"
                  value={model}
                  onChange={(e) => { setModel(e.target.value); mark(); }}
                  placeholder="e.g. claude-sonnet-4, gpt-4o"
                />
              </div>
              <Link
                to="/docs/agents"
                className="inline-flex items-center gap-1.5 text-xs text-fg-dimmed hover:text-sick-400 transition-colors"
              >
                <BookOpen className="w-3 h-3" /> What do these fields mean? See docs
              </Link>
            </CardContent>
          </Card>

          {/* -- Skills ---- */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
                <Brain className="w-4 h-4 text-fg-muted" /> Skills
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="p-3 rounded-xl bg-surface-2 border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-fg-secondary">{skill.id}</span>
                    <IconButton onClick={() => removeSkill(skill.id)} size="sm" className="hover:!text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </IconButton>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-fg-muted">Confidence ({Math.round(skill.confidence * 100)}%)</label>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={skill.confidence}
                        onChange={(e) => updateSkill(skill.id, 'confidence', Number(e.target.value))}
                        className="w-full h-1.5 rounded-full bg-surface-4 appearance-none cursor-pointer accent-sick-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-fg-muted">Domains (comma-separated)</label>
                      <input
                        type="text"
                        value={skill.domains.join(', ')}
                        onChange={(e) => updateSkill(skill.id, 'domains', e.target.value.split(',').map((d) => d.trim()).filter(Boolean))}
                        placeholder="python, golang, web"
                        className="w-full h-9 rounded-lg bg-surface-3 border border-border px-3 text-xs text-fg focus:outline-none focus:border-sick-500/50"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add skill */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newSkillId}
                    onChange={(e) => setNewSkillId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add skill ID..."
                    className="w-full h-9 rounded-lg bg-surface-3 border border-border px-3 text-sm text-fg focus:outline-none focus:border-sick-500/50"
                    list="skill-presets"
                  />
                  <datalist id="skill-presets">
                    {SKILL_PRESETS.filter((s) => !skills.find((sk) => sk.id === s)).map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <Button variant="secondary" size="sm" onClick={addSkill}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-1">
                {SKILL_PRESETS.filter((s) => !skills.find((sk) => sk.id === s)).slice(0, 10).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setSkills([...skills, { id: s, confidence: 0.8, domains: [] }]); mark(); }}
                    className="px-2 py-1 rounded text-[10px] bg-surface-3 text-fg-dimmed hover:text-sick-400 hover:bg-sick-500/5 border border-transparent hover:border-sick-500/20 transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* -- Permissions ---- */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
                <Shield className="w-4 h-4 text-fg-muted" /> Permissions
              </h2>
            </CardHeader>
            <CardContent className="space-y-5">
              <MultiToggle
                label="Accept tasks from"
                options={ACCEPT_FROM_OPTIONS}
                selected={perms.accept_from ?? []}
                onChange={(v) => { setPerms({ ...perms, accept_from: v }); mark(); }}
              />

              <div className="space-y-1.5">
                <label className="text-xs text-fg-muted uppercase tracking-wider">Skills visibility</label>
                <div className="flex gap-1.5">
                  {VISIBILITY_OPTIONS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { setPerms({ ...perms, skills_visibility: v }); mark(); }}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium text-center transition-all border ${
                        perms.skills_visibility === v
                          ? 'bg-sick-500/10 text-sick-400 border-sick-500/30'
                          : 'bg-surface-3 text-fg-muted border-border hover:border-surface-4'
                      }`}
                    >
                      {v === 'network_only' ? 'Network only' : v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                <Toggle label="Can create subtasks" value={perms.can_create_subtasks ?? false}
                  onChange={(v) => { setPerms({ ...perms, can_create_subtasks: v }); mark(); }} />
                <Toggle label="Can escalate" value={perms.can_escalate ?? false}
                  onChange={(v) => { setPerms({ ...perms, can_escalate: v }); mark(); }} />
                <Toggle label="Auto-accept own network" value={perms.auto_accept_own_network ?? false}
                  onChange={(v) => { setPerms({ ...perms, auto_accept_own_network: v }); mark(); }} />
                <Toggle label="Allow escalation to me" value={perms.allow_escalation_to_me ?? false}
                  onChange={(v) => { setPerms({ ...perms, allow_escalation_to_me: v }); mark(); }} />
              </div>

              <NumberInput
                label="Require owner approval above (bounty)"
                value={perms.require_owner_approval_above}
                onChange={(v) => { setPerms({ ...perms, require_owner_approval_above: v }); mark(); }}
                min={0} suffix="0 = disabled"
              />
            </CardContent>
          </Card>

          {/* -- Limits ---- */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-fg-muted" /> Limits
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <NumberInput label="Max spend / day" value={limits.max_spend_per_day} suffix="credits"
                  onChange={(v) => { setLimits({ ...limits, max_spend_per_day: v }); mark(); }} min={0} />
                <NumberInput label="Max spend / task" value={limits.max_spend_per_task} suffix="credits"
                  onChange={(v) => { setLimits({ ...limits, max_spend_per_task: v }); mark(); }} min={0} />
                <NumberInput label="Min bounty accept" value={limits.min_bounty_accept} suffix="credits"
                  onChange={(v) => { setLimits({ ...limits, min_bounty_accept: v }); mark(); }} min={0} />
                <NumberInput label="Max concurrent tasks" value={limits.max_concurrent_tasks}
                  onChange={(v) => { setLimits({ ...limits, max_concurrent_tasks: v }); mark(); }} min={1} max={50} />
                <NumberInput label="Max concurrent arenas" value={limits.max_concurrent_arenas}
                  onChange={(v) => { setLimits({ ...limits, max_concurrent_arenas: v }); mark(); }} min={1} max={50} />
                <NumberInput label="Max subtask depth" value={limits.max_subtask_depth}
                  onChange={(v) => { setLimits({ ...limits, max_subtask_depth: v }); mark(); }} min={1} max={10} />
                <NumberInput label="Escalation multiplier" value={limits.escalation_multiplier} step={0.1} suffix="x"
                  onChange={(v) => { setLimits({ ...limits, escalation_multiplier: v }); mark(); }} min={0.1} max={5} />
                <NumberInput label="Tasks created / hour" value={limits.max_tasks_created_per_hour}
                  onChange={(v) => { setLimits({ ...limits, max_tasks_created_per_hour: v }); mark(); }} min={1} />
                <NumberInput label="Messages / minute" value={limits.max_messages_per_minute}
                  onChange={(v) => { setLimits({ ...limits, max_messages_per_minute: v }); mark(); }} min={1} />
                <NumberInput label="API calls / minute" value={limits.max_api_calls_per_minute}
                  onChange={(v) => { setLimits({ ...limits, max_api_calls_per_minute: v }); mark(); }} min={1} />
              </div>
            </CardContent>
          </Card>

          {/* -- Behavior ---- */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
                <Zap className="w-4 h-4 text-fg-muted" /> Behavior
              </h2>
            </CardHeader>
            <CardContent className="space-y-5">
              <MultiToggle
                label="Execution modes"
                options={EXECUTION_MODES}
                selected={behavior.execution_modes ?? []}
                onChange={(v) => { setBehavior({ ...behavior, execution_modes: v }); mark(); }}
              />

              <MultiToggle
                label="Notify owner on"
                options={NOTIFY_OPTIONS}
                selected={behavior.notify_owner_on ?? []}
                onChange={(v) => { setBehavior({ ...behavior, notify_owner_on: v }); mark(); }}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <NumberInput label="Heartbeat interval" value={behavior.heartbeat_interval} suffix="seconds"
                  onChange={(v) => { setBehavior({ ...behavior, heartbeat_interval: v }); mark(); }} min={10} />
                <NumberInput label="Cooldown after failure" value={behavior.cooldown_after_failure} suffix="seconds"
                  onChange={(v) => { setBehavior({ ...behavior, cooldown_after_failure: v }); mark(); }} min={0} />
              </div>
            </CardContent>
          </Card>

          {/* -- Actions ---- */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-fg-secondary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-fg-muted" /> Actions
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => tokenMut.mutate()} loading={tokenMut.isPending}>
                  <Shield className="w-4 h-4" /> Issue JWT token
                </Button>
                <Button variant="secondary" onClick={() => regenMut.mutate()} loading={regenMut.isPending}>
                  <RefreshCw className="w-4 h-4" /> Regenerate secret
                </Button>
                <Button
                  variant="danger"
                  onClick={() => { if (confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) deleteMut.mutate(); }}
                  loading={deleteMut.isPending}
                >
                  <Trash2 className="w-4 h-4" /> Delete agent
                </Button>
              </div>

              {/* Secret banner */}
              {secretBanner && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                      <Key className="w-4 h-4" /> Agent secret — save it now
                    </span>
                    <IconButton onClick={() => setSecretBanner(null)} size="sm" className="text-amber-500/60 hover:text-amber-500">
                      <X className="w-3.5 h-3.5" />
                    </IconButton>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-0 border border-border/50 font-mono text-xs text-fg break-all">
                    <span className="flex-1 select-all">{secretBanner}</span>
                    <CopyButton text={secretBanner} size="sm" />
                  </div>
                </div>
              )}

              {/* JWT token banner */}
              {tokenBanner && (
                <div className="p-4 rounded-xl bg-sick-500/10 border border-sick-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-sick-600 dark:text-sick-400">
                      <Shield className="w-4 h-4" /> Agent JWT token
                    </span>
                    <IconButton onClick={() => setTokenBanner(null)} size="sm" className="text-sick-500/60 hover:text-sick-500">
                      <X className="w-3.5 h-3.5" />
                    </IconButton>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-0 border border-border/50 font-mono text-[10px] text-fg break-all max-h-24 overflow-y-auto">
                    <span className="flex-1 select-all">{tokenBanner}</span>
                    <CopyButton text={tokenBanner} size="sm" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Floating save bar */}
          {dirty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-4 p-4 rounded-2xl glass-strong flex flex-wrap items-center justify-between gap-3"
            >
              <p className="text-sm text-fg-secondary">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  if (agent) {
                    setName(agent.name); setModel(agent.model); setPlatform(agent.platform);
                    setSkills(agent.skills ?? []); setPerms(agent.permissions ?? {});
                    setLimits(agent.limits ?? {}); setBehavior(agent.behavior ?? {});
                    setDirty(false);
                  }
                }}>
                  Discard
                </Button>
                <Button size="sm" onClick={() => saveMut.mutate()} loading={saveMut.isPending}>
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
