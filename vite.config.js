import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_TARGET || 'http://localhost:3000';
  return defineConfig({
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      proxy: {
        // '/api': {
        //   target,
        //   changeOrigin: true,
        //   rewrite: (p) => p.replace(/^\/api/, ''),
        // },
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    define: {
      global: 'window', // global 참조를 window로 매핑
    },
  });
};
