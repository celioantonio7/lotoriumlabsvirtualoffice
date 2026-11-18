import { CAMPUS_TREES, LAB_HEIGHT } from './laboratory';
import { layoutExterior } from './exterior';
import { expect, it } from 'vitest';
import { assembleBuilding } from './building';
import { COL_W, CORRIDOR_Y, TILE } from '../constants';
import { Kali } from '../sim/kali';

it('connects all laboratory zones and routes around the swimming pool', () => {
  const b = assembleBuilding(3, []);
  expect(b.core.some(a => a.id === 'lab:pool')).toBe(true);
  const reach = b.grid.reachableFrom(3 * COL_W - 2, CORRIDOR_Y + 2);
  for (const a of b.core.filter(a => a.id.startsWith('lab:'))) {
    for (const s of a.spots) expect(reach[s.ty * b.grid.w + s.tx], s.id).toBe(1);
  }
  expect(b.grid.walkable(3 * COL_W + 23, 5)).toBe(false);
  expect(b.grid.walkable(3 * COL_W + 19, 5)).toBe(true);
});

it('Kali roams without crossing blocked furniture or water', () => {
  const b = assembleBuilding(3, []);
  const cat = new Kali();
  const positions = new Set<string>();
  for (let i = 0; i < 6000; i++) {
    cat.update(b, 1 / 30);
    expect(b.grid.walkable(Math.floor(cat.x / TILE), Math.floor(cat.y / TILE))).toBe(true);
    positions.add(`${Math.floor(cat.x / TILE)},${Math.floor(cat.y / TILE)}`);
  }
  expect(positions.size).toBeGreaterThan(20);
  expect(cat.name).toBe('Kali');
});


it('adds connected southern plots and renders every collision tree beyond the old boundary', () => {
  const b = assembleBuilding(3, []);
  expect(b.grid.h).toBe(LAB_HEIGHT);
  const reach = b.grid.reachableFrom(3 * COL_W + 13, 30);
  let newLand = 0;
  for (let y = 29; y < LAB_HEIGHT; y++) for (let x = 3 * COL_W; x < b.grid.w; x++) newLand += reach[y * b.grid.w + x]!;
  expect(newLand).toBeGreaterThan(600);
  const exterior = layoutExterior(3);
  for (const tree of CAMPUS_TREES) {
    expect(b.grid.walkable(3 * COL_W + tree.x, tree.y)).toBe(false);
    expect(exterior.props.some(p => p.kind === tree.kind && p.x === (3 * COL_W + tree.x + 0.5) * TILE && p.y === (tree.y + 1) * TILE)).toBe(true);
  }
  expect(exterior.streetY / TILE).toBeGreaterThanOrEqual(LAB_HEIGHT);
});

it('keeps Kali moving through the expanded campus without a task or session', () => {
 const b = assembleBuilding(3, []);
 const cat = new Kali();
 let unchanged = 0;
 let deepest = 0;
 for (let i = 0; i < 24000; i++) {
  const before = [cat.x, cat.y];
  cat.update(b, 1 / 30);
  if (cat.x === before[0] && cat.y === before[1]) unchanged++;
  deepest = Math.max(deepest, cat.y / TILE);
  expect(Number.isFinite(cat.x) && Number.isFinite(cat.y)).toBe(true);
 }
 expect(unchanged).toBeLessThan(150);
 expect(deepest).toBeGreaterThan(40);
});
