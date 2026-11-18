import { COL_W } from '../constants';
import { AreaBuilder } from './builder';
import type { AreaLayout } from './types';

export const LAB_WIDTH = 32;
export const LAB_HEIGHT = 49;
/** Trunks are also collision cells; the same positions feed the renderer. */
export const CAMPUS_TREES = [
  ...[2, 5, 8, 11].flatMap((x, i) => [33, 37, 42, 46].map(y => ({ x, y: y + (i % 2), kind: i % 3 === 0 ? 'pine' as const : 'tree' as const }))),
  ...[23, 27, 30].flatMap(x => [32, 46].map(y => ({ x, y, kind: 'tree' as const }))),
];
export const LAB_ZONES = [
  { id: 'sales', label: 'Vendas', x: 1, y: 1, w: 9, h: 10 },
  { id: 'design', label: 'Design', x: 11, y: 1, w: 9, h: 10 },
  { id: 'pool', label: 'Piscina', x: 21, y: 1, w: 10, h: 10 },
  { id: 'development', label: 'Happycash', x: 1, y: 18, w: 9, h: 10 },
  { id: 'meeting', label: 'Support HappyCash', x: 11, y: 18, w: 9, h: 10 },
  { id: 'garden', label: 'Jardim · Convivência', x: 21, y: 18, w: 10, h: 10 },
  { id: 'grove', label: 'Bosque', x: 1, y: 31, w: 11, h: 17 },
  { id: 'plaza', label: 'Praça', x: 14, y: 34, w: 7, h: 10 },
  { id: 'expansion', label: 'Terreno de expansão', x: 23, y: 35, w: 8, h: 9 },
] as const;

/** Permanent local scenery: never provider agents or upstream work statistics. */
export function laboratoryAreas(cols: number): AreaLayout[] {
  const x0 = cols * COL_W;
  const path = new AreaBuilder('lab:path', 'corridor', { x: x0, y: 0, w: LAB_WIDTH, h: LAB_HEIGHT });
  path.floor('grass', 0, 0, LAB_WIDTH, LAB_HEIGHT, 880);
  path.floor('sidewalk', 0, 12, LAB_WIDTH, 5, 881).walk(0, 11, LAB_WIDTH, 7);
  path.walk(0, 0, LAB_WIDTH, LAB_HEIGHT);
  path.floor('sidewalk', 12, 17, 2, 32, 882);
  path.floor('sidewalk', 0, 29, LAB_WIDTH, 2, 883);
  path.floor('sidewalk', 12, 39, 20, 2, 884);
  for (const tree of CAMPUS_TREES) path.block(tree.x, tree.y, 1, 1);
  return [path.build(), ...LAB_ZONES.map((z, i) => {
    const b = new AreaBuilder(`lab:${z.id}`, 'lounge', { x: x0 + z.x, y: z.y, w: z.w, h: z.h });
    b.floor(['garden', 'grove', 'expansion'].includes(z.id) ? 'grass' : z.id === 'plaza' ? 'sidewalk' : z.id === 'pool' ? 'sidewalk' : 'wood', 0, 0, z.w, z.h, 890 + i);
    b.walk(0, 0, z.w, z.h);
    if (z.id === 'grove' || z.id === 'expansion') {
      // Keep grass plots open for exploration; trunks are blocked after all areas paint.
    } else if (z.id === 'plaza') {
      b.seat('bench', 'bench', 1, 3, 'down');
      b.seat('bench', 'bench', 4, 7, 'up');
      b.furn('plant_small', 5, 2, 'flower');
      b.spot('talk', 3, 5, 'right', { group: 'lab:plaza' });
      b.spot('talk', 4, 5, 'left', { group: 'lab:plaza' });
    } else if (z.id === 'pool') {
      b.block(1, 2, 8, 6);
      b.spot('talk', 0, 8, 'right', { group: 'lab:pool' });
      b.spot('talk', 1, 8, 'left', { group: 'lab:pool' });
    } else if (z.id === 'garden') {
      for (const x of [1, 7]) {
        b.furn('plant_tall', x, 2, 'palm');
        b.seat('bench', 'bench', x, 6, 'down');
      }
      b.furn('plant_small', 4, 3, 'flower');
    } else if (z.id === 'meeting') {
      b.furn('meeting_table', 3, 3);
      b.seat('stool', 'office_chair', 3, 5, 'up');
      b.seat('stool', 'office_chair', 5, 5, 'up');
      b.furn('plant_tall', 7, 2, 'monstera');
    } else {
      for (const x of [1, 5]) {
        b.furn('desk', x, 3, 'wood');
        // Visual ambient residents use lounge spots; a desk does not imply active work.
        b.seat('armchair', 'office_chair', x, 4, 'up');
      }
      b.furn('plant_tall', 7, 7, 'monstera');
    }
    return b.build();
  })];
}
