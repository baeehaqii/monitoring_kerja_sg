module.exports = {
  apps: [
    {
      name: 'monitoring_kerja_sg',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      cwd: '/www/wwwroot/monitoring_kerja_sg',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 3000,
      error_file: '/www/wwwroot/monitoring_kerja_sg/logs/pm2-error.log',
      out_file: '/www/wwwroot/monitoring_kerja_sg/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
}
