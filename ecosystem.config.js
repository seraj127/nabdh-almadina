// ═══════════════════════════════════════════════════════════
// City Pulse — نبض المدينة | PM2 Ecosystem Config
// For bare-metal VPS deployment with process management
// ═══════════════════════════════════════════════════════════

module.exports = {
  apps: [
    {
      name: 'citypulse-main',
      script: 'server.js',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:./db/custom.db',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/main-error.log',
      out_file: './logs/main-out.log',
      time: true,
    },
    {
      name: 'citypulse-sync',
      script: 'index.ts',
      cwd: '/app/mini-services/sync-service',
      env: {
        PORT: 3004,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      error_file: './logs/sync-error.log',
      out_file: './logs/sync-out.log',
      time: true,
    },
    {
      name: 'citypulse-download',
      script: 'index.ts',
      cwd: '/app/mini-services/download-service',
      env: {
        PORT: 3031,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      error_file: './logs/download-error.log',
      out_file: './logs/download-out.log',
      time: true,
    },
  ],
};
