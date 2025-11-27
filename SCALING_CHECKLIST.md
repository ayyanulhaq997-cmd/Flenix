# Fenix Scaling Checklist - 1000-3000 Concurrent Users

## Pre-Deployment

- [ ] Code is production-ready
  - [ ] Remove console.log statements (use proper logging)
  - [ ] Enable gzip compression
  - [ ] Set NODE_ENV=production
  - [ ] Optimize database queries

- [ ] Security configured
  - [ ] JWT_SECRET set (unique production value)
  - [ ] CORS configured for your domains
  - [ ] Rate limiting enabled
  - [ ] HTTPS/SSL certificates ready

- [ ] Database optimized
  - [ ] Indexes created on frequently queried fields
  - [ ] Connection pool configured (50 max)
  - [ ] Backup strategy in place
  - [ ] Read replicas considered for scaling

- [ ] Monitoring setup
  - [ ] PM2 configured with auto-restart
  - [ ] Uptime monitoring (Pingdom/UptimeRobot)
  - [ ] Error tracking (Sentry)
  - [ ] Log aggregation (ELK/CloudWatch)

## Deployment

- [ ] Backend Server
  - [ ] Linux server provisioned (Ubuntu 22.04)
  - [ ] Node.js 20 LTS installed
  - [ ] Application code deployed
  - [ ] Dependencies installed: `npm install`
  - [ ] Production build: `npm run build`

- [ ] Configuration
  - [ ] `.env.production` created with all secrets
  - [ ] DATABASE_URL pointing to production database
  - [ ] JWT_SECRET configured
  - [ ] Wasabi credentials configured
  - [ ] No hardcoded credentials in code

- [ ] Reverse Proxy
  - [ ] Nginx installed and configured
  - [ ] SSL certificates installed (Let's Encrypt)
  - [ ] Upstream backend configured
  - [ ] Compression enabled (gzip)
  - [ ] Rate limiting configured

- [ ] Process Management
  - [ ] PM2 installed globally
  - [ ] ecosystem.config.js created
  - [ ] Application started: `pm2 start ecosystem.config.js`
  - [ ] Auto-start on reboot configured
  - [ ] Health check endpoint working

## Post-Deployment Verification

- [ ] Health Checks
  - [ ] Backend /health endpoint responds
  - [ ] API endpoints return data
  - [ ] Database connectivity verified
  - [ ] CDN URLs accessible

- [ ] Frontend Connection
  - [ ] Frontend updated with new API_BASE URL
  - [ ] Environment variables configured
  - [ ] API calls working from frontend
  - [ ] Authentication flow tested

- [ ] Performance Testing
  - [ ] Load test with 100 concurrent users
  - [ ] Load test with 500 concurrent users
  - [ ] Load test with 1000 concurrent users
  - [ ] Metrics collected and analyzed
  - [ ] No errors above 1% threshold

- [ ] Logging & Monitoring
  - [ ] PM2 logs show normal operation
  - [ ] Nginx logs show successful proxying
  - [ ] Database logs show healthy connections
  - [ ] Error tracking system active

## Ongoing Maintenance

- [ ] Daily (automated)
  - [ ] PM2 automatically restarts crashed processes
  - [ ] SSL certificates auto-renew (certbot)
  - [ ] Database backups created

- [ ] Weekly
  - [ ] Review error logs
  - [ ] Check server resource usage
  - [ ] Verify backup integrity
  - [ ] Monitor database query performance

- [ ] Monthly
  - [ ] Review cost analysis
  - [ ] Analyze user growth metrics
  - [ ] Plan scaling if needed
  - [ ] Security audit

## Scaling Triggers

Scale up if:
- [ ] CPU usage consistently >70%
- [ ] Memory usage consistently >80%
- [ ] Database connections approaching max (>40 of 50)
- [ ] API response time >1 second
- [ ] Error rate >1% of requests

Solutions:
1. **Increase server RAM**: $20-40/month per 8GB
2. **Add more CPU cores**: $40-100/month per 4 cores
3. **Add second backend server**: Set up load balancer
4. **Upgrade database**: Add read replicas or dedicated instance
5. **Implement caching**: Redis (£20-50/month)

## Rollback Plan

If deployment fails:
```bash
# Restore previous version
pm2 delete fenix-backend
git checkout previous-commit
npm install && npm run build
pm2 start ecosystem.config.js
```

## Success Metrics

You're ready for 1000-3000 users when:
- ✅ P95 response time < 500ms
- ✅ Error rate < 0.5%
- ✅ CPU usage < 60%
- ✅ Memory usage < 70%
- ✅ Database connections < 40 of 50
- ✅ All health checks passing
- ✅ 24-hour uptime test passed

---

**Estimated Setup Time**: 4-6 hours
**Go-Live Time**: Immediate after verification
**Support**: Check BACKEND_DEPLOYMENT.md for detailed instructions
