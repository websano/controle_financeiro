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
        DATABASE_URL: "postgresql://postgres:SENHA_FORTE@localhost:5432/controle_financeiro",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
