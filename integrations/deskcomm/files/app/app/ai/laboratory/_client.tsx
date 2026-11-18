'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Snapshot {
  organization_id: string; organization_name: string; can_execute: boolean;
  execution: { available: boolean; reason: string };
  agents: Array<{ id: string; name: string; description: string | null; is_active: boolean; published_version_id: string | null; paused_at: string | null }>;
  runs: Array<{ id: string; agent_id: string; status: string; is_dry_run: boolean; started_at: string; completed_at: string | null; error_code: string | null }>;
}
export function Laboratory({ organizationId }: { organizationId: string }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);
  const revision = useRef(0);
  const requestSequence = useRef(0);
  const current = useRef<Snapshot | null>(null);
  const send = useCallback(() => {
    if (current.current) iframe.current?.contentWindow?.postMessage({ type: 'lotorium.crm.snapshot', revision: ++revision.current, snapshot: current.current }, window.location.origin);
  }, []);
  const refresh = useCallback(async () => {
    const sequence = ++requestSequence.current;
    try {
      const response = await fetch('/api/v1/laboratory', { cache: 'no-store' });
      const body = await response.json();
      if (sequence !== requestSequence.current) return;
      if (!response.ok) throw new Error(body.error?.message ?? 'Laboratório indisponível.');
      if (body.data.organization_id !== organizationId) throw new Error('A organização ativa mudou. Reabra o laboratório.');
      current.current = body.data;
      setSnapshot(body.data);
      setError('');
      send();
    } catch (e) {
      if (sequence !== requestSequence.current) return;
      current.current = null;
      setSnapshot(null);
      setError(e instanceof Error ? e.message : 'Falha ao consultar o laboratório.');
    }
  }, [organizationId, send]);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    const listener = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.source === iframe.current?.contentWindow && e.data?.type === 'lotorium.crm.ready') send();
    };
    window.addEventListener('message', listener);
    const controller = new AbortController();
    void fetch('/laboratory-office/index.html', { method: 'HEAD', signal: controller.signal }).then(r => setAssets(r.ok)).catch(() => setAssets(false));
    const invalidate = () => { ++requestSequence.current; current.current = null; };
    return () => { clearInterval(timer); window.removeEventListener('message', listener); controller.abort(); invalidate(); };
  }, [refresh, send]);
  return <main className="flex flex-col gap-5 p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">LOBY</h1><p>{snapshot?.organization_name ?? 'Organização ativa'}</p></div><nav className="flex gap-4"><Link className="underline" href="/app/ai/agents">Configurar agentes</Link><Link className="underline" href="/app/ai/agents/new">Criar agente</Link></nav></header>
    {error && <p role="alert">{error}</p>}
    {snapshot && assets ? <iframe ref={iframe} title="Escritório virtual da organização" src="/laboratory-office/index.html?crm=1" onLoad={send} className="h-[min(78vh,900px)] min-h-[520px] w-full rounded-2xl border border-lime-900/40 bg-[#11151b]" sandbox="allow-scripts allow-same-origin" /> : <p>O visual do LOBY ainda não está disponível nesta instalação.</p>}
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-lime-900/40 bg-lime-950/10 p-4">
      <div><h2 className="text-sm font-semibold">Primeiro, o nosso espaço</h2><p className="mt-1 text-sm text-muted-foreground">Explore o cenário e conheça a equipe. As ações de tarefas serão conectadas ao CRM na próxima etapa.</p></div>
      <button type="button" disabled className="rounded-lg border px-4 py-2 text-sm opacity-50">Tarefas · em breve</button>
    </section>
  </main>;
}
