import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['integrations/deskcomm/files/lib/laboratory/*.test.ts'], environment: 'node' } });
