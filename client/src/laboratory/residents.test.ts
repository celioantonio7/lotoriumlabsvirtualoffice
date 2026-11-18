import { expect, it } from 'vitest';
import { ambientOffice, withResidents } from './residents';
it('keeps the permanent team present without inventing execution, accounts or a second Kali', () => {
 const snap = ambientOffice();
 expect(snap.agents).toHaveLength(8);
 expect(snap.accounts).toEqual([]);
 expect(snap.agents.find(a => a.name === 'Célio')?.role).toBe('Owner');
 expect(snap.agents.some(a => a.name.toLowerCase() === 'kali')).toBe(false);
 expect(snap.agents.every(a => a.status === 'idle' && a.stats.toolCalls === 0)).toBe(true);
 const live = {...snap, agents:[{...snap.agents[1],id:'crm:real',name:'Taynara',status:'working' as const}]};
 const merged = withResidents(live);
 expect(merged.agents.filter(a => a.name === 'Taynara')).toHaveLength(1);
 expect(merged.agents.find(a => a.id === 'crm:real')?.status).toBe('working');
});
