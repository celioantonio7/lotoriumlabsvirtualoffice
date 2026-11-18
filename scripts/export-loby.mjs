// Export only public scene assets; no Node server, local state or credentials.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const crm = process.argv[2];
if (!crm || !existsSync(resolve(crm, 'package.json'))) throw new Error('Informe a pasta do DeskComm CRM com package.json.');
const build = spawnSync(process.execPath, [resolve('node_modules/vite/bin/vite.js'), 'build', '--base=/laboratory-office/'], { stdio:'inherit' });
if(build.status !== 0) process.exit(build.status ?? 1);
const target = resolve(crm, 'public/laboratory-office');
mkdirSync(target,{recursive:true}); cpSync(resolve('dist/client'),target,{recursive:true});
console.log(`LOBY exportado para ${target}`);
