# Fenix Backend Deployment Guide - 1000-3000 Concurrent Users

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway Frontend (React)                  │
│                   (Static files + admin UI)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ API Calls
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Reverse Proxy / Load Balancer             │
│              (Nginx or Cloud Load Balancer)                  │
│            - SSL/TLS termination                             │
│            - Connection pooling                              │
│            - Rate limiting                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
┌───────▼──┐┌──────▼───┐┌────▼────┐
│ Backend  ││ Backend  ││ Backend  │
│ Server 1 ││ Server 2 ││ Server 3 │
│ (Node.js)││ (Node.js)││ (Node.js)│
│Port 3001 ││Port 3001 ││Port 3001 │
└───────┬──┘└──────┬───┘└────┬─────┘
        │         │         │
        └────┬────┴────┬────┘
             │        │
      ┌──────▼────────▼──────────┐
      │  PostgreSQL Database     │
      │  (Railway or VPS)        │
      │  Connection Pool: 50max  │
      └──────────────────────────┘

Wasabi Storage ← (Video CDN URLs)
```

## Recommended Server Specifications

### For 1000-3000 Concurrent Users:

**Single Backend Server:**
- **CPU**: 8-16 cores
- **RAM**: 16-32 GB
- **Storage**: 100+ GB SSD
- **Network**: 100+ Mbps

**Setup Options:**
1. **DigitalOcean Droplet** ($144-288/month)
   - 16GB RAM, 8 vCPU
   - Ubuntu 22.04 LTS
   
2. **AWS EC2** (t3.2xlarge or c5.4xlarge)
   - Similar specs
   - Auto-scaling support
   
3. **Linode** ($96-192/month)
   - 16GB RAM, 8 vCPU
   - Easy deployment

4. **Hetzner** (€60-100/month)
   - Best value for specs
   - Excellent uptime

## Setup: Separate Backend Server

### Step 1: Server Provisioning

Choose your provider and:
1. Create a new Linux server (Ubuntu 22.04 LTS recommended)
2. Configure SSH key authentication
3. Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3001 (App)

### Step 2: Install Dependencies

```bash
# SSH into server
ssh root@your-backend-server.com

# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install pm2 (process manager)
npm install -g pm2

# Install nginx (load balancer/reverse proxy)
apt install -y nginx

# Install SSL certificates
apt install -y certbot python3-certbot-nginx
```

### Step 3: Prepare Application

```bash
# Clone or upload your Fenix repository
cd /opt
git clone https://github.com/your-repo/fenix.git fenix-backend
cd fenix-backend

# Install dependencies
npm install

# Build application
npm run build
```

### Step 4: Environment Configuration

Create `.env.production` on the server:

```bash
# Backend Configuration
NODE_ENV=production
PORT=3001
CLUSTER_WORKERS=8

# Database (use Railway or hosted PostgreSQL)
DATABASE_URL=postgres://user:pass@db-host:5432/fenix

# Connection Pool
DB_POOL_MAX=50
DB_POOL_MIN=10

# JWT Secret (IMPORTANT: Different from development)
JWT_SECRET=your-production-jwt-secret-here

# CDN Configuration
WASABI_ACCESS_KEY_ID=your-wasabi-key
WASABI_SECRET_ACCESS_KEY=your-wasabi-secret
WASABI_BUCKET_NAME=fenix-videos
WASABI_REGION=us-east-1

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Step 5: Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/fenix`:

```nginx
upstream fenix_backend {
    least_conn;
    
    # If running multiple backend instances on same server
    server 127.0.0.1:3001 max_fails=2 fail_timeout=10s weight=1;
    # server 127.0.0.1:3002 max_fails=2 fail_timeout=10s weight=1;
    # server 127.0.0.1:3003 max_fails=2 fail_timeout=10s weight=1;
    
    # Health check
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name fenix-api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name fenix-api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/fenix-api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fenix-api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Performance
    client_max_body_size 100M;
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 24 4k;

    # Logging
    access_log /var/log/nginx/fenix-access.log;
    error_log /var/log/nginx/fenix-error.log warn;

    # Health check endpoint
    location /health {
        proxy_pass http://fenix_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        access_log off;
    }

    # API Proxy
    location / {
        proxy_pass http://fenix_backend;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Connection
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 24 4k;
        
        # Keep-alive
        keepalive_timeout 60;
    }

    # Streaming endpoint - longer timeout for video uploads
    location /api/stream {
        proxy_pass http://fenix_backend;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Migration endpoint - very long timeout for large migrations
    location /api/migrate {
        proxy_pass http://fenix_backend;
        client_max_body_size 10G;
        proxy_read_timeout 1800s;
        proxy_send_timeout 1800s;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/fenix /etc/nginx/sites-enabled/fenix
nginx -t
systemctl restart nginx
```

### Step 6: Setup SSL Certificate

```bash
certbot certonly --nginx -d fenix-api.yourdomain.com

# Auto-renew
systemctl enable certbot.timer
systemctl start certbot.timer
```

### Step 7: Start Backend with PM2

Create `/opt/fenix-backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "fenix-backend",
      script: "./dist/index.cjs",
      instances: 8,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/var/log/fenix/error.log",
      out_file: "/var/log/fenix/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      
      // Auto-restart on crash
      autorestart: true,
      watch: false,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Health check
      health_endpoint: "/health",
      health_timeout: 10000,
    },
  ],
};
```

```bash
# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs fenix-backend

# Setup auto-start on server reboot
pm2 startup systemd -u root --hp /root
pm2 save
```

### Step 8: Add Health Check Endpoint

Add to your routes:

```typescript
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### Step 9: Monitor and Scale

**Using PM2**:
```bash
# Real-time monitoring
pm2 web  # Access at http://localhost:9615

# Logs
pm2 logs fenix-backend

# Restart on memory threshold
pm2 restart fenix-backend --max-memory-restart 2G
```

**Server Monitoring**:
```bash
# System resources
htop

# Network connections
netstat -tuln | grep 3001

# Database connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

## Connecting Frontend to Backend

### On Railway Frontend:

Update your API calls to use backend server:

```typescript
// client/src/lib/api.ts
const API_BASE = process.env.REACT_APP_API_URL || 
  (window.location.origin.includes('localhost') 
    ? 'http://localhost:3001' 
    : 'https://fenix-api.yourdomain.com');

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Important for JWT auth
  });
  
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
```

Set environment variable on Railway:
```
REACT_APP_API_URL=https://fenix-api.yourdomain.com
```

## Performance Tuning

### Database Connection Pool

For 1000-3000 users:
```
DB_POOL_MAX=50      # Max connections
DB_POOL_MIN=10      # Min connections
Connection timeout: 5s
Idle timeout: 30s
```

### Node.js Memory

```bash
# Allow more memory
NODE_OPTIONS="--max-old-space-size=4096"

# In ecosystem.config.js
node_args: "--max-old-space-size=4096"
```

### Nginx Tuning

```nginx
# Increase worker connections
events {
    worker_connections 10000;
    use epoll;
}

# Connection keepalive
http {
    keepalive_timeout 65;
    keepalive_requests 100;
}
```

## Load Testing

Before going live, test with 1000-3000 concurrent users:

```bash
# Using Apache Bench
ab -n 10000 -c 1000 https://fenix-api.yourdomain.com/health

# Using Artillery
npm install -g artillery

# Create test.yml
artillery quick --count 1000 --num 10 https://fenix-api.yourdomain.com

# Using k6
npm install -g k6
```

## Troubleshooting

### High CPU Usage
```bash
pm2 logs fenix-backend
# Check for slow queries or infinite loops
```

### Database Connection Errors
```bash
# Check pool status
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Increase DB pool
DB_POOL_MAX=100
```

### Memory Leaks
```bash
pm2 restart fenix-backend --max-memory-restart 2G
```

### Connection Timeouts
```bash
# Increase nginx timeout
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

## Cost Analysis

### Monthly Infrastructure Costs

| Component | Provider | Cost |
|-----------|----------|------|
| Backend Server | DigitalOcean | $144-288 |
| Database | Railway/Hosted | $50-200 |
| Frontend | Railway | $7-50 |
| Wasabi Storage | Wasabi | $5.99-50 |
| **Total** | | **$207-588** |

## Backup & Recovery

```bash
# Database backup (automated on Railway)
pg_dump $DATABASE_URL > backup.sql

# Application code backup
tar -czf fenix-backup.tar.gz /opt/fenix-backend

# Restore
cd /opt
tar -xzf fenix-backup.tar.gz
npm install
npm run build
pm2 restart fenix-backend
```

## Next Steps

1. **Deploy backend server** (30 min)
2. **Configure Nginx** (15 min)
3. **Update frontend API endpoint** (5 min)
4. **Run load tests** (1 hour)
5. **Monitor performance** (ongoing)
6. **Adjust pool sizes** based on metrics

---

For support: Check PM2 logs, Nginx error logs, and PostgreSQL query logs
