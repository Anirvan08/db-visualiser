{
  "apps": [
    {
      "name": "erd-visualizer",
      "script": "src/app.js",
      "cwd": "/home/ec2-user/erd-visualizer/backend",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production",
        "PORT": 80
      },
      "log_file": "/home/ec2-user/logs/erd-visualizer.log",
      "out_file": "/home/ec2-user/logs/erd-visualizer-out.log",
      "error_file": "/home/ec2-user/logs/erd-visualizer-error.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "merge_logs": true,
      "max_memory_restart": "500M",
      "restart_delay": 4000,
      "max_restarts": 10,
      "min_uptime": "10s"
    }
  ]
}
