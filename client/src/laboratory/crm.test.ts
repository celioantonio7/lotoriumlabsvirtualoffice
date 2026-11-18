import { describe, it, expect } from 'vitest';
import { acceptCrmMessage } from './crm';
const data = { type: 'lotorium.crm.snapshot', revision: 2, snapshot: { organization_id: 'tenant-a', organization_name: 'A', agents: [], runs: [], execution: { available: false, reason: 'disabled' }, can_execute: false } };
describe('CRM iframe boundary', () => {
  it('rejects foreign origin, foreign source, stale snapshots and tenant changes', () => {
    expect(acceptCrmMessage(data, false, true, null, -1)).toBeNull();
    expect(acceptCrmMessage(data, true, false, null, -1)).toBeNull();
    expect(acceptCrmMessage(data, true, true, 'tenant-b', -1)).toBeNull();
    expect(acceptCrmMessage(data, true, true, 'tenant-a', 2)).toBeNull();
    expect(acceptCrmMessage(data, true, true, 'tenant-a', 1)).not.toBeNull();
  });
  it('rejects missing data and prototype-shaped payloads', () => {
    expect(acceptCrmMessage({}, true, true, null, -1)).toBeNull();
    expect(acceptCrmMessage({ ...data, revision: NaN }, true, true, null, -1)).toBeNull();
  });
});
