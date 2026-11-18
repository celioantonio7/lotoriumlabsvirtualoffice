// Direction grid and sector hysteresis adapted from page-mascot (MIT).
// See public/assets/laboratory/PAGE-MASCOT-LICENSE.txt.
import { tr } from '../../../shared/i18n';
import { LABORATORY_TEAM, type LaboratoryTeamProfile } from '../../../shared/laboratory-team';
import { avatarCanvas } from '../art';
import { drawKaliSprite } from '../world/render/kali';

const clockwise = [5, 8, 7, 6, 3, 0, 1, 2];
const sectorAngle = Math.PI / 4;

/** Return the cell in page-mascot's 3×3 direction atlas. */
export function portraitDirection(dx: number, dy: number, previous = 4): number {
  if (Math.hypot(dx, dy) < 70) return 4;
  const angle = Math.atan2(dy, dx);
  const sector = clockwise.indexOf(previous);
  const delta = angle - sector * sectorAngle;
  if (sector !== -1 && Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta))) < sectorAngle / 2 + 0.12) return previous;
  return clockwise[(Math.round(angle / sectorAngle) + 8) % 8];
}

/** Event-only tracking: no idle loop, timers, network or model calls. */
export function bindPortraitTracking(element: HTMLElement, render: (cell: number) => void, viewport: Window = window): () => void {
  const reduced = viewport.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = viewport.matchMedia('(hover: hover) and (pointer: fine)');
  let cell = 4;
  let pointer: { x: number; y: number } | null = null;
  const aim = () => {
    if (reduced.matches || !fine.matches || !pointer) {
      cell = 4;
    } else {
      const box = element.getBoundingClientRect();
      cell = portraitDirection(pointer.x - box.left - box.width / 2, pointer.y - box.top - box.height / 2, cell);
    }
    render(cell);
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    aim();
  };
  const reset = () => { pointer = null; aim(); };
  viewport.addEventListener('pointermove', move, { passive: true });
  viewport.addEventListener('scroll', aim, { passive: true });
  viewport.addEventListener('resize', aim, { passive: true });
  viewport.addEventListener('blur', reset);
  reduced.addEventListener('change', aim);
  fine.addEventListener('change', aim);
  render(4);
  return () => {
    viewport.removeEventListener('pointermove', move);
    viewport.removeEventListener('scroll', aim);
    viewport.removeEventListener('resize', aim);
    viewport.removeEventListener('blur', reset);
    reduced.removeEventListener('change', aim);
    fine.removeEventListener('change', aim);
  };
}

/** Append element to a panel, and call destroy before removing/replacing it. */
export function createLaboratoryPortrait(profile: LaboratoryTeamProfile | 'kali', size = 64): { element: HTMLButtonElement; destroy: () => void } {
  const cat = profile === 'kali';
  const name = cat ? 'Kali' : profile.name;
  const element = document.createElement('button');
  element.type = 'button';
  element.className = 'laboratory-portrait';
  element.setAttribute('aria-label', tr('Interagir com {0}', [name]));
  element.title = name;
  Object.assign(element.style, { position: 'relative', display: 'inline-block', flexShrink: '0', width: `${size}px`, height: `${size}px`, border: '1px solid #38515d', borderRadius: '12px', padding: '0', background: '#0a1923', cursor: 'pointer', overflow: 'hidden' });
  const visual = document.createElement('span');
  const catCanvas = cat ? document.createElement('canvas') : null;
  if (catCanvas) {
    catCanvas.width = 64; catCanvas.height = 64;
    Object.assign(catCanvas.style, { width: '100%', height: '100%', imageRendering: 'pixelated' });
    visual.append(catCanvas);
  }
  visual.setAttribute('aria-hidden', 'true');
  const index = cat ? 0 : LABORATORY_TEAM.findIndex(person => person.id === profile.id);
  const humanPortrait = cat ? '' : avatarCanvas(1234 + index * 113, { look: ['taynara', 'thaysa'].includes(profile.id) ? 'f' : 'm', scale: 3 }).toDataURL();
  Object.assign(visual.style, { display: 'block', width: '100%', height: '100%', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', backgroundSize: '100% 100%', backgroundPosition: '50% 50%', backgroundImage: cat ? 'none' : `url("${humanPortrait}")` });
  element.append(visual);
  let reacting = false;
  let timer: number | undefined;
  let lastCell = 4;
  const paintCat = (cell: number, reacting = false) => {
    const ctx = catCanvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 64, 64);
    drawKaliSprite(ctx, { x: 29, y: 56, scale: 2, lookX: cell % 3 - 1, lookY: Math.floor(cell / 3) - 1, reacting });
  };
  const paint = (cell: number) => {
    lastCell = cell;
    if (reacting) return;
    if (cat) paintCat(cell);
    else visual.style.transform = `translate(${(cell % 3 - 1) * 3}px, ${(Math.floor(cell / 3) - 1) * 3}px)`;
  };
  const cleanup = bindPortraitTracking(element, paint);
  const react = () => {
    if (timer !== undefined) window.clearTimeout(timer);
    if (cat) {
      reacting = true;
      paintCat(lastCell, true);
    } else {
      element.style.borderColor = '#60e6c4';
    }
    timer = window.setTimeout(() => {
      reacting = false;
      element.style.borderColor = '#38515d';
      paint(lastCell);
    }, 560);
  };
  element.addEventListener('click', react);
  return { element, destroy: () => { cleanup(); element.removeEventListener('click', react); if (timer !== undefined) window.clearTimeout(timer); } };
}
