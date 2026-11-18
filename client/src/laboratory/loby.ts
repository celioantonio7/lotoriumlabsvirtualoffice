import type { WorldApi } from '../world/api';
import type { CrmLaboratorySnapshot } from '../../../shared/laboratory-crm';
import { LABORATORY_TEAM } from '../../../shared/laboratory-team';
import { createLaboratoryPortrait } from './portraits';
import { tr } from '../../../shared/i18n';
import './loby.css';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  return element;
}
export function createLoby(root: HTMLElement, world: WorldApi) {
  const header = node('header'); header.className = 'loby-header';
  const brand = node('div'); brand.className = 'loby-brand';
  const icon = node('img'); icon.src = `${import.meta.env.BASE_URL}assets/brand/lotorium-icon.webp`; icon.alt = 'LOTORIUM LABS';
  const wordmark = node('span'); wordmark.className = 'loby-wordmark';
  for (const filename of ['lotorium-labs.svg', 'lotorium-neon.svg']) {
    const image = node('img'); image.src = `${import.meta.env.BASE_URL}assets/brand/${filename}`; image.alt = ''; wordmark.append(image);
  }
  brand.append(icon, wordmark); header.append(brand);
  const identity = node('div'); identity.className = 'loby-identity'; identity.append(node('strong', 'LOBY'), node('span', tr('O espaço da sua equipe'))); header.append(identity);
  const connection = node('span', tr('Prévia visual')); connection.className = 'loby-connection'; header.append(connection);
  const controls = node('nav'); controls.setAttribute('aria-label', tr('Controles do cenário'));
  const overview = node('button', tr('Visão geral')); overview.type = 'button'; overview.onclick = () => world.overview(); controls.append(overview);
  for (const [label, factor] of [['+', 1.2], ['−', 1 / 1.2]] as const) { const button = node('button', label); button.type = 'button'; button.setAttribute('aria-label', factor > 1 ? tr('Aproximar cenário') : tr('Afastar cenário')); button.onclick = () => world.zoomBy(factor); controls.append(button); }
  const teamButton = node('button', tr('Equipe')); teamButton.type = 'button'; teamButton.setAttribute('aria-controls', 'loby-team'); controls.append(teamButton); header.append(controls);
  root.append(header);
  const panel = node('aside'); panel.id = 'loby-team'; panel.className = 'loby-panel'; panel.setAttribute('aria-label', tr('Equipe LOTORIUM LABS'));
  const panelHead = node('div'); panelHead.className = 'loby-panel-heading'; panelHead.append(node('h1', tr('Nossa equipe')), node('span', '08')); panel.append(panelHead);
  const owner = node('p', tr('Célio é o Owner. Cada pessoa tem seu espaço.')); owner.className = 'loby-caption'; panel.append(owner);
  const roster = node('div'); roster.className = 'loby-roster'; panel.append(roster);
  const state = node('div'); state.className = 'loby-state'; state.append(node('strong', tr('Visual em construção')), node('p', tr('Os personagens circulam pelo LOBY. As ações de tarefas serão conectadas ao CRM.'))); panel.append(state);
  const taskButton = node('button', tr('Tarefas · em breve')); taskButton.type = 'button'; taskButton.disabled = true; taskButton.className = 'loby-task-button'; panel.append(taskButton);
  root.append(panel);
  const footer = node('footer'); footer.className = 'loby-footer'; footer.append(node('span', tr('Arraste para explorar · use + e − para aproximar')), node('span', tr('Happycash · Support HappyCash · Piscina · Bosque'))); root.append(footer);
  const portraits: Array<{ destroy(): void }> = [];
  let current: CrmLaboratorySnapshot | undefined;
  function render() {
    portraits.forEach(p => p.destroy()); portraits.length = 0; roster.replaceChildren();
    for (const profile of LABORATORY_TEAM) {
      const row = node('article'); row.className = 'loby-person';
      const portrait = createLaboratoryPortrait(profile, 38); portraits.push(portrait);
      const agent = current?.agents.find(a => a.name.toLocaleLowerCase('pt-BR') === profile.name.toLocaleLowerCase('pt-BR'));
      portrait.element.onclick = () => world.focusAgent(agent ? `crm:${agent.id}` : `resident:${profile.id}`);
      const info = node('div'); info.append(node('strong', profile.name), node('span', tr(profile.role)));
      row.append(portrait.element, info); const badge = node('span', profile.id === 'celio' ? 'OWNER' : tr('No LOBY')); badge.className = 'loby-person-state'; row.append(badge); roster.append(row);
    }
    const cat = createLaboratoryPortrait('kali', 38); portraits.push(cat); cat.element.setAttribute('aria-label', tr('Ver Kali de perto')); cat.element.onclick = () => world.focusKali?.();
    const catRow = node('article'); catRow.className = 'loby-person loby-cat'; const info = node('div'); info.append(node('strong', 'Kali'), node('span', tr('Nossa gatinha · explorando o jardim'))); catRow.append(cat.element, info); roster.append(catRow);
  }
  render();
  let wide = window.innerWidth >= 1050;
  let open = wide;
  const layout = () => { const nowWide = window.innerWidth >= 1050; if (wide !== nowWide) { open = nowWide; wide = nowWide; } panel.hidden = !open; teamButton.setAttribute('aria-expanded', String(open)); world.setViewInsets?.({ top: window.innerWidth < 700 ? 108 : 80, right: open && window.innerWidth >= 1050 ? 320 : 0, bottom: 42 }); };
  teamButton.onclick = () => { open = !open; layout(); world.overview(); };
  window.addEventListener('resize', layout); layout();
  const preload = document.getElementById('loby-preload');
  window.setTimeout(() => { preload?.remove(); world.overview(); }, 1000);
  return { update(snapshot: CrmLaboratorySnapshot) { current = snapshot; connection.textContent = `${snapshot.organization_name} · CRM`; render(); }, destroy() { window.removeEventListener('resize', layout); portraits.forEach(p => p.destroy()); header.remove(); panel.remove(); footer.remove(); } };
}
