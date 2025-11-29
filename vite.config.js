import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["*"],  // ✅ Allow the host
    host: true,  // ✅ Allow external access if needed
    port: 5155   // ✅ Set your port (change if needed)
  }
});