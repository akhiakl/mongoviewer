import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      exclude: [
        //shadcn generated files
        'src/renderer/components/ui/**',
      ],
      thresholds: {
        perFile: false,
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
  },
});
