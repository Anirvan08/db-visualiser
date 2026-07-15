# AWS EC2 Deployment Guide for ERD Visualizer

## Prerequisites
- AWS Account with Free Tier access
- Basic knowledge of Linux commands
- Your project code ready for deployment

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. **AMI**: Amazon Linux 2 AMI (HVM) - Free Tier Eligible
3. **Instance Type**: t2.micro (Free Tier Eligible)
4. **Key Pair**: Create new or use existing
5. **Security Group**: Create new with these rules:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere (0.0.0.0/0)
   - HTTPS (443) - Anywhere (0.0.0.0/0) - Optional

### 1.2 Connect to Instance
```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

## Step 2: Install Required Software

### 2.1 Update System
```bash
sudo yum update -y
```

### 2.2 Install Node.js
```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default lts

# Verify installation
node --version
npm --version
```

### 2.3 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 2.4 Install Git (if needed)
```bash
sudo yum install git -y
```

## Step 3: Deploy Your Application

### 3.1 Upload Your Code
**Option A: Git Clone (Recommended)**
```bash
# If you have your code on GitHub
git clone https://github.com/yourusername/erd-visualizer.git
cd erd-visualizer
```

**Option B: Upload via SCP**
```bash
# From your local machine
scp -i your-key.pem -r /path/to/your/project ec2-user@your-ec2-ip:~/
```

### 3.2 Build and Deploy
```bash
# Make build script executable
chmod +x build-production.sh

# Run production build
./build-production.sh
```

### 3.3 Start Application with PM2
```bash
cd backend
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## Step 4: Configure Web Server (Optional but Recommended)

### 4.1 Install Nginx
```bash
sudo yum install nginx -y
```

### 4.2 Configure Nginx
```bash
sudo nano /etc/nginx/conf.d/erd-visualizer.conf
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.3 Start Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 5: Domain Setup (Optional)

### 5.1 Get Elastic IP
1. Go to EC2 → Elastic IPs → Allocate Elastic IP
2. Associate with your EC2 instance

### 5.2 Configure Domain (if you have one)
1. Go to Route 53 → Hosted Zones
2. Create A record pointing to your Elastic IP

## Step 6: SSL Certificate (Optional)

### 6.1 Install Certbot
```bash
sudo yum install certbot python3-certbot-nginx -y
```

### 6.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

## Step 7: Monitoring and Maintenance

### 7.1 Check Application Status
```bash
pm2 status
pm2 logs erd-visualizer
```

### 7.2 Monitor System Resources
```bash
htop
df -h
free -h
```

### 7.3 Set up CloudWatch Monitoring (Optional)
1. Go to CloudWatch → Dashboards
2. Create custom dashboard for your EC2 metrics

## Step 8: Backup Strategy

### 8.1 Database Backup
```bash
# Create backup script
nano backup-db.sh
```

Add this content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /home/ec2-user/data/erd_visualizer.db /home/ec2-user/backups/erd_visualizer_$DATE.db
find /home/ec2-user/backups -name "*.db" -mtime +7 -delete
```

### 8.2 Schedule Backup
```bash
chmod +x backup-db.sh
crontab -e
# Add: 0 2 * * * /home/ec2-user/backup-db.sh
```

## Troubleshooting

### Common Issues:

**1. Application not starting:**
```bash
pm2 logs erd-visualizer
pm2 restart erd-visualizer
```

**2. Port 80 permission denied:**
```bash
sudo setcap 'cap_net_bind_service=+ep' $(which node)
```

**3. Database permission issues:**
```bash
sudo chown -R ec2-user:ec2-user /home/ec2-user/data
```

**4. Frontend not loading:**
- Check if frontend/dist folder exists
- Verify build process completed successfully
- Check PM2 logs for errors

### Useful Commands:

```bash
# Check application status
pm2 status

# View logs
pm2 logs erd-visualizer

# Restart application
pm2 restart erd-visualizer

# Stop application
pm2 stop erd-visualizer

# Check system resources
htop
df -h
free -h

# Check network connections
netstat -tlnp | grep :80
```

## Cost Optimization

### Free Tier Limits:
- **EC2**: 750 hours/month of t2.micro
- **EBS**: 30 GB storage
- **Data Transfer**: 1 GB/month out

### After Free Tier:
- **EC2 t2.micro**: ~$8.50/month
- **EBS 8GB**: ~$0.80/month
- **Data Transfer**: $0.09/GB
- **Total**: ~$9-12/month

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo yum update -y
   ```

2. **Configure firewall:**
   ```bash
   sudo systemctl enable firewalld
   sudo systemctl start firewalld
   ```

3. **Regular backups:**
   - Database backups
   - Code backups
   - Configuration backups

4. **Monitor logs:**
   ```bash
   pm2 logs erd-visualizer --lines 100
   ```

## Next Steps

1. **Set up CI/CD** with GitHub Actions
2. **Add monitoring** with CloudWatch
3. **Implement auto-scaling** if needed
4. **Add load balancer** for high availability
5. **Migrate to RDS** for database reliability

Your ERD Visualizer is now deployed and running on AWS EC2! 🎉
