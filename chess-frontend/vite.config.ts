import { createLogger } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const logger = createLogger();
const originalError = logger.error;
logger.error = (msg, options) => {
  if (msg.includes('http proxy error') || msg.includes('ECONNREFUSED')) {
    return;
  }
  originalError(msg, options);
};

const suppressProxyError = (proxy: any) => {
  proxy.on('error', (err: any, _req: any, res: any) => {
    const isConnRefused =
      err.code === 'ECONNREFUSED' ||
      err.errors?.some((e: any) => e.code === 'ECONNREFUSED') ||
      err.message?.includes('ECONNREFUSED');

    if (isConnRefused && res && !res.headersSent && typeof res.writeHead === 'function') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend offline (mocking/testing)' }));
    }
  });
};

export default defineConfig({
  customLogger: logger,
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        configure: suppressProxyError,
      },
      '/actuator': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        configure: suppressProxyError,
      },
      '/ws-chess': {
        target: 'http://127.0.0.1:8080',
        ws: true,
        changeOrigin: true,
        configure: suppressProxyError,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
  ssr: {
    noExternal: ['react-router', 'react-router-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    pool: 'forks',
    isolate: true,
    server: {
      deps: {
        inline: ['react-router', 'react-router-dom'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'src/test/**',
        'e2e/**',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/**',
      ],
    },
  },
});
