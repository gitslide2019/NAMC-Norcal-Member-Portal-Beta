# TECH Clean California HubSpot Deployment Guide

Complete deployment guide for the TECH Clean California HubSpot integration with the NAMC NorCal Member Portal.

## Overview

This guide covers the deployment of a comprehensive HubSpot integration for TECH Clean California, including:

- **5 Automated Workflows** for contractor enrollment, project lifecycle, and incentive processing
- **4 Custom Objects** with 50+ properties for comprehensive data management
- **14 Email Templates** for automated communications
- **3 Webhook Endpoints** for real-time synchronization
- **Environment-Specific Configurations** for development, staging, and production

## Prerequisites

### Required Environment Variables

```bash
# HubSpot Configuration
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
HUBSPOT_PORTAL_ID=your_portal_id
HUBSPOT_API_KEY=your_api_key (optional)
HUBSPOT_API_URL=https://api.hubapi.com

# NAMC Portal Configuration
NAMC_PORTAL_URL=https://your-namc-portal.com
NAMC_API_URL=https://your-namc-portal.com/api
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret

# Webhook Configuration
WEBHOOK_AUTH_TOKEN=your_webhook_auth_token

# Notification Configuration (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url
ALERT_EMAIL_RECIPIENTS=admin@namcnorcal.org,tech@namcnorcal.org
```

### Required HubSpot Permissions

Your HubSpot access token must have the following scopes:

- `crm.objects.custom.read`
- `crm.objects.custom.write`
- `automation`
- `content`
- `files`
- `forms`
- `hubdb`
- `contacts`
- `oauth`

## Deployment Steps

### Step 1: Deploy Custom Objects

Deploy the 4 custom objects to HubSpot:

```bash
# Deploy objects to development
NODE_ENV=development npm run deploy:hubspot:objects

# Deploy objects to staging
NODE_ENV=staging npm run deploy:hubspot:objects

# Deploy objects to production
NODE_ENV=production npm run deploy:hubspot:objects
```

This creates:
- **TECH Contractor** (22 properties)
- **TECH Project** (24 properties)
- **TECH Customer Agreement** (14 properties)
- **TECH Documentation** (11 properties)

### Step 2: Deploy Email Templates

Deploy all 14 email templates:

```bash
# Deploy templates to development
NODE_ENV=development npm run deploy:hubspot:templates

# Deploy templates to staging
NODE_ENV=staging npm run deploy:hubspot:templates

# Deploy templates to production
NODE_ENV=production npm run deploy:hubspot:templates
```

Templates include:
- Contractor enrollment welcome
- Project agreement notifications
- Installation reminders
- Documentation requests
- Incentive approval notifications
- Payment confirmations

### Step 3: Deploy Workflows

Deploy the 5 automated workflows:

```bash
# Deploy workflows to development
NODE_ENV=development npm run deploy:hubspot:workflows

# Deploy workflows to staging
NODE_ENV=staging npm run deploy:hubspot:workflows

# Deploy workflows to production
NODE_ENV=production npm run deploy:hubspot:workflows
```

Workflows deployed:
- **Contractor Enrollment Workflow** (7 steps)
- **Contractor Recertification Workflow** (5 steps)
- **Project Initiation Workflow** (8 steps)
- **Quality Documentation Workflow** (6 steps)
- **Incentive Processing Workflow** (9 steps)

### Step 4: Configure Webhooks

Set up webhook endpoints in HubSpot:

1. **Workflow Status Webhook**
   - URL: `{NAMC_PORTAL_URL}/api/tech/webhooks/workflow-status`
   - Events: Workflow enrollment, completion, failure

2. **Property Change Webhook**
   - URL: `{NAMC_PORTAL_URL}/api/tech/webhooks/property-change`
   - Events: Property value changes for TECH objects

3. **Object Creation Webhook**
   - URL: `{NAMC_PORTAL_URL}/api/tech/webhooks/object-created`
   - Events: New TECH object creation

### Step 5: Validate Deployment

Run the comprehensive validation script:

```bash
# Validate development deployment
NODE_ENV=development npm run validate:hubspot:setup

# Validate staging deployment
NODE_ENV=staging npm run validate:hubspot:setup

# Validate production deployment
NODE_ENV=production npm run validate:hubspot:setup
```

The validation script checks:
- ✅ HubSpot API connectivity
- ✅ Custom objects and properties
- ✅ Workflow configuration
- ✅ Email template deployment
- ✅ Webhook endpoint accessibility
- ✅ Required permissions

## Environment-Specific Configuration

### Development Environment

- **Auto-deployment**: Disabled (manual deployment)
- **Validation**: Required
- **Approval**: Not required
- **Monitoring**: Console logging
- **Features**: All experimental features enabled

### Staging Environment

- **Auto-deployment**: Enabled
- **Validation**: Required
- **Approval**: Required
- **Monitoring**: Slack and email alerts
- **Features**: Production features only

### Production Environment

- **Auto-deployment**: Disabled (manual deployment)
- **Validation**: Required
- **Approval**: Always required
- **Monitoring**: Full alerting and logging
- **Features**: Stable features only

## Integration Bridge Configuration

The integration bridge provides real-time synchronization between HubSpot and NAMC Portal:

### Real-Time Sync Properties
- `enrollment_status`
- `project_status`
- `agreement_status`
- `verification_status`

### Batch Sync Properties
- `quality_score`
- `projects_completed`
- `average_incentive_amount`
- `incentive_amount`

### Sync Schedule
- **Real-time**: Every minute for critical properties
- **Batch**: Every 5 minutes for calculated properties
- **Full sync**: Every hour for data integrity

## Monitoring and Alerting

### Health Checks

Monitor integration health with these endpoints:

```bash
# Overall webhook health
GET /api/tech/webhooks

# Workflow status health
GET /api/tech/webhooks/workflow-status

# Property change health
GET /api/tech/webhooks/property-change

# Object creation health
GET /api/tech/webhooks/object-created
```

### Performance Metrics

Key metrics to monitor:

- **Webhook Response Time**: < 500ms
- **Sync Success Rate**: > 99%
- **Error Rate**: < 0.1%
- **Queue Size**: < 100 pending items

### Alerting Thresholds

- **Critical**: Webhook failures > 5% in 5 minutes
- **Warning**: Response time > 1 second
- **Info**: Queue size > 50 items

## Troubleshooting

### Common Issues

#### 1. HubSpot API Rate Limiting

**Symptoms**: 429 Too Many Requests errors

**Solution**:
```javascript
// Adjust rate limits in environment configuration
rateLimits: {
  requestsPerSecond: 5, // Reduce from default
  burstLimit: 20,
  dailyLimit: 5000
}
```

#### 2. Webhook Authentication Failures

**Symptoms**: 401 Unauthorized responses

**Solution**:
1. Verify `WEBHOOK_AUTH_TOKEN` is set correctly
2. Check webhook headers include proper authorization
3. Ensure production requires authentication

#### 3. Property Mapping Errors

**Symptoms**: Property sync failures

**Solution**:
1. Validate property mappings in `/config/hubspot-properties.ts`
2. Check data type compatibility
3. Verify transformation functions

#### 4. Workflow Enrollment Issues

**Symptoms**: Objects not enrolling in workflows

**Solution**:
1. Check enrollment criteria configuration
2. Verify object properties meet criteria
3. Validate workflow is active in HubSpot

### Debug Mode

Enable debug logging:

```bash
# Enable debug logging
NODE_ENV=development DEBUG=tech:* npm start
```

### Log Analysis

Monitor key log messages:

```bash
# Success patterns
✅ Successfully deployed
✅ Webhook processed successfully
✅ Property change synced

# Warning patterns
⚠️ Property not mapped for sync
⚠️ Non-TECH object, ignoring

# Error patterns
❌ Failed to deploy
❌ Webhook authentication failed
❌ Property sync failed
```

## Rollback Procedures

### Emergency Rollback

In case of critical issues:

1. **Disable Webhooks**:
   ```bash
   # Disable all webhooks temporarily
   curl -X POST "{NAMC_PORTAL_URL}/api/tech/webhooks/disable"
   ```

2. **Pause Workflows**:
   ```bash
   # Pause all TECH workflows in HubSpot
   NODE_ENV=production npm run pause:hubspot:workflows
   ```

3. **Restore Previous Configuration**:
   ```bash
   # Restore from backup
   NODE_ENV=production npm run restore:hubspot:backup
   ```

### Gradual Rollback

For non-critical issues:

1. **Reduce Traffic**: Lower webhook processing rate
2. **Disable Features**: Turn off experimental features
3. **Increase Monitoring**: Enhanced logging and alerting

## Performance Optimization

### Caching Strategy

- **Property mappings**: Cached for 1 hour
- **Workflow configurations**: Cached for 30 minutes
- **Validation results**: Cached for 15 minutes

### Batch Processing

- **Batch size**: 100 records per batch
- **Concurrent batches**: 5 maximum
- **Delay between batches**: 1 second

### Connection Pooling

- **HubSpot API**: Maximum 10 concurrent connections
- **Database**: Pool size based on environment
- **Webhook processing**: Rate limited by environment

## Security Considerations

### Authentication

- **Webhook endpoints**: Bearer token authentication
- **API calls**: HubSpot access token with minimal scopes
- **Database**: Encrypted connection strings

### Data Protection

- **PII handling**: No PII in logs or debug output
- **Encryption**: All data in transit encrypted (HTTPS)
- **Access control**: Role-based access to admin functions

### Compliance

- **GDPR**: Data processing agreements in place
- **CCPA**: Privacy controls implemented
- **SOC 2**: Audit trail and monitoring

## Support and Maintenance

### Regular Maintenance

- **Weekly**: Review performance metrics and error logs
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize configurations

### Support Contacts

- **Technical Issues**: tech-support@namcnorcal.org
- **Business Questions**: tech-program@namcnorcal.org
- **Emergency**: (510) 555-TECH

### Documentation Updates

Keep documentation current:

- **Configuration changes**: Update environment files
- **Workflow modifications**: Update workflow definitions
- **Property additions**: Update mapping configurations

---

## Conclusion

This deployment guide provides a comprehensive framework for deploying and maintaining the TECH Clean California HubSpot integration. Following these procedures ensures reliable operation, proper monitoring, and quick issue resolution.

For additional support or questions, contact the NAMC NorCal technical team.