module.exports = {
  apps: [
    {
      name: 'task-sg',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      cwd: '/www/wwwroot/task-sg.findy.my.id',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
}
