import { describe, expect, it } from 'vitest';
import { drawKaliSprite } from './kali';

function pixels(options: Partial<Parameters<typeof drawKaliSprite>[1]> = {}) {
  const buffer = new Map<string, string>();
  const ctx = {
    fillStyle: '', save() {}, restore() {}, translate() {}, scale() {},
    fillRect(x: number, y: number, w: number, h: number) {
      for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) buffer.set(`${px},${py}`, this.fillStyle);
    },
  };
  drawKaliSprite(ctx as unknown as CanvasRenderingContext2D, { x: 0, y: 0, ...options });
  return buffer;
}

describe('Kali pixel art', () => {
  it('has black fur, two golden eyes, pointed ears and a separate raised tail', () => {
    const image = pixels();
    expect(image.get('-10,-20')).toBe('#070b12');
    expect(image.get('1,-20')).toBe('#070b12');
    expect(image.get('14,-18')).toBe('#070b12');
    expect(image.get('-9,-13')).toBe('#eab82c');
    expect(image.get('0,-13')).toBe('#eab82c');
    expect([...image.values()].filter(color => ['#070b12', '#101722', '#192330', '#121b27'].includes(color)).length).toBeGreaterThan(image.size * 0.65);
  });
  it('moves her paws while walking and aims both pupils at the pointer', () => {
    expect(pixels({ moving: true, time: 0 })).not.toEqual(pixels({ moving: true, time: 110 }));
    expect(pixels({ lookX: 1 }).get('-6,-13')).toBe('#070b12');
    expect(pixels({ lookX: -1 }).get('-8,-13')).toBe('#070b12');
    expect(pixels({ reacting: true }).get('-9,-13')).not.toBe('#eab82c');
  });
});
