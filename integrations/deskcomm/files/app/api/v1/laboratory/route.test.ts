import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ role: vi.fn(), queries: [] as Array<{ eq: ReturnType<typeof vi.fn> }> }));
vi.mock('@/lib/auth/require-role', () => ({ requireRole: mocks.role }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ from: (table: string) => {
  const q = { select: () => q, eq: vi.fn(() => q), is: () => q, order: () => q,
    limit: async () => ({ data: table === 'ai_agents' ? [{ id: 'agent-a', name: 'Agente A' }] : [], error: null }) };
  mocks.queries.push(q);
  return q;
} }) }));
import { GET } from './route';
beforeEach(() => {
  mocks.queries.length = 0;
  mocks.role.mockResolvedValue({ ok: true, org: { orgId: 'tenant-a', name: 'Empresa A', role: 'manager' } });
});
describe('laboratory snapshot scope', () => {
  it('filters every query by the trusted active organization and exposes no execution rights to manager', async () => {
    const result = await GET();
    const body = await result.json();
    expect(body.data.organization_id).toBe('tenant-a');
    expect(body.data.can_execute).toBe(false);
    expect(mocks.queries).toHaveLength(2);
    for (const query of mocks.queries) expect(query.eq).toHaveBeenCalledWith('organization_id', 'tenant-a');
    expect(result.headers.get('Cache-Control')).toBe('no-store');
  });
  it('stops before querying when authentication fails', async () => {
    mocks.role.mockResolvedValueOnce({ ok: false, response: new Response(null, { status: 401 }) });
    expect((await GET()).status).toBe(401);
    expect(mocks.queries).toHaveLength(0);
  });
});
