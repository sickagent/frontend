import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Network as NetworkIcon, Plus, Users, UserPlus, LogOut,
  Check, X, Crown, Clock, Globe, Home, Bot, Pencil,
  ChevronDown, ChevronUp, Shield, Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { IconButton } from '@/components/ui/IconButton';
import { useAuth } from '@/hooks/useAuth';
import {
  getPersonalNetwork, listExtendedNetworks, listMemberships,
  createExtendedNetwork, inviteToNetwork, acceptInvite, rejectInvite,
  leaveNetwork, renameNetwork, getNetworkAgents, setNetworkAgents,
} from '@/api/networks';
import { listAgents } from '@/api/agents';
import { resolveOwners } from '@/api/auth';
import type { Network, NetworkMembership, Agent, Owner } from '@/api/types';

function NetworkAgentManager({ networkId, isOwner }: { networkId: string; isOwner: boolean }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { data: rawNetAgents } = useQuery({
    queryKey: ['network-agents', networkId],
    queryFn: () => getNetworkAgents(networkId),
  });
  const netAgentIds = rawNetAgents ?? [];

  const { data: rawAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: listAgents,
  });
  const agents = rawAgents ?? [];

  const saveMut = useMutation({
    mutationFn: (ids: string[]) => setNetworkAgents(networkId, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-agents', networkId] });
      setEditing(false);
    },
  });

  const startEdit = () => {
    setSelected([...netAgentIds]);
    setEditing(true);
  };

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const assignedAgents = agents.filter((a: Agent) => netAgentIds.includes(a.id));

  return (
    <div className="mt-4 pt-3 border-t border-border/30">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
          <Bot className="w-3 h-3" /> Agents in network ({netAgentIds.length})
        </h4>
        {isOwner && !editing && (
          <Button variant="ghost" size="sm" onClick={startEdit}>
            <Pencil className="w-3 h-3" /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {agents.map((agent: Agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => toggle(agent.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border ${
                  selected.includes(agent.id)
                    ? 'bg-sick-500/10 text-sick-400 border-sick-500/30'
                    : 'bg-surface-3 text-fg-muted border-border hover:border-surface-4'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  agent.availability === 'online' ? 'bg-emerald-400' :
                  agent.availability === 'busy' ? 'bg-amber-400' : 'bg-fg-dimmed'
                }`} />
                <span className="truncate">{agent.name}</span>
              </button>
            ))}
          </div>
          {agents.length === 0 && (
            <p className="text-xs text-fg-dimmed">No agents available. Create agents first.</p>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={() => saveMut.mutate(selected)} loading={saveMut.isPending}>
              <Check className="w-3 h-3" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {assignedAgents.length === 0 ? (
            <p className="text-xs text-fg-dimmed">No agents assigned</p>
          ) : (
            assignedAgents.map((agent: Agent) => (
              <div key={agent.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-3 border border-border/50 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  agent.availability === 'online' ? 'bg-emerald-400' :
                  agent.availability === 'busy' ? 'bg-amber-400' : 'bg-fg-dimmed'
                }`} />
                <span className="text-fg-secondary">{agent.name}</span>
                <StatusBadge status={agent.availability} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MembersList({ members, ownerId }: { members: { owner_id: string; status: string; joined_at: string | null; invited_by: string | null }[]; ownerId: string }) {
  const ownerIds = [...new Set(members.map((m) => m.owner_id))];
  const { data: rawOwners } = useQuery({
    queryKey: ['owners', ownerIds.sort().join(',')],
    queryFn: () => resolveOwners(ownerIds),
    enabled: ownerIds.length > 0,
  });
  const owners = rawOwners ?? [];

  const getName = (id: string) => {
    const owner = owners.find((o: Owner) => o.id === id);
    return owner?.name || owner?.email || id.slice(0, 10) + '...';
  };

  return (
    <div className="mt-4 pt-3 border-t border-border/30">
      <h4 className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Users className="w-3 h-3" /> Members ({members.length})
      </h4>
      <div className="space-y-1">
        {members.map((m) => (
          <div key={m.owner_id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2/50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-sick-500 flex items-center justify-center text-[10px] font-bold text-white">
              {getName(m.owner_id)[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-fg-secondary truncate">{getName(m.owner_id)}</p>
              {m.joined_at && (
                <p className="text-[10px] text-fg-dimmed">Joined {new Date(m.joined_at).toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {m.owner_id === ownerId && (
                <Badge variant="purple"><Crown className="w-2.5 h-2.5 mr-0.5" /> Owner</Badge>
              )}
              {m.status === 'pending' && (
                <Badge variant="warning"><Clock className="w-2.5 h-2.5 mr-0.5" /> Pending</Badge>
              )}
              {m.status === 'accepted' && m.owner_id !== ownerId && (
                <Badge variant="success"><Check className="w-2.5 h-2.5 mr-0.5" /> Member</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Networks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState<{ id: string; name: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const { data: personal, isLoading: pLoading } = useQuery({
    queryKey: ['network', 'personal'],
    queryFn: getPersonalNetwork,
  });

  const { data: rawExtended, isLoading: eLoading } = useQuery({
    queryKey: ['networks', 'extended'],
    queryFn: listExtendedNetworks,
  });
  const extended = rawExtended ?? [];

  const { data: rawMemberships, isLoading: mLoading } = useQuery({
    queryKey: ['networks', 'memberships'],
    queryFn: listMemberships,
  });
  const memberships = rawMemberships ?? [];

  const inv = () => {
    queryClient.invalidateQueries({ queryKey: ['networks'] });
    queryClient.invalidateQueries({ queryKey: ['network'] });
  };

  const createMut = useMutation({
    mutationFn: (name: string) => createExtendedNetwork(name || undefined),
    onSuccess: () => { inv(); setCreateOpen(false); setNewName(''); },
  });

  const renameMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameNetwork(id, name),
    onSuccess: () => { inv(); setRenameOpen(null); },
  });

  const inviteMut = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => inviteToNetwork(id, email),
    onSuccess: () => { inv(); setInviteOpen(null); setInviteEmail(''); },
  });

  const acceptMut = useMutation({ mutationFn: acceptInvite, onSuccess: inv });
  const rejectMut = useMutation({ mutationFn: rejectInvite, onSuccess: inv });
  const leaveMut = useMutation({ mutationFn: leaveNetwork, onSuccess: inv });

  if (pLoading || eLoading || mLoading) return <PageSpinner />;

  const pendingInvites = memberships.filter((m: NetworkMembership) => m.status === 'pending');
  const totalNetworks = (personal ? 1 : 0) + extended.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-fg">Networks</h1>
          <p className="text-sm text-fg-muted mt-1">{totalNetworks} network{totalNetworks !== 1 ? 's' : ''} active</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New network
        </Button>
      </motion.div>

      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 text-center">
          <p className="text-lg font-display font-bold text-fg">{totalNetworks}</p>
          <p className="text-[10px] text-fg-muted uppercase">Networks</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-lg font-display font-bold text-fg">
            {extended.reduce((acc: number, n: Network) => acc + (n.members?.length || 0), 0) + (personal?.members?.length || 0)}
          </p>
          <p className="text-[10px] text-fg-muted uppercase">Total members</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-lg font-display font-bold text-amber-400">{pendingInvites.length}</p>
          <p className="text-[10px] text-fg-muted uppercase">Pending</p>
        </Card>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h2 className="text-sm font-semibold text-fg-secondary mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Pending invitations ({pendingInvites.length})
          </h2>
          <div className="space-y-2">
            {pendingInvites.map((m: NetworkMembership) => (
              <Card key={m.network_id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-fg-secondary">Network invite</p>
                  <p className="text-xs text-fg-muted font-mono">{m.network_id.slice(0, 12)}...</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptMut.mutate(m.network_id)} loading={acceptMut.isPending}>
                    <Check className="w-3.5 h-3.5" /> Accept
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => rejectMut.mutate(m.network_id)}>
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Personal network */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-sm font-semibold text-fg-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
            <Home className="w-3.5 h-3.5" /> Personal
          </h2>
          {personal ? (
            <Card>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sick-500/10 border border-sick-500/20 flex items-center justify-center">
                    <Home className="w-5 h-5 text-sick-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-fg-secondary">Personal Network</p>
                    <p className="text-xs text-fg-muted">Your agents — no escrow, direct transfers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{personal.members?.length || 0} members</Badge>
                    <Badge variant="success"><Shield className="w-2.5 h-2.5 mr-0.5" /> No escrow</Badge>
                  </div>
                </div>

                {/* Agent assignment for personal network */}
                <NetworkAgentManager networkId={personal.id} isOwner={true} />
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-center text-sm text-fg-dimmed">
              Create 2+ agents to activate your personal network
            </Card>
          )}
        </motion.div>

        {/* Extended networks */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-sm font-semibold text-fg-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Extended networks
          </h2>
          {extended.length === 0 ? (
            <EmptyState
              icon={<NetworkIcon className="w-6 h-6" />}
              title="No extended networks"
              description="Create a network and invite other owners to collaborate."
              action={<Button onClick={() => setCreateOpen(true)} size="sm"><Plus className="w-4 h-4" /> Create network</Button>}
            />
          ) : (
            <div className="space-y-3">
              {extended.map((net: Network, i: number) => {
                const isOwner = net.owner_id === user?.id;
                const expanded = expandedId === net.id;

                return (
                  <motion.div key={net.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card>
                      <div
                        className="p-5 cursor-pointer"
                        onClick={() => setExpandedId(expanded ? null : net.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <NetworkIcon className="w-5 h-5 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-fg-secondary">{net.name || 'Unnamed network'}</p>
                              {isOwner && (
                                <IconButton
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); setRenameOpen({ id: net.id, name: net.name || '' }); }}
                                >
                                  <Pencil className="w-3 h-3" />
                                </IconButton>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default"><Users className="w-3 h-3 mr-1" />{net.members?.length || 0}</Badge>
                              {isOwner && <Badge variant="purple"><Crown className="w-3 h-3 mr-1" /> Owner</Badge>}
                              <Badge variant="default"><Shield className="w-3 h-3 mr-1" /> Escrow</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isOwner && (
                              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setInviteOpen(net.id); }}>
                                <UserPlus className="w-3.5 h-3.5" /> Invite
                              </Button>
                            )}
                            {!isOwner && (
                              <Button variant="ghost" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Leave this network?')) leaveMut.mutate(net.id);
                              }}>
                                <LogOut className="w-3.5 h-3.5" /> Leave
                              </Button>
                            )}
                            {expanded ? <ChevronUp className="w-4 h-4 text-fg-muted" /> : <ChevronDown className="w-4 h-4 text-fg-muted" />}
                          </div>
                        </div>
                      </div>

                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="px-5 pb-5 space-y-0 overflow-hidden"
                        >
                          {/* Members */}
                          {net.members && net.members.length > 0 && (
                            <MembersList members={net.members} ownerId={net.owner_id} />
                          )}

                          {/* Agent assignment */}
                          <NetworkAgentManager networkId={net.id} isOwner={isOwner} />

                          {/* Network info */}
                          <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-xs text-fg-dimmed">
                            <span>ID: <code className="text-fg-muted">{net.id.slice(0, 12)}...</code></span>
                            <span>|</span>
                            <span>Created {new Date(net.created_at).toLocaleDateString()}</span>
                          </div>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create network">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(newName); }} className="space-y-4">
          <Input label="Network name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. AI Dev Team" autoFocus />
          <p className="text-xs text-fg-muted">Extended networks use escrow for cross-owner transactions. Members join by invitation.</p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={createMut.isPending} className="flex-1">Create</Button>
          </div>
        </form>
      </Modal>

      {/* Invite modal */}
      <Modal open={!!inviteOpen} onClose={() => setInviteOpen(null)} title="Invite member">
        <form onSubmit={(e) => { e.preventDefault(); if (inviteOpen) inviteMut.mutate({ id: inviteOpen, email: inviteEmail }); }} className="space-y-4">
          <Input label="Email or Owner ID" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com or owner_id" required autoFocus />
          <p className="text-xs text-fg-muted">The invited user will need to accept the invitation before joining.</p>
          {inviteMut.isError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {(inviteMut.error as Error).message}
            </div>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={inviteMut.isPending} className="flex-1">Invite</Button>
          </div>
        </form>
      </Modal>

      {/* Rename modal */}
      <Modal open={!!renameOpen} onClose={() => setRenameOpen(null)} title="Rename network">
        <form onSubmit={(e) => { e.preventDefault(); if (renameOpen) renameMut.mutate(renameOpen); }} className="space-y-4">
          <Input
            label="Network name"
            value={renameOpen?.name ?? ''}
            onChange={(e) => renameOpen && setRenameOpen({ ...renameOpen, name: e.target.value })}
            autoFocus
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setRenameOpen(null)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={renameMut.isPending} className="flex-1">Rename</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
