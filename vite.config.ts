import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Ensure source maps are generated
  build: {
    sourcemap: true,
    // Ensure _redirects is copied to build output
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  server: {
    // Add CORS headers to allow mailto links
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; manifest-src 'self'",
      'Permissions-Policy': 'interest-cohort=()'
    }
  }
});