import type { CrmLaboratorySnapshot, CrmSnapshotMessage } from '../../../shared/laboratory-crm';
import type { OfficeSnapshot } from '../../../shared/types';

export function isCrmMode(search = window.location.search): boolean {
  return new URLSearchParams(search).get('crm') === '1';
}
export function acceptCrmMessage(raw: unknown, sameOrigin: boolean, fromParent: boolean, organizationId: string | null, lastRevision: number): CrmSnapshotMessage | null {
  if (!sameOrigin || !fromParent || !raw || typeof raw !== 'object') return null;
  const m = raw as CrmSnapshotMessage;
  if (m.type !== 'lotorium.crm.snapshot' || !Number.isSafeInteger(m.revision) || m.revision <= lastRevision) return null;
  const s = m.snapshot;
  if (!s || typeof s.organization_id !== 'string' || !s.organization_id || typeof s.organization_name !== 'string'
    || (organizationId !== null && s.organization_id !== organizationId)
    || !s.execution || typeof s.execution.available !== 'boolean' || typeof s.execution.reason !== 'string'
    || typeof s.can_execute !== 'boolean' || !Array.isArray(s.agents) || s.agents.length > 100 || !Array.isArray(s.runs) || s.runs.length > 30) return null;
  if (s.agents.some(a => !a || typeof a.id !== 'string' || typeof a.name !== 'string' || typeof a.is_active !== 'boolean'
    || (a.description !== null && typeof a.description !== 'string')
    || (a.published_version_id !== null && typeof a.published_version_id !== 'string')
    || (a.paused_at !== null && typeof a.paused_at !== 'string'))) return null;
  if (s.runs.some(r => !r || typeof r.id !== 'string' || typeof r.agent_id !== 'string' || typeof r.status !== 'string'
    || typeof r.is_dry_run !== 'boolean' || typeof r.started_at !== 'string' || !Number.isFinite(Date.parse(r.started_at))
    || (r.completed_at !== null && (typeof r.completed_at !== 'string' || !Number.isFinite(Date.parse(r.completed_at)))))) return null;
  return m;
}
function seed(id: string): number {
  let n = 0;
  for (const c of id) n = (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0;
  return n;
}
/** Stats are absent from the CRM projection; the canvas only uses identity/status. */
export function crmOfficeSnapshot(s: CrmLaboratorySnapshot, revision: number): OfficeSnapshot {
  const now = Date.now();
  const roomId = `crm:${s.organization_id}`;
  return {
    rev: revision, serverTime: now, accounts: [],
    rooms: [{ id: roomId, name: s.organization_name, path: '', slot: 0, seed: seed(roomId), createdAt: 0 }],
    agents: s.agents.map(a => {
      const active = s.runs.find(r => r.agent_id === a.id && r.status === 'running' && !r.completed_at);
      const since = active ? Date.parse(active.started_at) : 0;
      return {
        id: `crm:${a.id}`, kind: 'main', roomId, name: a.name, look: 'f', role: 'Agente do CRM', title: a.description ?? undefined,
        sessionId: '', account: '', status: active ? 'working' : 'idle', recent: [], tasks: [],
        startedAt: since, lastEventAt: since, statusSince: since,
        stats: { toolCalls: 0, tokensIn: 0, tokensOut: 0, subagents: 0 }, seed: seed(a.id),
      };
    }),
    meta: { demo: false, sources: [], startedAt: 0, version: 'crm', terminal: false, messages: false },
  };
}
/** Caller must never call store.connect() or mount local-session UI in CRM mode. */
export function installCrmBridge(store: { pushReplay(snapshot: OfficeSnapshot): void }, onSnapshot?: (snapshot: CrmLaboratorySnapshot) => void): () => void {
  if (window.parent === window) return () => undefined;
  let organizationId: string | null = null;
  let revision = -1;
  const listener = (event: MessageEvent) => {
    const message = acceptCrmMessage(event.data, event.origin === window.location.origin, event.source === window.parent, organizationId, revision);
    if (!message) return;
    organizationId = message.snapshot.organization_id;
    revision = message.revision;
    store.pushReplay(crmOfficeSnapshot(message.snapshot, revision));
    onSnapshot?.(message.snapshot);
  };
  window.addEventListener('message', listener);
  if (window.parent !== window) window.parent.postMessage({ type: 'lotorium.crm.ready' }, window.location.origin);
  return () => window.removeEventListener('message', listener);
}
