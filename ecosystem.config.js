module.exports = {
  apps: [
    {
      name: 'tasksg',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      cwd: '/www/wwwroot/task-sg.findy.my.id',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 3000,
      error_file: '/www/wwwroot/task-sg.findy.my.id/logs/pm2-error.log',
      out_file: '/www/wwwroot/task-sg.findy.my.id/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
}
