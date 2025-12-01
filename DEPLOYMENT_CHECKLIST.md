# Production Deployment Checklist

## Pre-Deployment (1-2 weeks before)

### Infrastructure Setup
- [ ] AWS Account created with billing alerts
- [ ] AWS RDS PostgreSQL instance created (multi-AZ)
- [ ] Database backups configured (automated daily)
- [ ] ElastiCache Redis cluster created
- [ ] S3 bucket created with versioning enabled
- [ ] CloudFront distribution created with OAC
- [ ] ALB/Load Balancer configured
- [ ] Security groups configured with proper firewall rules
- [ ] VPC/Networking configured correctly
- [ ] IAM roles and policies created

### Database Preparation
- [ ] Export Replit database to SQL file
- [ ] Test import to production RDS
- [ ] Verify all data migrated correctly
- [ ] Database backups automated
- [ ] Connection pooling configured
- [ ] Query optimization completed

### Application Preparation
- [ ] All dependencies updated to latest versions
- [ ] TypeScript compilation successful
- [ ] All tests passing locally
- [ ] Docker image built successfully
- [ ] Environment variables documented
- [ ] Secrets stored in AWS Secrets Manager
- [ ] Error handling comprehensive
- [ ] Logging configured properly

## Deployment Day

### Pre-Deployment Checks
- [ ] Notify team of deployment window
- [ ] Prepare rollback plan
- [ ] Backup production database (manual)
- [ ] Test database connections
- [ ] Verify all services are healthy

### Database Migration
- [ ] Stop API servers (if blue-green deployment)
- [ ] Export Replit database
- [ ] Import to production RDS
- [ ] Run database migrations: `npm run db:push`
- [ ] Verify data integrity
- [ ] Test API endpoints with production data

### API Deployment
- [ ] Build Docker image
- [ ] Push to ECR repository
- [ ] Update ECS task definition
- [ ] Deploy to ECS cluster
- [ ] Monitor application health
- [ ] Check CloudWatch logs for errors
- [ ] Verify API response times

### CDN & Storage
- [ ] Verify CloudFront distribution is active
- [ ] Test signed URL generation
- [ ] Confirm S3 bucket access
- [ ] Test video streaming end-to-end
- [ ] Verify adaptive bitrate switching

### Monitoring & Alerts
- [ ] CloudWatch dashboards created
- [ ] Alarms configured (CPU, memory, errors)
- [ ] Log monitoring enabled
- [ ] Uptime monitoring configured
- [ ] APM tool connected (New Relic, DataDog)

## Post-Deployment (24-48 hours)

### Immediate Verification
- [ ] API responding to requests
- [ ] Database queries performing well
- [ ] No error spikes in logs
- [ ] Video streaming working correctly
- [ ] Admin dashboard accessible
- [ ] User authentication working

### Monitoring & Metrics
- [ ] API response times: < 200ms p95
- [ ] Database connection pool: < 80% utilized
- [ ] Cache hit rate: > 80%
- [ ] Error rate: < 0.1%
- [ ] CPU utilization: 40-60%
- [ ] Memory utilization: < 70%

### Load Testing
- [ ] Simulate 100 concurrent users
- [ ] Simulate 500 concurrent users
- [ ] Simulate 1000 concurrent users
- [ ] Monitor resource utilization
- [ ] Verify auto-scaling triggers
- [ ] Check database connection limits

### Traffic Migration
- [ ] Start with 5% traffic to production
- [ ] Monitor for 4-6 hours
- [ ] Increase to 25% traffic
- [ ] Monitor for 4-6 hours
- [ ] Increase to 50% traffic
- [ ] Monitor for 4-6 hours
- [ ] Move 100% traffic to production

### Security Verification
- [ ] SSL/TLS certificate valid
- [ ] HTTPS redirect working
- [ ] Security headers present
- [ ] CORS properly configured
- [ ] Rate limiting working
- [ ] DDoS protection enabled (CloudFlare/AWS Shield)

## Post-Launch (Weekly)

- [ ] Database backups completed successfully
- [ ] Log retention policies working
- [ ] Performance metrics healthy
- [ ] Error rates minimal
- [ ] User feedback positive
- [ ] Cost tracking normal
- [ ] Security patches applied

## Rollback Procedure

If critical issues found within 24 hours:

1. **Stop new deployments** - Don't deploy more changes
2. **Alert team** - Notify on-call team
3. **Assess impact** - Determine scope of issue
4. **Initiate rollback**:
   ```bash
   # Revert to previous ECS task definition
   aws ecs update-service \
     --cluster fenix-prod \
     --service fenix-api \
     --task-definition fenix-api:previous-version
   ```
5. **Verify rollback** - Test API endpoints
6. **Post-mortem** - Document issue and fix
7. **Redeploy** - Deploy fix to production

## Success Criteria

✅ All systems operational for 24+ hours  
✅ API response times < 200ms  
✅ Database queries < 50ms  
✅ Zero critical errors  
✅ Cache hit rate > 80%  
✅ All team members trained  
✅ Documentation updated  
✅ Monitoring alerts working  

