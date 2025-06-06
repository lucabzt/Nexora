import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
  ],
  server: {
    port: 3000, // Or your preferred port
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Your FastAPI backend
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[Vite Proxy] Sending request to: ${options.target.href}${req.url}`);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Error:', err);
            if (res && !res.headersSent) { // Check if headers are not already sent
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Proxy error: ' + err.message);
            } else if (res) {
                res.end(); // Ensure the response is ended if headers were sent
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[Vite Proxy] Response from: ${options.target.href}${req.url}`);
            console.log('Response Headers:', JSON.stringify(proxyRes.headers, null, 2));
            console.log('Response Body:', JSON.stringify(proxyRes.body, null, 2));
          });
          proxy.on('open', (proxySocket) => {
            console.log('[Vite Proxy] Connection opened');
          });
          proxy.on('close', (proxySocket) => {
            console.log('[Vite Proxy] Connection closed');
          });
        }
      }
    }
  }
})
