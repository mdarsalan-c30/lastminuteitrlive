module.exports = {
  apps: [
    {
      name: "frontend",
      script: "npm",
      args: "start",
      max_memory_restart: "800M",
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
