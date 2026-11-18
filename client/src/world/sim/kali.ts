import { TILE, COL_W } from '../constants';
import type { BuildingLayout } from '../layout/building';
import { PathFinder } from '../path/astar';

/** Local pet: deterministic ambient movement, no session, task or network activity. */
export class Kali {
  readonly name = 'Kali';
  x = 0;
  y = 0;
  moving = false;
  private cols = -1;
  private path: number[] = [];
  private destination = 0;

  update(building: BuildingLayout, dt: number): void {
    const origin = building.cols * COL_W;
    if (this.cols !== building.cols) {
      this.cols = building.cols;
      this.x = (origin + 2.5) * TILE;
      this.y = 14.5 * TILE;
      this.path = [];
    }
    const elapsed = Math.max(0, Math.min(dt, 0.1));
    this.moving = false;
    if (!this.path.length) {
      const destinations = [[3, 10], [18, 14], [29, 9], [29, 24], [20, 43], [13, 46], [10, 25], [2, 14]];
      const next = destinations[this.destination++ % destinations.length];
      new PathFinder(building.grid).find(Math.floor(this.x / TILE), Math.floor(this.y / TILE), origin + next[0], next[1], this.path);
      if (!this.path.length) return;
    }
    const tx = (this.path[0] + 0.5) * TILE;
    const ty = (this.path[1] + 0.5) * TILE;
    const dx = tx - this.x, dy = ty - this.y;
    const distance = Math.hypot(dx, dy);
    const step = elapsed * TILE * 1.8;
    this.moving = true;
    if (distance <= step) {
      this.x = tx; this.y = ty; this.path.splice(0, 2);
    } else { this.x += dx / distance * step; this.y += dy / distance * step; }
  }
}
