import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LayoutTemplate, Plus, Trash2, ChevronDown, ChevronUp, GripVertical,
  X, Layers, Tag, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { AdminPage } from '@/components/layout/AdminPage';
import { listTemplates, createTemplate, deleteTemplate } from '@/api/templates';
import type { TeamTemplate, TeamTemplateStep } from '@/api/types';

function timeAgo(date: string) {
  if (new Date(date).getFullYear() < 2000) return 'n/a';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 0) return 'n/a';
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const EMPTY_STEP: TeamTemplateStep = {
  role_key: '',
  title_template: '',
  description_template: '',
  required_skills: [],
  depends_on_step_indices: [],
};

function StepEditor({
  step,
  index,
  total,
  onChange,
  onRemove,
}: {
  step: TeamTemplateStep;
  index: number;
  total: number;
  onChange: (s: TeamTemplateStep) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 rounded-xl bg-surface-2 border border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-fg-dimmed" />
          <span className="text-xs font-mono text-fg-muted">Step {index + 1}</span>
        </div>
        <button onClick={onRemove} className="p-1 rounded hover:bg-surface-4 text-fg-dimmed hover:text-red-400 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label="Role key"
          value={step.role_key}
          onChange={(e) => onChange({ ...step, role_key: e.target.value })}
          placeholder="e.g. coordinator, worker, reviewer"
        />
        <Input
          label="Title template"
          value={step.title_template}
          onChange={(e) => onChange({ ...step, title_template: e.target.value })}
          placeholder="e.g. Review {{task_title}}"
        />
      </div>

      <Input
        label="Description template"
        value={step.description_template}
        onChange={(e) => onChange({ ...step, description_template: e.target.value })}
        placeholder="e.g. Perform code review for the task"
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label="Required skills (comma-separated)"
          value={step.required_skills.join(', ')}
          onChange={(e) => onChange({
            ...step,
            required_skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
          })}
          placeholder="e.g. code_review, python"
        />
        <Input
          label="Depends on steps (indices, comma-separated)"
          value={step.depends_on_step_indices.join(', ')}
          onChange={(e) => onChange({
            ...step,
            depends_on_step_indices: e.target.value
              .split(',')
              .map((s) => parseInt(s.trim(), 10))
              .filter((n) => !isNaN(n) && n >= 0 && n < total && n !== index),
          })}
          placeholder={`e.g. 0, 1 (0-based, max ${total - 1})`}
        />
      </div>
    </div>
  );
}

export function Templates() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create form
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<TeamTemplateStep[]>([{ ...EMPTY_STEP }]);

  const { data: rawTemplates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => listTemplates(),
  });
  const templates = rawTemplates ?? [];

  const createMut = useMutation({
    mutationFn: () => createTemplate({ name, steps }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setCreateOpen(false);
      setName('');
      setSteps([{ ...EMPTY_STEP }]);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  const updateStep = (i: number, step: TeamTemplateStep) => {
    setSteps(steps.map((s, idx) => idx === i ? step : s));
  };

  const removeStep = (i: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, idx) => idx !== i));
  };

  if (isLoading) return <PageSpinner />;

  return (
    <AdminPage
      title="Templates"
      description={`${templates.length} team template${templates.length !== 1 ? 's' : ''}`}
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New template
        </Button>
      }
    >

      {templates.length === 0 ? (
        <EmptyState
          icon={<LayoutTemplate className="w-6 h-6" />}
          title="No templates yet"
          description="Create a team template to define reusable multi-step workflows."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Create template
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {templates.map((tpl: TeamTemplate, i: number) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover>
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <LayoutTemplate className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-fg">{tpl.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-fg-muted">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" /> {(tpl.steps ?? []).length} steps
                      </span>
                      <span>{timeAgo(tpl.created_at)}</span>
                    </div>
                  </div>
                  {expandedId === tpl.id ? (
                    <ChevronUp className="w-4 h-4 text-fg-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-fg-muted" />
                  )}
                </div>

                {expandedId === tpl.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-border/40 overflow-hidden"
                  >
                    <div className="px-5 py-4 space-y-3">
                      {(tpl.steps ?? []).map((step, si) => (
                        <div
                          key={si}
                          className="p-3 rounded-xl bg-surface-2 border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-mono text-fg-dimmed">#{si}</span>
                            <span className="text-sm font-medium text-fg">{step.role_key}</span>
                            {step.depends_on_step_indices.length > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-fg-muted">
                                <ArrowRight className="w-3 h-3" /> depends on: {step.depends_on_step_indices.join(', ')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-fg-secondary">{step.title_template}</p>
                          {step.description_template && (
                            <p className="text-xs text-fg-dimmed mt-1">{step.description_template}</p>
                          )}
                          {step.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {step.required_skills.map((s) => (
                                <span key={s} className="inline-flex items-center gap-1 text-[10px] font-mono text-fg-muted bg-surface-3 px-2 py-0.5 rounded">
                                  <Tag className="w-2.5 h-2.5" /> {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex gap-2 pt-2 border-t border-border/30">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete template "${tpl.name}"?`)) deleteMut.mutate(tpl.id);
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
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create team template">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Code Review Pipeline"
            required
            autoFocus
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-fg-muted">Steps</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSteps([...steps, { ...EMPTY_STEP }])}
              >
                <Plus className="w-3.5 h-3.5" /> Add step
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {steps.map((step, i) => (
                <StepEditor
                  key={i}
                  step={step}
                  index={i}
                  total={steps.length}
                  onChange={(s) => updateStep(i, s)}
                  onRemove={() => removeStep(i)}
                />
              ))}
            </div>
          </div>

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
    </AdminPage>
  );
}
