export default {
  apps: [
    {
      name: "swipe-interview-api",
      script: "python3",
      args: "-m gunicorn --bind 0.0.0.0:7078 --workers 4 --timeout 120 wsgi:app",
      cwd: "/root/assignment-101/backend",
      interpreter: "none",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        FLASK_ENV: "production",
        FLASK_DEBUG: "False",
        PORT: 7078,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
