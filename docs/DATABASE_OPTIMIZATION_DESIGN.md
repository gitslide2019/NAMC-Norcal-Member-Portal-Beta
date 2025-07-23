# NAMC Portal Database Optimization Design

## 📋 Overview

This document provides comprehensive database design and optimization strategies for the NAMC NorCal Member Portal, including performance tuning, indexing strategies, query optimization, and scalability patterns.

## 🗄️ Database Architecture

### Technology Stack
- **Primary Database**: PostgreSQL 15
- **ORM**: Prisma 6.1.0
- **Extensions**: PostGIS (geographic data), pg_trgm (fuzzy search)
- **Connection Pooling**: PgBouncer
- **Replication**: Primary-replica setup with read replicas
- **Backup**: Automated daily backups with point-in-time recovery

### Database Structure Overview

```
namc_portal_db/
├── Core Tables (13 tables)
│   ├── users                    # Member profiles and authentication
│   ├── roles                    # Role definitions
│   ├── permissions              # Permission definitions
│   ├── user_roles               # User-role assignments
│   ├── role_permissions         # Role-permission mappings
│   └── user_skills              # Member skills and expertise
├── Business Logic (8 tables)
│   ├── projects                 # Project opportunities
│   ├── project_applications     # Project applications
│   ├── project_files           # Project attachments
│   ├── events                  # Event management
│   ├── event_registrations     # Event signups
│   ├── event_files            # Event materials
│   ├── messages               # Direct messaging
│   └── announcements          # System announcements
├── Learning System (3 tables)
│   ├── courses                # Course catalog
│   ├── course_modules         # Course content
│   └── course_enrollments     # Student progress
├── Financial System (3 tables)
│   ├── payments               # Payment processing
│   ├── membership_tiers       # Membership levels
│   └── california_contractors # External contractor data
└── System Tables (4 tables)
    ├── admin_actions          # Audit trail
    ├── member_feedback        # Support tickets
    ├── system_metrics         # Performance data
    └── sessions              # User sessions (Redis primary)
```

## 🎯 Performance Optimization Strategies

### 1. Indexing Strategy

**Primary Indexes (Automatically created):**
```sql
-- Primary keys and unique constraints
CREATE UNIQUE INDEX users_pkey ON users(id);
CREATE UNIQUE INDEX users_email_key ON users(email);
CREATE UNIQUE INDEX projects_pkey ON projects(id);
CREATE UNIQUE INDEX events_pkey ON events(id);
```

**Performance Indexes:**
```sql
-- User lookup and authentication
CREATE INDEX CONCURRENTLY idx_users_email_active ON users(email, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_users_member_type ON users(member_type);
CREATE INDEX CONCURRENTLY idx_users_location ON users(city, state) WHERE city IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_users_skills ON users USING gin(skills);

-- Project search and filtering
CREATE INDEX CONCURRENTLY idx_projects_status_created ON projects(status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_projects_category_status ON projects(category, status);
CREATE INDEX CONCURRENTLY idx_projects_budget ON projects(budget_min, budget_max) WHERE budget_min IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_projects_deadline ON projects(deadline_date) WHERE deadline_date > CURRENT_DATE;
CREATE INDEX CONCURRENTLY idx_projects_location_gist ON projects USING GIST(coordinates) WHERE coordinates IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_projects_skills ON projects USING gin(skills_required);

-- Event management
CREATE INDEX CONCURRENTLY idx_events_date_status ON events(start_date, status) WHERE status IN ('PUBLISHED', 'REGISTRATION_OPEN');
CREATE INDEX CONCURRENTLY idx_events_type_date ON events(type, start_date DESC);
CREATE INDEX CONCURRENTLY idx_event_registrations_user_event ON event_registrations(user_id, event_id);

-- Messaging system
CREATE INDEX CONCURRENTLY idx_messages_sender_receiver ON messages(sender_id, receiver_id, sent_at DESC);
CREATE INDEX CONCURRENTLY idx_messages_receiver_status ON messages(receiver_id, status, sent_at DESC);

-- Geographic searches (PostGIS)
CREATE INDEX CONCURRENTLY idx_projects_location_gist ON projects USING GIST(coordinates);
CREATE INDEX CONCURRENTLY idx_users_location_gist ON users USING GIST(coordinates) WHERE coordinates IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_contractors_location_gist ON california_contractors USING GIST(coordinates);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY idx_projects_fts ON projects USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX CONCURRENTLY idx_users_fts ON users USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(company, '')));
CREATE INDEX CONCURRENTLY idx_contractors_fts ON california_contractors USING gin(to_tsvector('english', business_name || ' ' || COALESCE(dba_name, '')));

-- Audit and compliance
CREATE INDEX CONCURRENTLY idx_admin_actions_user_date ON admin_actions(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_admin_actions_target_date ON admin_actions(target_user_id, created_at DESC) WHERE target_user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_admin_actions_action_date ON admin_actions(action, created_at DESC);
```

**Composite Indexes for Complex Queries:**
```sql
-- Member directory filtering
CREATE INDEX CONCURRENTLY idx_users_directory ON users(is_active, member_type, city, state) 
WHERE is_active = true AND member_type = 'REGULAR';

-- Project opportunity matching
CREATE INDEX CONCURRENTLY idx_projects_matching ON projects(status, category, budget_min, budget_max, deadline_date) 
WHERE status = 'BIDDING_OPEN' AND deadline_date > CURRENT_DATE;

-- Event registration analytics
CREATE INDEX CONCURRENTLY idx_event_analytics ON event_registrations(event_id, status, registered_at) 
WHERE status IN ('REGISTERED', 'ATTENDED');
```

### 2. Query Optimization Patterns

**Efficient Pagination:**
```sql
-- Cursor-based pagination (preferred for large datasets)
SELECT id, title, created_at 
FROM projects 
WHERE created_at < $1 AND status = 'PUBLISHED'
ORDER BY created_at DESC 
LIMIT 20;

-- Offset pagination with optimization
SELECT id, title, created_at,
       COUNT(*) OVER() as total_count
FROM projects 
WHERE status = 'PUBLISHED'
ORDER BY created_at DESC 
LIMIT 20 OFFSET $1;
```

**Geographic Queries with PostGIS:**
```sql
-- Find projects within 50 miles of user location
SELECT p.*, 
       ST_Distance(p.coordinates::geography, $1::geography) / 1609.34 as distance_miles
FROM projects p
WHERE p.status = 'PUBLISHED'
  AND ST_DWithin(p.coordinates::geography, $1::geography, 80467) -- 50 miles in meters
ORDER BY p.coordinates <-> $1
LIMIT 20;

-- Spatial index usage for contractor search
SELECT c.*,
       ST_Distance(c.coordinates::geography, ST_Point($1, $2)::geography) / 1609.34 as distance
FROM california_contractors c
WHERE ST_DWithin(c.coordinates::geography, ST_Point($1, $2)::geography, 32187) -- 20 miles
  AND c.is_namc_member = false
ORDER BY c.coordinates <-> ST_Point($1, $2)
LIMIT 100;
```

**Full-Text Search Optimization:**
```sql
-- Multi-table search with ranking
WITH project_search AS (
  SELECT 'project' as type, id, title as name, description, 
         ts_rank(to_tsvector('english', title || ' ' || description), query) as rank
  FROM projects, to_tsquery('english', $1) query
  WHERE to_tsvector('english', title || ' ' || description) @@ query
    AND status = 'PUBLISHED'
),
user_search AS (
  SELECT 'user' as type, id, (first_name || ' ' || last_name) as name, bio as description,
         ts_rank(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(company, '')), query) as rank
  FROM users, to_tsquery('english', $1) query
  WHERE to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(company, '')) @@ query
    AND is_active = true
)
SELECT * FROM project_search
UNION ALL
SELECT * FROM user_search
ORDER BY rank DESC, name
LIMIT 20;
```

### 3. Table Partitioning Strategy

**Time-Based Partitioning for Large Tables:**
```sql
-- Partition admin_actions by month
CREATE TABLE admin_actions (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    action admin_action_type NOT NULL,
    user_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE admin_actions_2024_01 PARTITION OF admin_actions
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE admin_actions_2024_02 PARTITION OF admin_actions
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for each month

-- Automatic partition creation function
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Partition system_metrics by day for high-volume data
CREATE TABLE system_metrics (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    metric text NOT NULL,
    value double precision NOT NULL,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL
) PARTITION BY RANGE (recorded_at);
```

### 4. Connection Pooling Configuration

**PgBouncer Configuration:**
```ini
[databases]
namc_portal = host=localhost port=5432 dbname=namc_portal user=app_user

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = users.txt
admin_users = admin
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 100
min_pool_size = 10
reserve_pool_size = 5
max_db_connections = 200
log_connections = 1
log_disconnections = 1
```

**Application Connection Strategy:**
```typescript
// Database connection configuration
const databaseConfig = {
  // Primary database for reads and writes
  primary: {
    url: process.env.DATABASE_URL,
    maxConnections: 50,
    minConnections: 5,
    idleTimeout: 300000, // 5 minutes
    connectionTimeout: 30000, // 30 seconds
  },
  
  // Read replica for read-only queries
  replica: {
    url: process.env.DATABASE_REPLICA_URL,
    maxConnections: 30,
    minConnections: 3,
    idleTimeout: 300000,
    connectionTimeout: 30000,
  }
}

// Smart connection routing
export class DatabaseManager {
  private primaryClient: PrismaClient
  private replicaClient: PrismaClient
  
  constructor() {
    this.primaryClient = new PrismaClient({
      datasources: { db: { url: databaseConfig.primary.url } }
    })
    
    this.replicaClient = new PrismaClient({
      datasources: { db: { url: databaseConfig.replica.url } }
    })
  }
  
  // Route read queries to replica
  getReadClient(): PrismaClient {
    return this.replicaClient
  }
  
  // Route write queries to primary
  getWriteClient(): PrismaClient {
    return this.primaryClient
  }
  
  // Transaction always goes to primary
  async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.primaryClient.$transaction(fn)
  }
}
```

## 📊 Performance Monitoring & Metrics

### 1. Query Performance Analysis

**Slow Query Monitoring:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT query, 
       calls,
       total_time,
       mean_time,
       rows,
       100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 20;

-- Index usage analysis
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
ORDER BY n_distinct DESC;
```

**Database Health Monitoring:**
```sql
-- Connection monitoring
SELECT state, count(*) 
FROM pg_stat_activity 
WHERE state IS NOT NULL 
GROUP BY state;

-- Cache hit ratio (should be > 95%)
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit)  as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

-- Table sizes and maintenance needs
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
       n_tup_ins, n_tup_upd, n_tup_del, n_live_tup, n_dead_tup
FROM pg_stat_user_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Application-Level Monitoring

**Query Performance Tracking:**
```typescript
// Prisma middleware for query monitoring
export const performanceMiddleware: Prisma.Middleware = async (params, next) => {
  const start = Date.now()
  const result = await next(params)
  const duration = Date.now() - start
  
  // Log slow queries
  if (duration > 1000) {
    console.warn(`Slow query detected:`, {
      model: params.model,
      action: params.action,
      duration: `${duration}ms`,
      args: params.args
    })
  }
  
  // Track metrics
  await trackMetric('database.query.duration', duration, {
    model: params.model,
    action: params.action
  })
  
  return result
}

// Connection pool monitoring
export const monitorConnectionPool = () => {
  setInterval(async () => {
    const poolStats = await prisma.$queryRaw`
      SELECT numbackends, 
             active, 
             idle, 
             idle_in_transaction,
             idle_in_transaction_aborted
      FROM pg_stat_database 
      WHERE datname = current_database()
    `
    
    await recordMetrics('database.connections', poolStats)
  }, 60000) // Every minute
}
```

## 🔄 Data Migration Strategies

### 1. Schema Migration Patterns

**Safe Migration Practices:**
```sql
-- 1. Add new columns as nullable first
ALTER TABLE users ADD COLUMN new_field text;

-- 2. Populate data gradually
UPDATE users SET new_field = 'default_value' WHERE new_field IS NULL;

-- 3. Add constraints after data population
ALTER TABLE users ALTER COLUMN new_field SET NOT NULL;
ALTER TABLE users ALTER COLUMN new_field SET DEFAULT 'default_value';

-- 4. Create indexes concurrently to avoid table locks
CREATE INDEX CONCURRENTLY idx_users_new_field ON users(new_field);

-- 5. Drop old columns after verification
-- ALTER TABLE users DROP COLUMN old_field; -- Only after confirming new field works
```

**Large Table Modifications:**
```sql
-- For large tables, use batched updates to avoid long-running transactions
DO $$
DECLARE
    batch_size integer := 1000;
    total_rows integer;
    processed integer := 0;
BEGIN
    SELECT COUNT(*) INTO total_rows FROM large_table WHERE condition;
    
    WHILE processed < total_rows LOOP
        UPDATE large_table 
        SET new_column = calculate_value(old_column)
        WHERE id IN (
            SELECT id FROM large_table 
            WHERE condition AND new_column IS NULL
            LIMIT batch_size
        );
        
        processed := processed + batch_size;
        COMMIT;
        
        -- Progress logging
        RAISE NOTICE 'Processed % of % rows (%.1f%%)', 
                     processed, total_rows, (processed::float / total_rows * 100);
    END LOOP;
END $$;
```

### 2. Data Import Optimization

**Bulk Import Strategies:**
```sql
-- Disable indexes and constraints for bulk imports
ALTER TABLE temp_import_table DISABLE TRIGGER ALL;
DROP INDEX IF EXISTS idx_temp_import_field;

-- Use COPY for fastest imports
COPY temp_import_table FROM '/path/to/data.csv' WITH (FORMAT csv, HEADER true);

-- Re-enable constraints and rebuild indexes
CREATE INDEX CONCURRENTLY idx_temp_import_field ON temp_import_table(field);
ALTER TABLE temp_import_table ENABLE TRIGGER ALL;

-- Analyze table after import
ANALYZE temp_import_table;
```

**California Contractor Data Import:**
```typescript
// Optimized contractor data import
export async function importContractorData(filePath: string) {
  const batchSize = 1000
  const stream = fs.createReadStream(filePath)
  const parser = csv.parse({ headers: true })
  
  let batch: ContractorRecord[] = []
  let processed = 0
  
  return new Promise((resolve, reject) => {
    stream
      .pipe(parser)
      .on('data', async (row) => {
        batch.push(transformContractorData(row))
        
        if (batch.length >= batchSize) {
          try {
            await prisma.californiaContractor.createMany({
              data: batch,
              skipDuplicates: true
            })
            
            processed += batch.length
            console.log(`Imported ${processed} contractors`)
            batch = []
          } catch (error) {
            console.error('Batch import error:', error)
          }
        }
      })
      .on('end', async () => {
        // Import remaining records
        if (batch.length > 0) {
          await prisma.californiaContractor.createMany({
            data: batch,
            skipDuplicates: true
          })
        }
        
        // Update search indexes
        await prisma.$executeRaw`REFRESH MATERIALIZED VIEW contractor_search_index`
        
        resolve(processed)
      })
      .on('error', reject)
  })
}
```

## 🔒 Security & Compliance

### 1. Data Encryption

**Column-Level Encryption:**
```sql
-- Install pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE TABLE secure_data (
    id text PRIMARY KEY,
    user_id text NOT NULL,
    encrypted_ssn text, -- pgp_sym_encrypt(ssn, 'encryption_key')
    encrypted_bank_info text,
    created_at timestamp with time zone DEFAULT now()
);

-- Encryption functions
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data text) 
RETURNS text AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data text) 
RETURNS text AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Row-Level Security (RLS)

**Implement RLS for Multi-Tenant Security:**
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users
    FOR ALL
    TO application_role
    USING (id = current_setting('app.current_user_id')::text);

-- Message privacy policy
CREATE POLICY message_participants ON messages
    FOR ALL
    TO application_role
    USING (
        sender_id = current_setting('app.current_user_id')::text OR 
        receiver_id = current_setting('app.current_user_id')::text
    );

-- Admin override policy
CREATE POLICY admin_override ON users
    FOR ALL
    TO admin_role
    USING (true);
```

### 3. Audit Trail Implementation

**Comprehensive Audit System:**
```sql
-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), 
                current_setting('app.current_user_id', true), now());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW),
                current_setting('app.current_user_id', true), now());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD),
                current_setting('app.current_user_id', true), now());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER projects_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 📈 Scalability Planning

### 1. Read Replica Configuration

**Primary-Replica Setup:**
```bash
# Primary server postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64
synchronous_commit = on

# Replica server postgresql.conf
hot_standby = on
max_standby_streaming_delay = 30s
```

**Application-Level Read Routing:**
```typescript
export class ScalableDatabaseClient {
  private primary: PrismaClient
  private replicas: PrismaClient[]
  private currentReplicaIndex = 0
  
  constructor() {
    this.primary = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_PRIMARY_URL } }
    })
    
    this.replicas = [
      new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_REPLICA_1_URL } }
      }),
      new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_REPLICA_2_URL } }
      })
    ]
  }
  
  // Load balance read queries across replicas
  getReadClient(): PrismaClient {
    const replica = this.replicas[this.currentReplicaIndex]
    this.currentReplicaIndex = (this.currentReplicaIndex + 1) % this.replicas.length
    return replica
  }
  
  // All writes go to primary
  getWriteClient(): PrismaClient {
    return this.primary
  }
  
  // Smart query routing
  async executeQuery<T>(
    query: (client: PrismaClient) => Promise<T>,
    options: { writeRequired?: boolean } = {}
  ): Promise<T> {
    const client = options.writeRequired ? this.getWriteClient() : this.getReadClient()
    
    try {
      return await query(client)
    } catch (error) {
      // Fallback to primary on replica failure
      if (!options.writeRequired) {
        console.warn('Replica query failed, falling back to primary:', error)
        return await query(this.getWriteClient())
      }
      throw error
    }
  }
}
```

### 2. Horizontal Scaling Strategies

**Sharding Strategy for Large Datasets:**
```sql
-- Shard california_contractors by region
CREATE TABLE california_contractors_north (
    CHECK (region = 'NORTH')
) INHERITS (california_contractors);

CREATE TABLE california_contractors_south (
    CHECK (region = 'SOUTH')
) INHERITS (california_contractors);

-- Partition function
CREATE OR REPLACE FUNCTION route_contractor_insert()
RETURNS trigger AS $$
BEGIN
    IF NEW.region = 'NORTH' THEN
        INSERT INTO california_contractors_north VALUES (NEW.*);
    ELSIF NEW.region = 'SOUTH' THEN
        INSERT INTO california_contractors_south VALUES (NEW.*);
    ELSE
        RAISE EXCEPTION 'Unknown region: %', NEW.region;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contractor_partition_trigger
    BEFORE INSERT ON california_contractors
    FOR EACH ROW EXECUTE FUNCTION route_contractor_insert();
```

## 🎯 Performance Benchmarks & SLAs

### Target Performance Metrics

**Database Performance SLAs:**
```typescript
const performanceSLAs = {
  // Query response times (95th percentile)
  simpleQueries: '< 50ms',      // Single table selects
  complexQueries: '< 200ms',    // Joins, aggregations
  searchQueries: '< 500ms',     // Full-text search
  reportQueries: '< 2000ms',    // Analytics queries
  
  // Connection metrics
  connectionAcquisition: '< 100ms',
  maxConnections: 200,
  poolUtilization: '< 80%',
  
  // Availability
  uptime: '99.9%',
  backupRecovery: '< 4 hours',
  pointInTimeRecovery: '< 1 hour',
  
  // Throughput
  readsPerSecond: 1000,
  writesPerSecond: 200,
  concurrentUsers: 500
}
```

**Monitoring Alerts:**
```typescript
const alertThresholds = {
  slowQuery: 1000,           // Alert on queries > 1 second
  connectionPoolHigh: 160,   // Alert when pool > 80% full
  cacheHitLow: 0.90,        // Alert when cache hit rate < 90%
  diskSpaceHigh: 0.85,      // Alert when disk > 85% full
  replicationLag: 30000,    // Alert when replica lag > 30 seconds
}

// Automated performance monitoring
export async function monitorDatabaseHealth() {
  const health = await checkDatabaseHealth()
  
  if (health.slowQueries > alertThresholds.slowQuery) {
    await sendAlert('SLOW_QUERIES', health.slowQueries)
  }
  
  if (health.connectionPool > alertThresholds.connectionPoolHigh) {
    await sendAlert('HIGH_CONNECTION_USAGE', health.connectionPool)
  }
  
  if (health.cacheHitRate < alertThresholds.cacheHitLow) {
    await sendAlert('LOW_CACHE_HIT_RATE', health.cacheHitRate)
  }
}
```

## 🔧 Maintenance & Operations

### 1. Automated Maintenance Tasks

**Database Maintenance Cron Jobs:**
```sql
-- Vacuum and analyze critical tables (run nightly)
CREATE OR REPLACE FUNCTION maintenance_vacuum_analyze()
RETURNS void AS $$
BEGIN
    -- Vacuum frequently updated tables
    VACUUM ANALYZE users;
    VACUUM ANALYZE projects;
    VACUUM ANALYZE messages;
    VACUUM ANALYZE project_applications;
    VACUUM ANALYZE event_registrations;
    
    -- Full vacuum for heavily deleted tables (weekly)
    IF EXTRACT(dow FROM now()) = 0 THEN -- Sunday
        VACUUM FULL admin_actions_old_partitions;
    END IF;
    
    -- Update table statistics
    ANALYZE;
    
    -- Log maintenance completion
    INSERT INTO system_metrics (metric, value, metadata) 
    VALUES ('maintenance.vacuum_analyze', 1, '{"completed_at": "' || now() || '"}');
END;
$$ LANGUAGE plpgsql;

-- Partition maintenance
CREATE OR REPLACE FUNCTION maintain_partitions()
RETURNS void AS $$
BEGIN
    -- Create next month's partition for admin_actions
    PERFORM create_monthly_partition('admin_actions', date_trunc('month', now() + interval '1 month'));
    
    -- Drop old partitions (older than 2 years)
    EXECUTE format('DROP TABLE IF EXISTS admin_actions_%s', 
                   to_char(now() - interval '2 years', 'YYYY_MM'));
    
    -- Archive old system_metrics (older than 90 days)
    DELETE FROM system_metrics WHERE recorded_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;
```

### 2. Backup and Recovery Strategy

**Backup Configuration:**
```bash
#!/bin/bash
# Daily backup script

DB_NAME="namc_portal"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

# Full database backup
pg_dump -h localhost -U postgres -F c -b -v -f "$BACKUP_DIR/namc_portal_$DATE.backup" $DB_NAME

# Incremental WAL backup
pg_basebackup -h localhost -U postgres -D "$BACKUP_DIR/wal_$DATE" -F tar -z -P

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.backup" -mtime +30 -delete
find $BACKUP_DIR -name "wal_*" -mtime +7 -delete

# Upload to S3 for offsite storage
aws s3 cp "$BACKUP_DIR/namc_portal_$DATE.backup" s3://namc-portal-backups/daily/
```

**Point-in-Time Recovery Setup:**
```bash
# postgresql.conf settings for PITR
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'
wal_level = replica
max_wal_senders = 3
```

---

*This database optimization design provides a comprehensive foundation for high-performance, scalable, and maintainable data operations. Regular monitoring and optimization ensure the system continues to meet growing demands while maintaining reliability and security standards.*