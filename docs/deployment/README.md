# Deployment Guide

Complete deployment guide for the NAMC NorCal Member Portal across development, staging, and production environments.

## 📋 Overview

This guide covers deployment strategies, environment configuration, and operational procedures for the NAMC Portal with HubSpot workflow integration.

### Deployment Environments
- **Development**: Local development with Docker Compose
- **Staging**: Pre-production testing environment
- **Production**: Live production environment with blue-green deployment

### Key Features
- **Multi-environment support** with environment-specific configurations
- **Blue-green deployment** for zero-downtime production releases
- **Automated health checks** and rollback capabilities
- **Comprehensive monitoring** with Prometheus, Grafana, and Loki
- **Container orchestration** with Docker and Docker Compose

## 🏗️ Infrastructure Requirements

### Minimum System Requirements

#### Development Environment
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: macOS, Linux, or Windows with WSL2

#### Staging Environment
- **CPU**: 2 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Network**: Public IP with domain name

#### Production Environment
- **CPU**: 4 cores
- **RAM**: 16GB
- **Storage**: 100GB SSD
- **Network**: Load balancer, CDN, SSL certificate
- **Backup**: Automated database and file backups

### External Services
- **PostgreSQL**: 15+ (managed or self-hosted)
- **Redis**: 7+ for caching and sessions
- **SMTP**: Email service provider
- **HubSpot**: API access and webhook endpoints
- **Domain**: SSL certificate for HTTPS

## 🐳 Docker Deployment

### Development Deployment

#### Quick Start
```bash
# Clone repository
git clone https://github.com/your-org/namc-portal.git
cd namc-portal

# Copy environment file
cp .env.example .env.development

# Start development environment
docker-compose -f docker-compose.development.yml up -d

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

#### Development Configuration
```yaml
# docker-compose.development.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://namc_user:password@postgres:5432/namc_portal_dev
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: namc_portal_dev
      POSTGRES_USER: namc_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
```

### Production Deployment

#### Using the Deployment Script
```bash
# Deploy to production with backup
./scripts/deployment/deploy.sh production --backup

# Deploy with custom settings
./scripts/deployment/deploy.sh production --force --verbose

# Dry run to see what would be deployed
./scripts/deployment/deploy.sh production --dry-run
```

#### Manual Production Deployment
```bash
# Build production image
docker build -f Dockerfile.production -t namc-portal:latest .

# Start production services
docker-compose -f docker-compose.production.yml up -d

# Verify deployment
curl -f https://portal.namcnorcal.org/api/health
```

## 🌍 Environment Configuration

### Environment Variables

#### Required Variables
```env
# Application
NODE_ENV=production
APP_PORT=3000
CORS_ORIGIN=https://portal.namcnorcal.org
NEXT_PUBLIC_APP_URL=https://portal.namcnorcal.org

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-64-characters
SESSION_SECRET=your-super-secure-session-secret-minimum-64-characters

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=rediss://user:password@host:6380

# HubSpot
HUBSPOT_API_KEY=pat-na1-your-api-key
HUBSPOT_CLIENT_ID=your-client-id
HUBSPOT_CLIENT_SECRET=your-client-secret
HUBSPOT_PORTAL_ID=your-portal-id

# Email
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-email@namcnorcal.org
SMTP_PASS=your-email-password
```

#### Optional Variables
```env
# Monitoring
ENABLE_ANALYTICS=true
GRAFANA_PASSWORD=secure-grafana-password

# File Storage
FILE_UPLOAD_PATH=/app/uploads
UPLOAD_MAX_SIZE=10485760

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key

# SSL/TLS (Production)
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/private.key
```

### Environment-Specific Files
Create separate environment files:
- `.env.development` - Development configuration
- `.env.staging` - Staging configuration  
- `.env.production` - Production configuration

## 🚀 Deployment Strategies

### Blue-Green Deployment

#### Overview
Blue-green deployment ensures zero-downtime production releases by maintaining two identical environments.

#### Implementation
```bash
# Current production (Blue environment)
docker-compose -f docker-compose.production.yml up -d

# Deploy new version (Green environment)
docker-compose -f docker-compose.green.yml up -d

# Test green environment
curl -f https://green.portal.namcnorcal.org/api/health

# Switch traffic to green environment
./scripts/deployment/switch-environment.sh green

# Monitor for issues
./scripts/deployment/monitor-deployment.sh

# If successful, decommission blue environment
docker-compose -f docker-compose.production.yml down
```

#### Load Balancer Configuration
```nginx
# Nginx load balancer configuration
upstream namc_portal_blue {
    server blue.portal.namcnorcal.org:3000;
}

upstream namc_portal_green {
    server green.portal.namcnorcal.org:3000;
}

server {
    listen 443 ssl;
    server_name portal.namcnorcal.org;
    
    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        # Switch between blue and green
        proxy_pass http://namc_portal_blue;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Rolling Deployment

#### Container Orchestration
```bash
# Update containers one at a time
docker-compose up -d --scale app=3 --no-recreate

# Wait for health checks
./scripts/deployment/wait-for-health.sh

# Update remaining containers
docker-compose up -d --force-recreate
```

### Canary Deployment

#### Traffic Splitting
```bash
# Deploy canary version
docker-compose -f docker-compose.canary.yml up -d

# Route 10% of traffic to canary
./scripts/deployment/set-traffic-split.sh canary 10

# Monitor metrics
./scripts/deployment/monitor-canary.sh

# Gradually increase traffic
./scripts/deployment/set-traffic-split.sh canary 50
./scripts/deployment/set-traffic-split.sh canary 100
```

## 🔍 Health Checks and Monitoring

### Application Health Checks

#### Health Check Endpoint
```bash
# Basic health check
curl -f https://portal.namcnorcal.org/api/health

# Detailed health status
curl -s https://portal.namcnorcal.org/api/health | jq .
```

#### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 86400,
  "checks": {
    "database": {"status": "pass", "response_time": 45},
    "redis": {"status": "pass", "response_time": 12},
    "hubspot": {"status": "pass", "response_time": 234},
    "filesystem": {"status": "pass"},
    "memory": {"status": "pass", "usage_percent": 67.3}
  }
}
```

### Docker Health Checks

#### Dockerfile Health Check
```dockerfile
# Dockerfile.production
FROM node:18-alpine

# ... build steps ...

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD ["./healthcheck.sh", "--quiet"]
```

#### Health Check Script
```bash
#!/bin/sh
# scripts/docker/healthcheck.sh

# Check HTTP endpoint
curl -f http://localhost:3000/api/health || exit 1

# Check database connectivity
nc -z database 5432 || exit 1

# Check Redis connectivity
nc -z redis 6379 || exit 1

echo "Health check passed"
```

### Monitoring Stack

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'namc-portal'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
      
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

#### Grafana Dashboards
- **Application Metrics**: Response times, error rates, throughput
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Database Metrics**: Connection pool, query performance
- **HubSpot Integration**: API calls, workflow success rates

### Alerting

#### Alert Rules
```yaml
# monitoring/alerts.yml
groups:
  - name: namc-portal
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected
          
      - alert: DatabaseConnectionFailed
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database connection failed
```

## 🗄️ Database Management

### Migration Strategy

#### Production Migrations
```bash
# Backup database before migration
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Run migrations
npm run db:migrate

# Verify migration success
npm run db:verify
```

#### Migration Best Practices
1. **Test migrations** in staging environment first
2. **Create backups** before running migrations
3. **Use transactions** for atomic operations
4. **Monitor performance** during migration
5. **Have rollback plan** ready

### Database Backup

#### Automated Backup
```bash
#!/bin/bash
# scripts/backup/backup.sh

BACKUP_DIR="/backup/$(date +%Y/%m/%d)"
mkdir -p "$BACKUP_DIR"

# Database backup
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/database-$(date +%H%M%S).sql.gz"

# File backup
tar -czf "$BACKUP_DIR/uploads-$(date +%H%M%S).tar.gz" /app/uploads

# Cleanup old backups (keep 30 days)
find /backup -name "*.gz" -mtime +30 -delete
```

#### Backup Verification
```bash
# Test backup integrity
gunzip -t backup.sql.gz || echo "Backup corrupted"

# Test restore process
createdb test_restore
gunzip -c backup.sql.gz | psql test_restore
dropdb test_restore
```

## 🔄 Rollback Procedures

### Automatic Rollback

#### Health Check Failure
```bash
# Automatic rollback on health check failure
if ! curl -f https://portal.namcnorcal.org/api/health; then
  echo "Health check failed, rolling back..."
  ./scripts/deployment/rollback.sh
fi
```

#### Rollback Script
```bash
#!/bin/bash
# scripts/deployment/rollback.sh

echo "Starting rollback procedure..."

# Find previous successful deployment
PREVIOUS_VERSION=$(docker images namc-portal --format "table {{.Tag}}" | grep -v latest | head -n1)

# Stop current deployment
docker-compose down

# Start previous version
docker tag namc-portal:$PREVIOUS_VERSION namc-portal:latest
docker-compose up -d

# Verify rollback
./scripts/deployment/verify-deployment.sh

echo "Rollback completed to version: $PREVIOUS_VERSION"
```

### Manual Rollback

#### Database Rollback
```bash
# Rollback database to specific migration
npx prisma migrate rollback --to migration_name

# Restore from backup
dropdb namc_portal_prod
createdb namc_portal_prod
gunzip -c backup.sql.gz | psql namc_portal_prod
```

#### Application Rollback
```bash
# Rollback to specific version
docker tag namc-portal:v1.2.0 namc-portal:latest
docker-compose up -d --force-recreate
```

## 📊 Performance Optimization

### Container Optimization

#### Multi-stage Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Resource Limits
```yaml
# docker-compose.production.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### Database Optimization

#### Connection Pooling
```typescript
// Database connection configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Connection pool settings
process.env.DATABASE_URL += '?connection_limit=20&pool_timeout=20'
```

#### Query Optimization
```sql
-- Index optimization
CREATE INDEX CONCURRENTLY idx_events_date ON events(start_date);
CREATE INDEX CONCURRENTLY idx_members_email ON members(email);
CREATE INDEX CONCURRENTLY idx_messages_conversation ON messages(sender_id, recipient_id, created_at);
```

## 🔒 Security

### SSL/TLS Configuration

#### Certificate Management
```bash
# Let's Encrypt with Certbot
certbot certonly --webroot -w /var/www/html -d portal.namcnorcal.org

# Auto-renewal
echo "0 3 * * * /usr/bin/certbot renew --quiet" | crontab -
```

#### HTTPS Enforcement
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name portal.namcnorcal.org;
    return 301 https://$server_name$request_uri;
}
```

### Security Headers

#### Next.js Security Configuration
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Secrets Management

#### Environment Variables
```bash
# Use secret management service
export JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id jwt-secret --query SecretString --output text)
export DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id database-url --query SecretString --output text)
```

#### Docker Secrets
```yaml
# docker-compose.production.yml
services:
  app:
    secrets:
      - jwt_secret
      - database_url
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - DATABASE_URL_FILE=/run/secrets/database_url

secrets:
  jwt_secret:
    external: true
  database_url:
    external: true
```

## 🧪 Testing Deployments

### Staging Environment Testing

#### Deployment Validation
```bash
# Deploy to staging
./scripts/deployment/deploy.sh staging

# Run integration tests
npm run test:integration:staging

# Run E2E tests
npm run test:e2e:staging

# Performance testing
npm run test:performance:staging
```

#### Smoke Tests
```bash
#!/bin/bash
# scripts/testing/smoke-tests.sh

BASE_URL=$1

# Health check
curl -f "$BASE_URL/api/health" || exit 1

# Authentication
curl -f -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' || exit 1

# HubSpot integration
curl -f "$BASE_URL/api/hubspot/health" || exit 1

echo "All smoke tests passed"
```

### Load Testing

#### Artillery Load Test
```yaml
# load-test.yml
config:
  target: 'https://portal.namcnorcal.org'
  phases:
    - duration: 300
      arrivalRate: 10
    - duration: 600
      arrivalRate: 50
  processor: "./load-test-processor.js"

scenarios:
  - name: "Member login and browse events"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password"
      - get:
          url: "/api/events"

  - name: "HubSpot webhook processing"
    weight: 30
    flow:
      - post:
          url: "/api/webhooks/hubspot/contact"
          headers:
            x-hubspot-signature: "test-signature"
```

## 📋 Operational Procedures

### Daily Operations

#### Health Monitoring
```bash
# Check application health
curl -s https://portal.namcnorcal.org/api/health | jq '.status'

# Check system resources
docker stats --no-stream

# Check logs for errors
docker-compose logs --tail=100 app | grep ERROR
```

#### Database Maintenance
```bash
# Update statistics
docker-compose exec postgres psql -U namc_user -d namc_portal -c "ANALYZE;"

# Check database size
docker-compose exec postgres psql -U namc_user -d namc_portal -c "SELECT pg_size_pretty(pg_database_size('namc_portal'));"
```

### Weekly Operations

#### Security Updates
```bash
# Update base images
docker pull node:18-alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine

# Rebuild images
docker-compose build --no-cache

# Deploy updates
./scripts/deployment/deploy.sh production --backup
```

#### Performance Review
```bash
# Generate performance report
./scripts/monitoring/performance-report.sh

# Database performance analysis
./scripts/database/performance-analysis.sh

# Log analysis
./scripts/monitoring/log-analysis.sh
```

### Incident Response

#### Emergency Procedures
```bash
# Emergency rollback
./scripts/deployment/emergency-rollback.sh

# Scale up resources
docker-compose up -d --scale app=5

# Enable maintenance mode
./scripts/maintenance/enable-maintenance-mode.sh
```

#### Incident Documentation
1. **Time and duration** of incident
2. **Impact assessment** (users affected, services down)
3. **Root cause analysis**
4. **Actions taken** to resolve
5. **Prevention measures** for future

## 📚 Additional Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Administration](https://www.postgresql.org/docs/15/admin.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prometheus Monitoring](https://prometheus.io/docs/)

### Tools and Scripts
- [Deployment Scripts](../../scripts/deployment/)
- [Monitoring Configuration](../../monitoring/)
- [Docker Configurations](../../docker/)
- [Database Scripts](../../scripts/database/)

### Support
- **Documentation Issues**: Create GitHub issue
- **Deployment Problems**: Check [Troubleshooting Guide](../troubleshooting/README.md)
- **Emergency Contact**: security@namcnorcal.org

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: NAMC NorCal DevOps Team