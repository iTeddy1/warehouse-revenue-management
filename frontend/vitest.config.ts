import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.ts'],
    silent: false,
    onConsoleLog(log: string, type: 'stdout' | 'stderr'): false | void {
      if (log.includes('Store does not have a valid reducer')) {
        return false
      }
      if (log.includes('HTMLFormElement.prototype.requestSubmit')) {
        return false
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
