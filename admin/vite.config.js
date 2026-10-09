import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite dev server "ẩn proxy" — khi dev, browser chỉ thấy
 * http://localhost:3013/api/... và http://localhost:3013/uploads/...
 * Vite sẽ forward sang backend thật.
 *
 * Target derive từ VITE_BACKEND_ORIGIN (ưu tiên) hoặc VITE_API_URL.
 *   VITE_BACKEND_ORIGIN=https://sunnydemo.site        → target gốc
 *   VITE_API_URL=https://sunnydemo.site/api          → suy ra target
 *   (không set)                                       → http://localhost:3010
 *
 * Production: `npm run build` không chạy dev server, proxy bị bỏ qua.
 * Ảnh / API trong production đi thẳng tới URL trong .env.production.
 */
const backendOriginFromEnv = (env) => {
  if (env.VITE_BACKEND_ORIGIN) {
    return env.VITE_BACKEND_ORIGIN.replace(/\/$/, '');
  }
  const raw = env.VITE_API_URL || 'http://localhost:3010/api';
  return raw.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendOrigin = backendOriginFromEnv(env);

  return {
    plugins: [react()],
    server: {
      port: 3013,
      strictPort: true,
      host: true,
      proxy: {
        // /uploads → backend (ảnh upload cùng origin, tránh CORS / helmet)
        '/uploads': {
          target: backendOrigin,
          changeOrigin: true,
        },
        // /api → backend (ẩn URL production khỏi Network tab khi dev)
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
