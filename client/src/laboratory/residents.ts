import { LABORATORY_TEAM } from '../../../shared/laboratory-team';
import type { OfficeSnapshot, AgentInfo } from '../../../shared/types';
const roomIds = ['leadership', 'sales', 'design', 'happycash', 'support'];
const roomNames = ['Direção · Célio', 'Vendas · Taynara', 'Design · Thaysa', 'Happycash', 'Support HappyCash'];
function roomFor(id: string): number { return id === 'celio' ? 0 : id === 'taynara' ? 1 : id === 'thaysa' ? 2 : id === 'isaias' ? 4 : 3; }
/** Permanent visual residents never claim a provider session or executed work. */
export function ambientOffice(): OfficeSnapshot {
 return {
  rev:0, serverTime:Date.now(), accounts:[],
  rooms:roomIds.map((id,i)=>({id:`resident:${id}`,name:roomNames[i],path:'',slot:i,seed:i+20,createdAt:0})),
  agents:LABORATORY_TEAM.map((p,i):AgentInfo=>({id:`resident:${p.id}`,kind:'main',roomId:`resident:${roomIds[roomFor(p.id)]}`,name:p.name,role:p.role,
   look:['taynara','thaysa'].includes(p.id)?'f':'m',title:p.id==='celio'?'Owner · Célio':'Perfil visual · configure o agente no CRM',
   sessionId:'',account:'',status:'idle',recent:[],tasks:[],startedAt:0,lastEventAt:0,statusSince:0,seed:1234+i*113,
   stats:{toolCalls:0,tokensIn:0,tokensOut:0,subagents:0}})),
  meta:{demo:false,sources:[],startedAt:0,version:'LOTORIUM LABS',terminal:false,messages:false}
 };
}
export function withResidents(snapshot: OfficeSnapshot): OfficeSnapshot {
 const ambient=ambientOffice();
 const names=new Set(snapshot.agents.map(a=>a.name.trim().toLocaleLowerCase('pt-BR')));
 return {...snapshot, rooms:[...snapshot.rooms,...ambient.rooms.filter(r=>!snapshot.rooms.some(existing=>existing.id===r.id))],
  agents:[...snapshot.agents,...ambient.agents.filter(a=>!names.has(a.name.toLocaleLowerCase('pt-BR')))]};
}
