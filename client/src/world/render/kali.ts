import type { Kali } from '../sim/kali';

/** The same little black cat is used in the room and in her interactive portrait. */
export function drawKaliSprite(ctx: CanvasRenderingContext2D, options: {
  x: number; y: number; scale?: number; time?: number; moving?: boolean;
  lookX?: number; lookY?: number; reacting?: boolean;
}): void {
  const { x, y, scale = 1, time = 0, moving = false, lookX = 0, lookY = 0, reacting = false } = options;
  const stride = moving ? Math.floor(time / 110) % 4 : 0;
  const step = moving ? [0, 1, 0, -1][stride] : 0;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  const pixel = (color: string, px: number, py: number, w: number, h: number) => {
    ctx.fillStyle = color; ctx.fillRect(px, py, w, h);
  };
  // A hooked tail, arched back, haunch and four distinct paws keep the silhouette feline.
  pixel('#070b12', 9, -16, 3, 12);
  pixel('#070b12', 10, -19, 5, 3);
  pixel('#070b12', 14, -18, 2, 4);
  pixel('#253040', 10, -16, 1, 8);
  pixel('#070b12', -6, -11, 16, 8);
  pixel('#101722', -4, -13, 11, 9);
  pixel('#1d2734', 3, -12, 5, 6);
  pixel('#070b12', -5 + step, -5, 3, 5);
  pixel('#070b12', 5 - step, -5, 3, 5);
  pixel('#121b27', -1 - step, -4, 2, 4);
  pixel('#121b27', 3 + step, -4, 2, 4);
  pixel('#344052', -5 + step, -1, 2, 1);
  pixel('#344052', 5 - step, -1, 2, 1);
  // Tapered ears and wide cheek tufts, with cool highlights on black fur.
  pixel('#070b12', -10, -20, 3, 7);
  pixel('#070b12', -1, -20, 3, 7);
  pixel('#070b12', -9, -18, 10, 10);
  pixel('#070b12', -11, -15, 14, 5);
  pixel('#192330', -8, -17, 8, 7);
  pixel('#573c55', -9, -18, 1, 3);
  pixel('#573c55', 0, -18, 1, 3);
  pixel('#2c3746', -7, -17, 5, 1);
  const ex = Math.sign(lookX), ey = Math.sign(lookY);
  pixel('#eab82c', -9, -14 + ey, 4, reacting ? 1 : 3);
  pixel('#eab82c', -3, -14 + ey, 4, reacting ? 1 : 3);
  if (!reacting) {
    pixel('#ffe56b', -8, -14 + ey, 2, 1);
    pixel('#ffe56b', -2, -14 + ey, 2, 1);
    pixel('#070b12', -7 + ex, -14 + ey, 1, 3);
    pixel('#070b12', -1 + ex, -14 + ey, 1, 3);
  }
  pixel('#9a7484', -5, -10, 2, 1);
  pixel('#536071', -6, -8, 4, 1);
  pixel('#a0a9b5', -13, -11, 4, 1);
  pixel('#7c8999', -12, -9, 3, 1);
  pixel('#a0a9b5', 1, -11, 4, 1);
  pixel('#7c8999', 1, -9, 3, 1);
  ctx.restore();
}

export function drawKali(ctx: CanvasRenderingContext2D, cat: Kali, now: number): void {
  const x = Math.round(cat.x), y = Math.round(cat.y);
  ctx.save();
  ctx.fillStyle = '#17253255';
  ctx.beginPath(); ctx.ellipse(x + 1, y, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  drawKaliSprite(ctx, { x, y, time: now, moving: cat.moving });
  ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = '#172532'; ctx.fillRect(x - 10, y - 31, 20, 8);
  ctx.fillStyle = '#ffe56b'; ctx.fillText(cat.name, x, y - 25);
  ctx.restore();
}
