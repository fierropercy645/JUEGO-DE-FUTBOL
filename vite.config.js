import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
