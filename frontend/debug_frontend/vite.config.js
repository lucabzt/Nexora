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
        
        ws: true,


        configure: (proxy, options) => {

            
          proxy.on('open', (proxySocket) => {
            console.log('[WS Proxy] Connection opened');
          });

          proxy.on('close', (res, socket, head) => {
            console.log('[WS Proxy] Connection closed');
          });



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
    },
  },
  build: {
    sourcemap: false, // Explicitly enable sourcemaps for builds
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('plotly.js')) return 'plotly';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('chart.js')) return 'chartjs';
            if (id.includes('@mantine')) return '@mantine';
            if (id.includes('react-icons')) return 'react-icons';
            if (id.includes('@tabler/icons-react')) return 'tabler-icons';
            if (id.includes('react') || id.includes('react-dom')) return 'react';
            return 'vendor'; // All other node_modules
          }
        },
      },
    },
  }
})
