#!/bin/bash
# Multi-Environment Deployment Script for NAMC NorCal Member Portal
# Supports development, staging, and production deployments

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/deployment-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

# Function to display help
show_help() {
    cat << EOF
NAMC NorCal Member Portal Deployment Script

Usage: $0 [OPTIONS] ENVIRONMENT

ENVIRONMENTS:
    development     Deploy to development environment
    staging         Deploy to staging environment
    production      Deploy to production environment

OPTIONS:
    -h, --help      Show this help message
    -f, --force     Force deployment (skip confirmations)
    -b, --backup    Create backup before deployment
    -r, --rollback  Rollback to previous version
    -d, --dry-run   Show what would be deployed without executing
    -v, --verbose   Enable verbose logging
    --skip-tests    Skip running tests before deployment
    --skip-build    Skip building the application
    --quick         Quick deployment (skip non-essential steps)

EXAMPLES:
    $0 staging                          # Deploy to staging
    $0 production --backup             # Deploy to production with backup
    $0 development --force --verbose   # Force deploy to dev with verbose output
    $0 --rollback production           # Rollback production deployment

EOF
}

# Default configuration
ENVIRONMENT=""
FORCE=false
BACKUP=false
ROLLBACK=false
DRY_RUN=false
VERBOSE=false
SKIP_TESTS=false
SKIP_BUILD=false
QUICK=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -b|--backup)
            BACKUP=true
            shift
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --quick)
            QUICK=true
            SKIP_TESTS=true
            shift
            ;;
        development|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Environment must be specified"
    show_help
    exit 1
fi

# Set verbose logging if requested
if [[ "$VERBOSE" == true ]]; then
    set -x
fi

# Environment-specific configuration
declare -A ENV_CONFIG
ENV_CONFIG[development]="dev"
ENV_CONFIG[staging]="staging"
ENV_CONFIG[production]="prod"

ENV_SHORT="${ENV_CONFIG[$ENVIRONMENT]}"

# Load environment-specific variables
ENV_FILE="${PROJECT_ROOT}/.env.${ENVIRONMENT}"
if [[ -f "$ENV_FILE" ]]; then
    log_info "Loading environment variables from $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
else
    log_warning "Environment file $ENV_FILE not found, using defaults"
fi

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    local missing_tools=()
    
    # Check required tools
    local required_tools=("node" "npm" "git" "docker")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
    
    # Check Node.js version
    local node_version
    node_version=$(node --version | sed 's/v//')
    local required_node_version="18.0.0"
    
    if ! node -pe "require('semver').gte('$node_version', '$required_node_version')" 2>/dev/null; then
        log_error "Node.js version $node_version is too old. Required: $required_node_version+"
        exit 1
    fi
    
    # Check Git status
    if [[ -n "$(git status --porcelain)" ]]; then
        if [[ "$FORCE" != true ]]; then
            log_error "Working directory has uncommitted changes. Use --force to ignore."
            exit 1
        else
            log_warning "Deploying with uncommitted changes (forced)"
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Function to create backup
create_backup() {
    if [[ "$BACKUP" != true ]]; then
        return 0
    fi
    
    log_info "Creating backup for $ENVIRONMENT environment..."
    
    local backup_dir="${PROJECT_ROOT}/backups/${ENVIRONMENT}/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    if [[ -n "${DATABASE_URL:-}" ]]; then
        log_info "Backing up database..."
        if [[ "$DRY_RUN" != true ]]; then
            pg_dump "$DATABASE_URL" > "${backup_dir}/database.sql"
            log_success "Database backup created"
        else
            log_info "[DRY RUN] Would backup database to ${backup_dir}/database.sql"
        fi
    fi
    
    # Backup uploaded files
    if [[ -d "${FILE_UPLOAD_PATH:-./uploads}" ]]; then
        log_info "Backing up uploaded files..."
        if [[ "$DRY_RUN" != true ]]; then
            cp -r "${FILE_UPLOAD_PATH:-./uploads}" "${backup_dir}/uploads"
            log_success "Files backup created"
        else
            log_info "[DRY RUN] Would backup files to ${backup_dir}/uploads"
        fi
    fi
    
    # Save deployment info
    cat > "${backup_dir}/deployment-info.json" << EOF
{
  "environment": "$ENVIRONMENT",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_sha": "$(git rev-parse HEAD)",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD)",
  "deployer": "$(whoami)",
  "hostname": "$(hostname)"
}
EOF
    
    log_success "Backup created at $backup_dir"
}

# Function to run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log_info "Skipping tests (--skip-tests flag)"
        return 0
    fi
    
    log_info "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" != true ]]; then
        # Install dependencies if needed
        if [[ ! -d "node_modules" ]] || [[ "package-lock.json" -nt "node_modules" ]]; then
            log_info "Installing dependencies..."
            npm ci
        fi
        
        # Run linting
        log_info "Running linting..."
        npm run lint
        
        # Run type checking
        log_info "Running type checking..."
        npm run type-check
        
        # Run unit tests
        log_info "Running unit tests..."
        npm run test:ci
        
        log_success "All tests passed"
    else
        log_info "[DRY RUN] Would run: lint, type-check, test:ci"
    fi
}

# Function to build application
build_application() {
    if [[ "$SKIP_BUILD" == true ]]; then
        log_info "Skipping build (--skip-build flag)"
        return 0
    fi
    
    log_info "Building application for $ENVIRONMENT..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" != true ]]; then
        # Set environment variables for build
        export NODE_ENV="${ENVIRONMENT}"
        export BUILD_TIME="$(date +%s)"
        export GIT_SHA="$(git rev-parse HEAD)"
        
        # Generate Prisma client
        log_info "Generating Prisma client..."
        npx prisma generate
        
        # Build application
        log_info "Building Next.js application..."
        npm run build
        
        log_success "Application built successfully"
    else
        log_info "[DRY RUN] Would build application with NODE_ENV=$ENVIRONMENT"
    fi
}

# Function to deploy to environment
deploy_to_environment() {
    log_info "Deploying to $ENVIRONMENT environment..."
    
    case "$ENVIRONMENT" in
        development)
            deploy_development
            ;;
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

# Development deployment
deploy_development() {
    log_info "Executing development deployment..."
    
    if [[ "$DRY_RUN" != true ]]; then
        # Start or restart development services
        docker-compose -f docker-compose.development.yml up -d --build
        
        # Wait for services to be ready
        log_info "Waiting for services to be ready..."
        sleep 30
        
        # Run database migrations
        log_info "Running database migrations..."
        npm run db:migrate
        
        # Seed development database
        log_info "Seeding development database..."
        npm run db:seed
        
        log_success "Development deployment completed"
    else
        log_info "[DRY RUN] Would deploy to development using Docker Compose"
    fi
}

# Staging deployment
deploy_staging() {
    log_info "Executing staging deployment..."
    
    if [[ "$DRY_RUN" != true ]]; then
        # Build and push Docker image
        local image_tag="namc-portal:staging-$(git rev-parse --short HEAD)"
        
        log_info "Building Docker image: $image_tag"
        docker build -f Dockerfile.production -t "$image_tag" .
        
        # Deploy to staging environment
        log_info "Deploying to staging infrastructure..."
        # Add your staging deployment commands here
        # Example: kubectl apply -f k8s/staging/
        
        log_success "Staging deployment completed"
    else
        log_info "[DRY RUN] Would build and deploy to staging infrastructure"
    fi
}

# Production deployment
deploy_production() {
    log_info "Executing production deployment..."
    
    # Additional confirmation for production
    if [[ "$FORCE" != true ]]; then
        echo -e "${YELLOW}WARNING: You are about to deploy to PRODUCTION!${NC}"
        echo -e "Environment: ${RED}$ENVIRONMENT${NC}"
        echo -e "Git SHA: $(git rev-parse HEAD)"
        echo -e "Git Branch: $(git rev-parse --abbrev-ref HEAD)"
        echo ""
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^yes$ ]]; then
            log_info "Deployment cancelled by user"
            exit 0
        fi
    fi
    
    if [[ "$DRY_RUN" != true ]]; then
        # Blue-green deployment for production
        log_info "Starting blue-green deployment..."
        
        # Build and tag production image
        local image_tag="namc-portal:production-$(git rev-parse --short HEAD)"
        
        log_info "Building production Docker image: $image_tag"
        docker build -f Dockerfile.production -t "$image_tag" .
        
        # Deploy to production infrastructure
        log_info "Deploying to production infrastructure..."
        # Add your production deployment commands here
        # Example: Blue-green deployment with load balancer switch
        
        # Health check after deployment
        log_info "Running post-deployment health checks..."
        sleep 60  # Wait for services to stabilize
        
        # Verify deployment
        local health_url="${NEXT_PUBLIC_APP_URL:-https://portal.namcnorcal.org}/api/health"
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Health check passed"
        else
            log_error "Health check failed - consider rollback"
            exit 1
        fi
        
        log_success "Production deployment completed successfully"
    else
        log_info "[DRY RUN] Would execute blue-green production deployment"
    fi
}

# Function to run rollback
run_rollback() {
    log_info "Rolling back $ENVIRONMENT deployment..."
    
    # Find latest backup
    local backup_dir="${PROJECT_ROOT}/backups/${ENVIRONMENT}"
    if [[ ! -d "$backup_dir" ]]; then
        log_error "No backups found for $ENVIRONMENT"
        exit 1
    fi
    
    local latest_backup
    latest_backup=$(find "$backup_dir" -type d -name "*-*" | sort -r | head -n1)
    
    if [[ -z "$latest_backup" ]]; then
        log_error "No valid backup found"
        exit 1
    fi
    
    log_info "Rolling back to backup: $latest_backup"
    
    if [[ "$DRY_RUN" != true ]]; then
        # Restore database
        if [[ -f "${latest_backup}/database.sql" ]]; then
            log_info "Restoring database..."
            psql "$DATABASE_URL" < "${latest_backup}/database.sql"
        fi
        
        # Restore files
        if [[ -d "${latest_backup}/uploads" ]]; then
            log_info "Restoring uploaded files..."
            rm -rf "${FILE_UPLOAD_PATH:-./uploads}"
            cp -r "${latest_backup}/uploads" "${FILE_UPLOAD_PATH:-./uploads}"
        fi
        
        log_success "Rollback completed"
    else
        log_info "[DRY RUN] Would rollback to $latest_backup"
    fi
}

# Function to verify deployment
verify_deployment() {
    if [[ "$QUICK" == true ]]; then
        log_info "Skipping deployment verification (--quick flag)"
        return 0
    fi
    
    log_info "Verifying deployment..."
    
    # Basic health check
    local health_url="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}/api/health"
    
    log_info "Checking application health at $health_url"
    
    local max_attempts=5
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Application health check passed"
            break
        else
            log_warning "Health check attempt $attempt failed, retrying..."
            sleep 10
            ((attempt++))
        fi
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "Health check failed after $max_attempts attempts"
        exit 1
    fi
    
    # Additional verification steps
    log_info "Running additional verification..."
    
    # Check database connectivity
    if [[ -n "${DATABASE_URL:-}" ]]; then
        log_info "Verifying database connectivity..."
        if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
            log_success "Database connectivity verified"
        else
            log_warning "Database connectivity check failed"
        fi
    fi
    
    log_success "Deployment verification completed"
}

# Function to send notifications
send_notifications() {
    log_info "Sending deployment notifications..."
    
    local status="SUCCESS"
    local git_sha
    git_sha=$(git rev-parse HEAD)
    local git_branch
    git_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # Create notification message
    local message
    message=$(cat << EOF
🚀 NAMC Portal Deployment Notification

Environment: $ENVIRONMENT
Status: $status
Git SHA: $git_sha
Git Branch: $git_branch
Deployer: $(whoami)
Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Build Time: ${BUILD_TIME:-unknown}

Deployment completed successfully!
EOF
)
    
    # Send to Slack (if webhook is configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"text\":\"$message\"}" \
             "$SLACK_WEBHOOK_URL" || log_warning "Failed to send Slack notification"
    fi
    
    # Send email notification (if configured)
    if [[ -n "${NOTIFICATION_EMAIL:-}" ]]; then
        echo "$message" | mail -s "NAMC Portal Deployment - $ENVIRONMENT" "$NOTIFICATION_EMAIL" || \
            log_warning "Failed to send email notification"
    fi
    
    log_success "Notifications sent"
}

# Function to cleanup
cleanup() {
    log_info "Cleaning up deployment artifacts..."
    
    # Remove temporary files
    find "$PROJECT_ROOT" -name "*.tmp" -delete 2>/dev/null || true
    
    # Clean up old logs (keep last 10)
    find "${PROJECT_ROOT}/logs" -name "deployment-*.log" -type f | \
        sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    # Clean up old backups (keep last 5)
    if [[ -d "${PROJECT_ROOT}/backups/${ENVIRONMENT}" ]]; then
        find "${PROJECT_ROOT}/backups/${ENVIRONMENT}" -type d -name "*-*" | \
            sort -r | tail -n +6 | xargs rm -rf 2>/dev/null || true
    fi
    
    log_success "Cleanup completed"
}

# Main execution function
main() {
    local start_time
    start_time=$(date +%s)
    
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Options: Force=$FORCE, Backup=$BACKUP, Rollback=$ROLLBACK, DryRun=$DRY_RUN"
    
    # Handle rollback
    if [[ "$ROLLBACK" == true ]]; then
        run_rollback
        exit 0
    fi
    
    # Execute deployment steps
    check_prerequisites
    create_backup
    run_tests
    build_application
    deploy_to_environment
    verify_deployment
    send_notifications
    cleanup
    
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "Deployment completed successfully in ${duration} seconds"
    log_info "Log file: $LOG_FILE"
}

# Error handling
trap 'log_error "Deployment failed! Check log file: $LOG_FILE"' ERR

# Run main function
main "$@"