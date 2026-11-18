/** O laboratório usa apenas o runtime real; configuração não implica credencial LLM válida. */
export function laboratoryExecution(env: Record<string, string | undefined>) {
  if (env.INTERNAL_AGENT_RUN_STUB === 'true') return { available: false, reason: 'Execução simulada está habilitada; o laboratório exige o motor real.' };
  if (!env.SUPABASE_DB_URL) return { available: false, reason: 'Configure a conexão do motor (SUPABASE_DB_URL) para executar prévias.' };
  return { available: true, reason: 'Prévia real de resposta. Modelo, credencial e orçamento serão validados pelo motor. Sem envio externo.' };
}
export function canPreviewAgent(agent: {
  organization_id: string;
  published_version_id: string | null;
  is_active: boolean;
  paused_at: string | null;
  archived_at: string | null;
} | null, organizationId: string): boolean {
  return !!agent && agent.organization_id === organizationId && !!agent.published_version_id && agent.is_active && !agent.paused_at && !agent.archived_at;
}
