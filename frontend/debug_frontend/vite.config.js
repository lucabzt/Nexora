import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Buffer } from 'buffer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`[Proxy] Redirecting: ${req.method} ${req.url}`);
          });

          proxy.on('proxyRes', (proxyRes, req) => {
            const chunks = [];

            proxyRes.on('data', (chunk) => {
              chunks.push(chunk);
            });

            proxyRes.on('end', () => {
              const body = Buffer.concat(chunks).toString('utf8');

              if (body.trim().length > 0) {
                console.log(`[Proxy] Response for ${req.method} ${req.url}:`);
                try {
                  const parsed = JSON.parse(body);
                  console.log(JSON.stringify(parsed, null, 2));
                } catch {
                  console.log(body); // Fallback if not JSON
                }
              }
            });
          });

          proxy.on('error', (err, req, res) => {
            console.error(`[Proxy] Error on ${req.method} ${req.url}: ${err.message}`);
            if (res && !res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Proxy error: ' + err.message);
            } else if (res) {
              res.end();
            }
          });
        },
      },
      // ✅ WebSocket-Pfad separat (wichtig: ws: true!)
      '/api/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, socket) => {
            console.error(`[WS Proxy] Error on ${req.url}: ${err.message}`);
            if (socket && socket.writable) {
              socket.end('HTTP/1.1 500 WebSocket Proxy Error\r\n');
            }
          });

          proxy.on('open', (proxySocket) => {
            console.log('[WS Proxy] Connection opened');
          });

          proxy.on('close', (res, socket, head) => {
            console.log('[WS Proxy] Connection closed');
          });
        },
      },
    },
  },
  build: {
    sourcemap: true, // Explicitly enable sourcemaps for builds
  }
})
