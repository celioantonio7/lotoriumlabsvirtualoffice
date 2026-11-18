import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fail } from '@/lib/api/wrappers';
import { requireRole } from '@/lib/auth/require-role';
import { requireSupportWrite } from '@/lib/impersonate/support';
import { createClient } from '@/lib/supabase/server';
import { canPreviewAgent, laboratoryExecution } from '@/lib/laboratory/policy';
import { POST as previewAgent } from '@/app/api/v1/ai/agents/[id]/versions/[vid]/test/route';

export const dynamic = 'force-dynamic';
const taskSchema = z.object({ agent_id: z.string().uuid(), task_type: z.literal('agent_response_preview'), instruction: z.string().trim().min(1).max(4000) }).strict();
export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  // Impede submissão por formulário de outro site, mesmo numa instalação com cookies relaxados.
  if (req.headers.get('origin') !== req.nextUrl.origin) return fail('forbidden', 'Origem inválida.', 403, { requestId });
  const supportDenied = await requireSupportWrite();
  if (supportDenied) return supportDenied;
  const authz = await requireRole('admin', { requestId, resource: 'laboratory' });
  if (!authz.ok) return authz.response;
  let raw: unknown;
  try { raw = await req.json(); } catch { return fail('invalid_request', 'JSON inválido.', 400, { requestId }); }
  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) return fail('validation_failed', 'Selecione um agente e uma prévia de resposta válida (até 4000 caracteres).', 422, { requestId });
  const execution = laboratoryExecution(process.env);
  if (!execution.available) return fail('laboratory_unconfigured', execution.reason, 503, { requestId });
  const db = await createClient();
  const { data: agent, error } = await db.from('ai_agents')
    .select('id, organization_id, published_version_id, is_active, paused_at, archived_at')
    .eq('organization_id', authz.org.orgId).eq('id', parsed.data.agent_id).maybeSingle();
  if (error) return fail('internal_error', 'Não foi possível consultar o agente.', 500, { requestId });
  if (!canPreviewAgent(agent, authz.org.orgId)) return fail('not_found', 'Agente publicado e ativo não encontrado nesta organização.', 404, { requestId });
  // Reutiliza validação, motor sandbox, persistência, auditoria e limites do endpoint canônico.
  const previewReq = new NextRequest(req.url, { method: 'POST', headers: req.headers,
    body: JSON.stringify({ sample_message: parsed.data.instruction }) });
  return previewAgent(previewReq, { params: Promise.resolve({ id: agent!.id, vid: agent!.published_version_id! }) });
}
