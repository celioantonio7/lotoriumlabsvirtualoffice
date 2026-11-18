import { randomUUID } from 'node:crypto';
import { ok, fail } from '@/lib/api/wrappers';
import { requireRole } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { laboratoryExecution } from '@/lib/laboratory/policy';

export const dynamic = 'force-dynamic';
export async function GET() {
  const requestId = randomUUID();
  const authz = await requireRole('manager', { requestId, resource: 'laboratory' });
  if (!authz.ok) return authz.response;
  const db = await createClient();
  const organizationId = authz.org.orgId;
  const [agents, runs] = await Promise.all([
    db.from('ai_agents').select('id, name, description, is_active, published_version_id, paused_at')
      .eq('organization_id', organizationId).is('archived_at', null).order('name').limit(100),
    db.from('ai_agent_runs').select('id, agent_id, status, is_dry_run, started_at, completed_at, error_code')
      .eq('organization_id', organizationId).eq('is_dry_run', true).order('started_at', { ascending: false }).limit(30),
  ]);
  if (agents.error || runs.error) return fail('internal_error', 'Não foi possível consultar o laboratório.', 500, { requestId });
  return ok({ organization_id: organizationId, organization_name: authz.org.name,
    can_execute: authz.org.role === 'admin', execution: laboratoryExecution(process.env),
    agents: agents.data, runs: runs.data }, { requestId, headers: { 'Cache-Control': 'no-store' } });
}
