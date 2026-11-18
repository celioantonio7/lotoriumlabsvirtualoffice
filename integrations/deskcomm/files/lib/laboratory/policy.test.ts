import { describe, expect, it } from 'vitest';
import { laboratoryExecution, canPreviewAgent } from './policy';
describe('laboratory boundary', () => {
  it('fails closed without database configuration and rejects synthetic execution', () => {
    expect(laboratoryExecution({}).available).toBe(false);
    expect(laboratoryExecution({ SUPABASE_DB_URL: 'configured', INTERNAL_AGENT_RUN_STUB: 'true' }).available).toBe(false);
    expect(laboratoryExecution({ SUPABASE_DB_URL: 'configured' }).available).toBe(true);
  });
  it('rejects agents from another tenant, paused agents and unpublished agents', () => {
    const agent = { organization_id: 'tenant-a', published_version_id: 'version', is_active: true, paused_at: null, archived_at: null };
    expect(canPreviewAgent(agent, 'tenant-b')).toBe(false);
    expect(canPreviewAgent({ ...agent, paused_at: 'today' }, 'tenant-a')).toBe(false);
    expect(canPreviewAgent({ ...agent, published_version_id: null }, 'tenant-a')).toBe(false);
    expect(canPreviewAgent(agent, 'tenant-a')).toBe(true);
  });
});
