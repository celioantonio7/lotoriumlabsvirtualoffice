import { afterEach, expect, it, vi } from 'vitest';
import { loadWorldAssets, worldAssetUrl } from './assets';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it('resolves image paths under the deployed base and preserves root deployments', () => {
  expect(worldAssetUrl('/brand/logo.png', '/laboratory-office/')).toBe('/laboratory-office/assets/brand/logo.png');
  expect(worldAssetUrl('brand/logo.png', '/')).toBe('/assets/brand/logo.png');
});

it('loads the manifest under the configured deployment base', async () => {
  vi.stubEnv('BASE_URL', '/laboratory-office/');
  const fetcher = vi.fn(async () => new Response('{}', { headers: { 'content-type': 'application/json' } }));
  vi.stubGlobal('fetch', fetcher);
  await loadWorldAssets();
  expect(fetcher).toHaveBeenCalledWith('/laboratory-office/assets/manifest.json', expect.any(Object));
});
