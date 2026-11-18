/** Same-origin iframe contract. No tokens, local session IDs, paths or prompts. */
export interface CrmLaboratorySnapshot {
  organization_id: string;
  organization_name: string;
  can_execute: boolean;
  execution: { available: boolean; reason: string };
  agents: Array<{ id: string; name: string; description: string | null; is_active: boolean; published_version_id: string | null; paused_at: string | null }>;
  runs: Array<{ id: string; agent_id: string; status: string; is_dry_run: boolean; started_at: string; completed_at: string | null; error_code: string | null }>;
}
export interface CrmSnapshotMessage {
  type: 'lotorium.crm.snapshot';
  revision: number;
  snapshot: CrmLaboratorySnapshot;
}
