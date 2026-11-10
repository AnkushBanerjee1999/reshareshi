import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if three is installed locally in node_modules
const hasLocalThree = fs.existsSync(path.resolve(__dirname, 'node_modules/three'));

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    // Prevent Vite from throwing during dependency pre-bundling if three is not installed yet
    exclude: hasLocalThree ? [] : ['three']
  },
  plugins: [
    // If three is not yet installed in node_modules, resolve it to CDN so vite dev works seamlessly
    !hasLocalThree && {
      name: 'three-cdn-fallback',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'three') {
          return {
            id: 'https://unpkg.com/three@0.160.0/build/three.module.js',
            external: true
          };
        }
        if (id.startsWith('three/addons/')) {
          const sub = id.replace('three/addons/', '');
          return {
            id: `https://unpkg.com/three@0.160.0/examples/jsm/${sub}`,
            external: true
          };
        }
        return null;
      }
    }
  ].filter(Boolean)
});

