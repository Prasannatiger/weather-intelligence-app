import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  root: '.',
  plugins: [cloudflare()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
