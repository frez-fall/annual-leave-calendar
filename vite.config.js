import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Development mode: serve test page
  if (command === 'serve') {
    return {
      plugins: [react()],
      server: {
        port: 5173,
        open: true,
      },
    };
  }
  
  // Dev mode (npm run dev): also configure server
  const config = {
    plugins: [react()],
  };
  
  // Add server config for dev mode (when not building)
  if (command !== 'build') {
    config.server = {
      port: 5173,
      strictPort: false, // Allow fallback to next available port if 5173 is taken
    };
    // Use src/main.tsx as entry point for dev mode
    config.root = '.';
  }
  
  // Build mode: library build for Webflow
  if (command === 'build') {
    config.build = {
      lib: {
        entry: './calendar-component.jsx',
        name: 'WebflowCalendar',
        fileName: 'calendar-component',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    };
  }
  
  return config;
});

