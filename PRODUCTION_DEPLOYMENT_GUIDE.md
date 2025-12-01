# Phase 2: Production Deployment Guide

## Overview

Your Replit project is your **development/staging environment**. This guide moves your production services to dedicated, scalable infrastructure handling 1000-3000 concurrent users.

## Architecture Decision: Recommended Stack

```
Development (Replit)          Production (Scalable)
┌──────────────────┐          ┌──────────────────────┐
│ React Dashboard  │          │ React Dashboard      │
│ Node.js API      │  ──────> │ Load Balancer        │
│ PostgreSQL Dev   │          │ Node.js Cluster      │
│ Redis Cache      │          │ AWS RDS PostgreSQL   │
└──────────────────┘          │ AWS ElastiCache      │
                              │ S3 + CloudFront      │
                              └──────────────────────┘
```

## Phase 2A: Production Database Migration

### Option 1: AWS RDS PostgreSQL (Recommended)

**Best for**: High availability, automated backups, scaling

**Step 1: Create RDS Instance**
```bash
aws rds create-db-instance \
  --db-instance-identifier fenix-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password "strong-password-here" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxx \
  --backup-retention-period 30 \
  --multi-az true
```

**Step 2: Wait for Instance (10-15 minutes)**
```bash
aws rds describe-db-instances \
  --db-instance-identifier fenix-prod \
  --query 'DBInstances[0].DBInstanceStatus'
```

**Step 3: Export Replit Database**
```bash
# From Replit terminal
export DATABASE_URL="postgresql://user:pass@replit-db:5432/fenix"

# Export all data
pg_dump "$DATABASE_URL" > fenix-backup.sql

# Verify backup
file fenix-backup.sql
wc -l fenix-backup.sql
```

**Step 4: Import to RDS**
```bash
# Local machine or deployment server
export PROD_DATABASE_URL="postgresql://postgres:password@fenix-prod.xxxxx.us-east-1.rds.amazonaws.com:5432/fenix"

psql "$PROD_DATABASE_URL" < fenix-backup.sql

# Verify data
psql "$PROD_DATABASE_URL" -c "SELECT COUNT(*) FROM movies;"
psql "$PROD_DATABASE_URL" -c "SELECT COUNT(*) FROM app_users;"
```

**Configuration**:
```env
# Production .env
DATABASE_URL=postgresql://postgres:strong-password@fenix-prod.xxxxx.us-east-1.rds.amazonaws.com:5432/fenix
DB_POOL_SIZE=20
DB_STATEMENT_TIMEOUT=30000
ENABLE_CONNECTION_POOLING=true
```

**Cost**: ~$30-50/month (db.t3.medium with gp3 storage)

### Option 2: Neon Serverless PostgreSQL

**Best for**: Automatic scaling, pay-per-use, simple setup

**Step 1: Create Neon Project**
```bash
# Via Neon Console (https://console.neon.tech)
# 1. Sign up / Login
# 2. Create project "fenix-prod"
# 3. Copy connection string
```

**Step 2: Export & Import**
```bash
# Export from Replit
pg_dump "$REPLIT_DATABASE_URL" > fenix-backup.sql

# Import to Neon (use connection string from console)
psql "postgresql://user:pass@ep-xxxxx.us-east-1.neon.tech/fenix" < fenix-backup.sql
```

**Configuration**:
```env
DATABASE_URL=postgresql://user:pass@ep-xxxxx.us-east-1.neon.tech/fenix
```

**Cost**: ~$50-150/month (based on usage, auto-scaling)

### Option 3: MongoDB Atlas

**Best for**: Document-based architecture, easier scaling

**Step 1: Create Atlas Cluster**
```bash
# Via MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
1. Create account
2. Create project "fenix"
3. Create M10 cluster (multi-region)
4. Set network access whitelist
```

**Step 2: Migrate Data (Optional - keep PostgreSQL for structured data)**

MongoDB Atlas is better for analytics/logging, not primary data.

**Configuration**:
```env
MONGODB_URI=mongodb+srv://user:password@fenix-cluster.mongodb.net/fenix?retryWrites=true&w=majority
```

**Cost**: ~$57/month (M10 cluster)

## Phase 2B: Deploy Node.js API to Production

### Option 1: AWS ECS + Fargate (Recommended for Scaling)

**Best for**: 1000-3000 concurrent users, auto-scaling

**Step 1: Containerize Application**

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
ENV NODE_ENV=production

CMD ["node", "dist/index.cjs"]
```

Create `.dockerignore`:
```
node_modules
dist
.git
.env
.env.*
*.log
test-*.ts
```

**Step 2: Build & Push to ECR**
```bash
# Create ECR repository
aws ecr create-repository --repository-name fenix-api

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t fenix-api:latest .

# Tag for ECR
docker tag fenix-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/fenix-api:latest

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/fenix-api:latest
```

**Step 3: Create ECS Cluster**
```bash
# Create cluster
aws ecs create-cluster --cluster-name fenix-prod

# Create task definition (save as task-definition.json)
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

Task definition template:
```json
{
  "family": "fenix-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "fenix-api",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/fenix-api:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "postgresql://postgres:pass@fenix-prod.xxxxx.rds.amazonaws.com/fenix"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:fenix/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fenix-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Step 4: Create ECS Service with Load Balancer**
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name fenix-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing

# Create target group
aws elbv2 create-target-group \
  --name fenix-api \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxxxx \
  --target-type ip

# Create ECS service
aws ecs create-service \
  --cluster fenix-prod \
  --service-name fenix-api \
  --task-definition fenix-api \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=fenix-api,containerPort=5000
```

**Step 5: Setup Auto-Scaling**
```bash
# Create auto-scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/fenix-prod/fenix-api \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy (CPU-based)
aws application-autoscaling put-scaling-policy \
  --policy-name cpu-scaling \
  --service-namespace ecs \
  --resource-id service/fenix-prod/fenix-api \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration TargetValue=70,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization}
```

**Cost**: ~$100-300/month (3 Fargate tasks + ALB)

### Option 2: Railway (Simpler Alternative)

**Best for**: Easier deployment, reduced DevOps overhead

**Step 1: Connect Repository**
1. Go to railway.app
2. Create new project
3. Connect GitHub repository
4. Select branch to deploy

**Step 2: Add Services**
```bash
# Railway automatically detects Node.js
# Create PostgreSQL plugin
# Create Redis plugin
```

**Step 3: Set Environment Variables**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
CLOUDFRONT_DOMAIN=...
NODE_ENV=production
```

**Step 4: Deploy**
```bash
# Push to main branch - Railway auto-deploys
git push origin main
```

**Cost**: ~$50-150/month (pay-as-you-go)

### Option 3: Heroku (Legacy - Not Recommended)

Heroku removed free tier and is now expensive. Use Railway or AWS instead.

## Phase 2C: ElastiCache for Redis

**Step 1: Create Redis Cluster**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id fenix-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxxxx
```

**Step 2: Update Connection String**
```env
REDIS_URL=redis://fenix-redis.xxxxx.ng.0001.use1.cache.amazonaws.com:6379
```

**Cost**: ~$20/month

## Phase 2D: CloudFront CDN (Already Configured)

Your CloudFront distribution is already set up in development.

For production:
1. Create new CloudFront distribution pointing to production S3 bucket
2. Use same Origin Access Control (OAC) configuration
3. Generate new RSA key pair for signing

```bash
# Generate production key pair
openssl genrsa -out prod_private_key.pem 2048

# Upload public key to CloudFront
# (Via AWS Console or CLI)
```

## Phase 2E: Environment Configuration

Create separate `.env` files:

**`.env.production`**:
```env
# Database
DATABASE_URL=postgresql://postgres:password@fenix-prod.xxxxx.rds.amazonaws.com/fenix
DB_POOL_SIZE=20

# Cache
REDIS_URL=redis://fenix-redis.xxxxx.cache.amazonaws.com:6379

# Authentication
JWT_SECRET=production-secret-key-min-64-chars
SESSION_SECRET=production-session-secret

# Cloud Storage
STORAGE_PROVIDER=s3
STORAGE_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
STORAGE_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STORAGE_BUCKET=fenix-prod-videos
STORAGE_REGION=us-east-1
CDN_URL=https://d123456.cloudfront.net

# CloudFront Signing
CLOUDFRONT_DOMAIN=d123456.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=APKAIF5J6KLMNO7P2QRS
CLOUDFRONT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
CLOUDFRONT_URL_EXPIRY=3600

# Server
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
```

## Phase 2F: Monitoring & Logging

### CloudWatch Logs
```bash
# Create log group
aws logs create-log-group --log-group-name /production/fenix-api

# Set retention
aws logs put-retention-policy \
  --log-group-name /production/fenix-api \
  --retention-in-days 30
```

### DataDog or New Relic (Optional)
```env
# For real-time monitoring
DATADOG_API_KEY=your-key
DATADOG_APP_KEY=your-key
```

### Application Metrics
```typescript
// Track important metrics
- API response times
- Database query durations
- Cache hit/miss rates
- Active user connections
- Failed login attempts
- Video stream quality distribution
- CloudFront signed URL generation rate
```

## Phase 2G: Database Backup & Recovery

**Automated Backups**:
- AWS RDS: Automatic daily backups (30-day retention)
- Neon: Automatic backups every hour
- Manual backups:

```bash
# Daily backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump "$PROD_DATABASE_URL" | gzip > backups/fenix_$TIMESTAMP.sql.gz

# Upload to S3
aws s3 cp backups/fenix_$TIMESTAMP.sql.gz s3://fenix-backups/
```

## Phase 2H: DNS & Domain Setup

**1. Register Domain** (Route 53, GoDaddy, etc.)

**2. Create Route 53 Hosted Zone**
```bash
aws route53 create-hosted-zone \
  --name fenix-streaming.com \
  --caller-reference $(date +%s)
```

**3. Point to Load Balancer**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "fenix-streaming.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "fenix-alb-123456.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

**4. SSL/TLS Certificate (ACM)**
```bash
aws acm request-certificate \
  --domain-name fenix-streaming.com \
  --subject-alternative-names "*.fenix-streaming.com" \
  --validation-method DNS
```

## Phase 2I: Deployment Checklist

- [ ] Production database created (RDS/Neon/Atlas)
- [ ] Data migrated from Replit
- [ ] Database backups configured
- [ ] Docker image built & pushed to ECR
- [ ] ECS cluster created with 3+ instances
- [ ] Load balancer configured
- [ ] Auto-scaling policies set (2-10 instances)
- [ ] CloudWatch logging enabled
- [ ] CloudFront distribution created
- [ ] ElastiCache Redis cluster active
- [ ] Environment variables configured (secrets manager)
- [ ] SSL certificate installed (ACM)
- [ ] Domain DNS configured
- [ ] Health check endpoints verified
- [ ] API response times monitored
- [ ] Database connections monitored
- [ ] Cache hit rates monitored
- [ ] Error rates monitored
- [ ] Load testing completed
- [ ] Failover tested
- [ ] Rollback procedure documented

## Phase 2J: Cost Breakdown (Monthly)

| Component | Service | Cost |
|-----------|---------|------|
| Database | RDS db.t3.medium | $35 |
| Compute | ECS (3x t3.medium) | $120 |
| Load Balancer | ALB | $20 |
| Cache | ElastiCache t3.micro | $20 |
| Storage | S3 (100GB) | $2.50 |
| CDN | CloudFront (2TB/mo) | $160 |
| Logging | CloudWatch | $5 |
| **Total** | | **~$362/month** |

*Can be reduced to ~$200 with smaller instance types if load < 500 concurrent users*

## Phase 2K: Post-Deployment

**1. Verify Production Health**
```bash
curl https://fenix-streaming.com/api/stats
curl https://fenix-streaming.com/api/storage/health
```

**2. Test Video Streaming**
- Verify signed URLs generate correctly
- Test playback on TV app
- Verify adaptive bitrate switching
- Check CloudFront cache hit rates

**3. Monitor Metrics**
- Database connection pool usage
- API response times (target: < 200ms)
- Cache hit rate (target: > 80%)
- Error rate (target: < 0.1%)

**4. Gradual Migration**
- Start with 10% of traffic → production
- Monitor for 48 hours
- Move 50% of traffic → production
- Monitor for 48 hours
- Move 100% of traffic → production

## Next Steps

1. Choose database solution (AWS RDS recommended)
2. Set up production database
3. Export data from Replit
4. Import to production database
5. Containerize application
6. Deploy to ECS/Railway
7. Configure monitoring
8. Run load testing
9. Gradual traffic migration

Your development environment (Replit) remains for testing new features before production deployment.

