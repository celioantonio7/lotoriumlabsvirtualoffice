import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/require-role';
import { Laboratory } from './_client';
export const dynamic = 'force-dynamic';
export default async function LaboratoryPage() {
  const authz = await requireRole('manager', { resource: 'laboratory' });
  if (!authz.ok) redirect('/app/ai/agents');
  return <Laboratory organizationId={authz.org.orgId} />;
}
