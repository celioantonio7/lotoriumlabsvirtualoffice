/** CRM-only static host. No provider discovery, sessions, terminal, hooks or local executor. */
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { createRequestGuard } from './http/guard';
import { createStaticHandler } from './http/static';
const root = resolve(process.cwd());
const port = Number(process.env.LOTORIUM_LABS_PORT ?? 4747);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Porta inválida.');
const serve = createStaticHandler(resolve(root, 'dist/client'));
const guard = createRequestGuard({ allowedHosts: new Set() });
const server = createServer((req,res)=>{
 if (guard(req,res)) return;
 const url=new URL(req.url ?? '/', 'http://localhost');
 if (url.pathname === '/api/health') {
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,product:'LOTORIUM LABS',mode:'crm-only',localSessions:false,localExecution:false,remote:false,terminal:false,pty:false,messages:false}));return;
 }
 if(url.pathname.startsWith('/api/')) {res.statusCode=404;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Este laboratório usa exclusivamente a API autenticada do CRM.'}));return;}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.statusCode=405;res.end();return;}
 serve(req,res,url.pathname);
});
const host = process.env.LOTORIUM_LABS_HOST ?? '127.0.0.1';
server.listen(port,host,()=>console.log(`LOTORIUM LABS · exclusivo CRM · http://127.0.0.1:${port}`));
