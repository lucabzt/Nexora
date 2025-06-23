import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Buffer } from 'buffer';
//import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss()//,
     // visualizer({
     //   template: 'treemap', // or sunburst
     //   open: true,
     //   gzipSize: true,
     //   brotliSize: true,
     //   filename: 'stats.html', // analysis file
     // }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8127',
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

          /*proxy.on('proxyRes', (proxyRes, req) => {
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
          */

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
    /*rollupOptions: {
      output: {
        manualChunks(id) {
          // This creates a separate chunk for each node module, which is useful for debugging bundle sizes.
          if (id.includes('node_modules')) {
            const packageNameMatch = id.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
            if (packageNameMatch) {
              const packageName = packageNameMatch[1];
              // Create a chunk for each package.
              // e.g. @mantine/core -> vendor-mantine-core
              return `vendor-${packageName.replace('@', '').replace('/', '-')}`;
            }
          }
        },
        //manualChunks: {
        //  plotly: ['react-plotly.js', 'plotly.js'],
        //  stringToReactComponent: ['string-to-react-component'],
        //},
      },
    },*/
  }
})
