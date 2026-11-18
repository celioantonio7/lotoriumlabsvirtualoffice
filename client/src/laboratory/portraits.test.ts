import { describe, expect, it } from 'vitest';
import { bindPortraitTracking, portraitDirection } from './portraits';
import { LABORATORY_TEAM } from '../../../shared/laboratory-team';

describe('laboratory portraits', () => {
  it('uses a neutral dead zone and the upstream clockwise direction grid', () => {
    expect(portraitDirection(20, 20)).toBe(4);
    expect(portraitDirection(200, 0)).toBe(5);
    expect(portraitDirection(-200, -200)).toBe(0);
    expect(portraitDirection(0, 200)).toBe(7);
  });
  it('holds the previous direction near sector edges', () => {
    expect(portraitDirection(200, 85, 5)).toBe(5);
    expect(portraitDirection(100, 200, 5)).toBe(8);
  });
  it('responds to mouse, ignores touch, resets for reduced motion and cleans up', () => {
    const target = new EventTarget();
    const reduced = Object.assign(new EventTarget(), { matches: false });
    const fine = Object.assign(new EventTarget(), { matches: true });
    const viewport = Object.assign(target, { matchMedia: (query: string) => query.includes('reduced') ? reduced : fine });
    const frames: number[] = [];
    const element = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) };
    const cleanup = bindPortraitTracking(element as HTMLElement, (cell) => frames.push(cell), viewport as unknown as Window);
    const move = (pointerType: string) => target.dispatchEvent(Object.assign(new Event('pointermove'), { pointerType, clientX: 300, clientY: 50 }));
    move('mouse');
    expect(frames.at(-1)).toBe(5);
    move('touch');
    expect(frames.at(-1)).toBe(5);
    reduced.matches = true;
    reduced.dispatchEvent(new Event('change'));
    expect(frames.at(-1)).toBe(4);
    move('mouse');
    expect(frames.at(-1)).toBe(4);
    cleanup();
    reduced.matches = false;
    const count = frames.length;
    move('mouse');
    reduced.dispatchEvent(new Event('change'));
    expect(frames).toHaveLength(count);
  });
  it('keeps Kali out of task agents and limits profiles to configured workspaces', () => {
    expect(LABORATORY_TEAM.map((person) => person.id)).toEqual(['celio', 'taynara', 'thaysa', 'lucas', 'rafael', 'gustavo', 'rodrigo', 'isaias']);
    expect(LABORATORY_TEAM.every((person) => person.workspacePolicy === 'configured-only' && person.instructions.length > 0)).toBe(true);
  });
});
