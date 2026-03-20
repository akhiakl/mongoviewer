import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        clearMocks: true,
        restoreMocks: true,
        coverage: {
            thresholds: {
                perFile: false,
                branches: 85,
                functions: 85,
                lines: 85,
                statements: 85,
            }
        }
    },
});