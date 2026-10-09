import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy target derive từ VITE_API_URL (trong .env / .env.development / .env.production).
// Ví dụ: VITE_API_URL=https://sunnydemo.site/api  →  target = https://sunnydemo.site
//        VITE_API_URL=http://localhost:3010/api    →  target = http://localhost:3010
const backendOriginFromEnv = (env) => {
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
        // /api → backend
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
