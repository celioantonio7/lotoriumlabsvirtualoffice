import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ preview: vi.fn(), role: vi.fn(), agent: vi.fn(), support: vi.fn() }));
vi.mock('@/lib/auth/require-role', () => ({ requireRole: mocks.role }));
vi.mock('@/lib/impersonate/support', () => ({ requireSupportWrite: mocks.support }));
vi.mock('@/app/api/v1/ai/agents/[id]/versions/[vid]/test/route', () => ({ POST: mocks.preview }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ from: () => {
  const q = { select: () => q, eq: vi.fn(() => q), maybeSingle: mocks.agent };
  return q;
} }) }));
import { POST } from './route';
const agentId = '11111111-1111-4111-8111-111111111111';
const versionId = '22222222-2222-4222-8222-222222222222';
function request(body: unknown, origin = 'https://crm.example') {
  return new NextRequest('https://crm.example/api/v1/laboratory/tasks', {
    method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}
const task = { agent_id: agentId, task_type: 'agent_response_preview', instruction: 'Responda a esta pergunta.' };
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('SUPABASE_DB_URL', 'configured');
  vi.stubEnv('INTERNAL_AGENT_RUN_STUB', 'false');
  mocks.role.mockResolvedValue({ ok: true, user: { id: 'user' }, org: { orgId: 'tenant-a', role: 'admin' } });
  mocks.support.mockResolvedValue(null);
  mocks.agent.mockResolvedValue({ data: { id: agentId, organization_id: 'tenant-a', published_version_id: versionId, is_active: true, paused_at: null, archived_at: null }, error: null });
  mocks.preview.mockResolvedValue(new Response(JSON.stringify({ data: { status: 'ok', final_text: 'Resposta real do motor.' } })));
});
afterEach(() => vi.unstubAllEnvs());
describe('laboratory task authorization and dispatch', () => {
  it('rejects cross-origin and body tenant selection without dispatch', async () => {
    expect((await POST(request(task, 'https://other.example'))).status).toBe(403);
    expect((await POST(request({ ...task, organization_id: 'tenant-b' }))).status).toBe(422);
    expect(mocks.preview).not.toHaveBeenCalled();
  });
  it('rejects an agent from another tenant even if returned by a future faulty client', async () => {
    mocks.agent.mockResolvedValue({ data: { organization_id: 'tenant-b', published_version_id: versionId, is_active: true, paused_at: null, archived_at: null } });
    expect((await POST(request(task))).status).toBe(404);
    expect(mocks.preview).not.toHaveBeenCalled();
  });
  it('preserves denied RBAC and refuses unconfigured runtime', async () => {
    mocks.role.mockResolvedValueOnce({ ok: false, response: new Response(null, { status: 403 }) });
    expect((await POST(request(task))).status).toBe(403);
    vi.stubEnv('SUPABASE_DB_URL', '');
    expect((await POST(request(task))).status).toBe(503);
    expect(mocks.preview).not.toHaveBeenCalled();
  });
  it('dispatches only the org-scoped published version to the existing engine', async () => {
    const response = await POST(request(task));
    expect(response.status).toBe(200);
    const [req, ctx] = mocks.preview.mock.calls[0];
    expect(await req.json()).toEqual({ sample_message: task.instruction });
    expect(await ctx.params).toEqual({ id: agentId, vid: versionId });
    expect(await response.json()).toEqual({ data: { status: 'ok', final_text: 'Resposta real do motor.' } });
  });
});
