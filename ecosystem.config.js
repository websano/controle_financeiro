module.exports = {
  apps: [
    {
      name: "controle-financeiro",
      script: "npm",
      args: "start -- -p 3333",
      cwd: "/var/www/controle_financeiro",
      env: {
        NODE_ENV: "production",
        PORT: "3333",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
