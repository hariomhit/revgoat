import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './server/api.js';

function revgoatBackendPlugin() {
  return {
    name: 'revgoat-backend-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          return handleApiRequest(req, res, next);
        }
        next();
      });
    }
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), revgoatBackendPlugin()],
  server: {
    host: true,
    port: 3000
  },
  build: {
    target: 'es2020',
    cssMinify: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
