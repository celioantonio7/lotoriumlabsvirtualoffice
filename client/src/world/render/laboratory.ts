import { tr } from '../../../../shared/i18n';
import { COL_W, TILE } from '../constants';
import { LAB_ZONES } from '../layout/laboratory';

export function drawLaboratory(ctx: CanvasRenderingContext2D, cols: number, now: number): void {
  const ox = cols * COL_W * TILE;
  ctx.save();
  // Stone coping, deep water, tile seams and animated reflections distinguish a pool from a deck.
  const x = ox + 22 * TILE, y = 3 * TILE, w = 8 * TILE, h = 6 * TILE;
  ctx.fillStyle = '#f4e7c8'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#167d9e'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#28b7ce'; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  ctx.fillStyle = '#62d3df';
  for (let ry = 8; ry < h - 4; ry += 13) {
    for (let rx = 5; rx < w - 10; rx += 25) {
      const drift = Math.sin(now / 1300 + ry + rx) * 3;
      ctx.fillRect(Math.round(x + rx + drift), y + ry, 13, 1);
      ctx.fillRect(Math.round(x + rx + drift + 3), y + ry + 2, 7, 1);
    }
  }
  ctx.fillStyle = '#d4eced';
  for (const lx of [x + 12, x + 23]) ctx.fillRect(lx, y - 7, 2, 20);
  for (let ly = 0; ly < 12; ly += 4) ctx.fillRect(x + 12, y + ly, 13, 1);
  ctx.font = 'bold 6px monospace'; ctx.textBaseline = 'top';
  for (const z of LAB_ZONES) {
    const tx = ox + (z.x + 0.5) * TILE, ty = (z.y + 0.4) * TILE;
    const label = tr(z.label);
    ctx.fillStyle = '#293d41'; ctx.fillRect(tx - 2, ty - 2, ctx.measureText(label).width + 4, 10);
    ctx.fillStyle = '#f4ead2'; ctx.fillText(label, tx, ty);
  }
  ctx.restore();
}

