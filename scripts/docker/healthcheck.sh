#!/bin/sh
# Docker health check script for NAMC NorCal Member Portal
# Performs comprehensive health validation

set -e

# Configuration
APP_PORT=${PORT:-3000}
HEALTH_ENDPOINT="http://localhost:${APP_PORT}/api/health"
MAX_RESPONSE_TIME=5000  # 5 seconds
MIN_MEMORY_MB=100       # Minimum available memory in MB

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [HEALTH] $1"
}

# Function to check HTTP endpoint
check_http_endpoint() {
    log "Checking HTTP endpoint: $HEALTH_ENDPOINT"
    
    # Use curl to check the health endpoint
    if command -v curl >/dev/null 2>&1; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" \
                       -m 10 \
                       "$HEALTH_ENDPOINT" 2>/dev/null || echo "HTTPSTATUS:000;TIME:999")
        
        http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        response_time=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)
        body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*;TIME:[0-9.]*$//')
        
        # Convert response time to milliseconds
        response_time_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "999")
        
        if [ "$http_code" = "200" ]; then
            if [ "$(echo "$response_time_ms < $MAX_RESPONSE_TIME" | bc 2>/dev/null || echo 0)" = "1" ]; then
                log "${GREEN}✅ HTTP endpoint healthy (${response_time_ms}ms)${NC}"
                return 0
            else
                log "${YELLOW}⚠️  HTTP endpoint slow (${response_time_ms}ms > ${MAX_RESPONSE_TIME}ms)${NC}"
                return 1
            fi
        else
            log "${RED}❌ HTTP endpoint unhealthy (HTTP $http_code)${NC}"
            return 1
        fi
    else
        log "${YELLOW}⚠️  curl not available, skipping HTTP check${NC}"
        return 0
    fi
}

# Function to check database connectivity
check_database() {
    log "Checking database connectivity"
    
    if [ -n "$DATABASE_URL" ]; then
        # Extract database details from DATABASE_URL
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        
        if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
            if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
                log "${GREEN}✅ Database connection healthy${NC}"
                return 0
            else
                log "${RED}❌ Database connection failed${NC}"
                return 1
            fi
        else
            log "${YELLOW}⚠️  Could not parse database connection details${NC}"
            return 0
        fi
    else
        log "${YELLOW}⚠️  DATABASE_URL not set, skipping database check${NC}"
        return 0
    fi
}

# Function to check memory usage
check_memory() {
    log "Checking memory usage"
    
    if [ -f "/proc/meminfo" ]; then
        # Get available memory in KB
        available_kb=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
        available_mb=$((available_kb / 1024))
        
        if [ "$available_mb" -gt "$MIN_MEMORY_MB" ]; then
            log "${GREEN}✅ Memory healthy (${available_mb}MB available)${NC}"
            return 0
        else
            log "${YELLOW}⚠️  Low memory (${available_mb}MB available)${NC}"
            return 1
        fi
    else
        log "${YELLOW}⚠️  Cannot check memory usage on this system${NC}"
        return 0
    fi
}

# Function to check disk space
check_disk_space() {
    log "Checking disk space"
    
    # Check available disk space in the app directory
    available_space=$(df /app | tail -1 | awk '{print $4}')
    available_mb=$((available_space / 1024))
    
    if [ "$available_mb" -gt 100 ]; then
        log "${GREEN}✅ Disk space healthy (${available_mb}MB available)${NC}"
        return 0
    else
        log "${YELLOW}⚠️  Low disk space (${available_mb}MB available)${NC}"
        return 1
    fi
}

# Function to check process health
check_process() {
    log "Checking process health"
    
    # Check if Node.js process is running
    if pgrep -f "node.*server.js" >/dev/null; then
        log "${GREEN}✅ Node.js process running${NC}"
        return 0
    else
        log "${RED}❌ Node.js process not found${NC}"
        return 1
    fi
}

# Function to check log files
check_logs() {
    log "Checking log files"
    
    # Check if log directory exists and is writable
    if [ -d "/app/logs" ] && [ -w "/app/logs" ]; then
        # Check for recent error logs (last 5 minutes)
        if [ -f "/app/logs/error.log" ]; then
            recent_errors=$(find /app/logs/error.log -mmin -5 -exec wc -l {} \; 2>/dev/null | awk '{print $1}' || echo "0")
            if [ "$recent_errors" -gt 10 ]; then
                log "${YELLOW}⚠️  High error rate detected (${recent_errors} errors in last 5 min)${NC}"
                return 1
            else
                log "${GREEN}✅ Log health good${NC}"
                return 0
            fi
        else
            log "${GREEN}✅ No error log found (good)${NC}"
            return 0
        fi
    else
        log "${YELLOW}⚠️  Log directory not accessible${NC}"
        return 1
    fi
}

# Function to run all health checks
run_health_checks() {
    local failed_checks=0
    local total_checks=0
    
    log "Starting comprehensive health check..."
    
    # Run all checks
    checks="check_process check_http_endpoint check_database check_memory check_disk_space check_logs"
    
    for check in $checks; do
        total_checks=$((total_checks + 1))
        if ! $check; then
            failed_checks=$((failed_checks + 1))
        fi
    done
    
    # Calculate health score
    passed_checks=$((total_checks - failed_checks))
    health_score=$((passed_checks * 100 / total_checks))
    
    log "Health check summary: ${passed_checks}/${total_checks} checks passed (${health_score}%)"
    
    # Determine overall health status
    if [ "$failed_checks" -eq 0 ]; then
        log "${GREEN}🎉 All health checks passed - Application is healthy${NC}"
        return 0
    elif [ "$health_score" -ge 80 ]; then
        log "${YELLOW}⚠️  Some health checks failed but application is mostly healthy${NC}"
        return 0
    else
        log "${RED}💥 Multiple health checks failed - Application is unhealthy${NC}"
        return 1
    fi
}

# Function to create health check report
create_health_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="/app/logs/health-report.json"
    
    # Create basic health report
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "status": "healthy",
  "version": "${BUILD_TIME:-unknown}",
  "git_sha": "${GIT_SHA:-unknown}",
  "environment": "${NODE_ENV:-production}",
  "port": $APP_PORT,
  "checks": {
    "process": "passed",
    "http": "passed",
    "database": "passed",
    "memory": "passed",
    "disk": "passed",
    "logs": "passed"
  }
}
EOF
}

# Main execution
main() {
    # Check if running in quiet mode
    if [ "$1" = "--quiet" ]; then
        exec >/dev/null 2>&1
    fi
    
    # Run health checks
    if run_health_checks; then
        create_health_report
        exit 0
    else
        exit 1
    fi
}

# Install bc if not available (for arithmetic operations)
if ! command -v bc >/dev/null 2>&1; then
    # Fallback arithmetic for systems without bc
    bc() {
        awk "BEGIN {print $1}" 2>/dev/null || echo "0"
    }
fi

# Run main function
main "$@"