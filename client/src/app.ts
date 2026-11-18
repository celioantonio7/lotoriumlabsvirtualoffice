// CRM-only visual entrypoint: no local sessions, terminal or provider discovery.
import { OfficeStore } from './net/store';
import { createWorld } from './world';
import { installCrmBridge } from './laboratory/crm';
import { ambientOffice, withResidents } from './laboratory/residents';
import { createLoby } from './laboratory/loby';

export function start(): void {
  const store = new OfficeStore();
  const canvas = document.getElementById('world') as HTMLCanvasElement;
  const world = createWorld(canvas, store);
  world.setOptions({ showNames: true, liveliness: 'lively', daylight: 'day', theme: 'none' });
  const loby = createLoby(document.getElementById('ui')!, world);
  store.pushReplay(ambientOffice());
  installCrmBridge({ pushReplay: snapshot => store.pushReplay(withResidents(snapshot)) }, snapshot => loby.update(snapshot));
  requestAnimationFrame(() => world.overview());
}
