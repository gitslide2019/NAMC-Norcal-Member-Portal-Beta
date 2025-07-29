#!/bin/sh
# Docker entrypoint script for NAMC NorCal Member Portal
# Handles initialization, database migrations, and application startup

set -e

echo "🚀 Starting NAMC NorCal Member Portal..."
echo "Environment: ${NODE_ENV:-production}"
echo "Build Time: ${BUILD_TIME:-unknown}"
echo "Git SHA: ${GIT_SHA:-unknown}"

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for database connection..."
    
    # Extract database host and port from DATABASE_URL
    if [ -n "$DATABASE_URL" ]; then
        # Parse DATABASE_URL to get host and port
        DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        
        if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
            echo "📊 Checking database connection to $DB_HOST:$DB_PORT..."
            
            # Wait for database to be ready
            timeout=60
            while [ $timeout -gt 0 ]; do
                if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
                    echo "✅ Database is ready!"
                    return 0
                fi
                
                echo "⏳ Database not ready, waiting... (${timeout}s remaining)"
                sleep 2
                timeout=$((timeout - 2))
            done
            
            echo "❌ Database connection timeout!"
            exit 1
        else
            echo "⚠️  Could not parse database host/port from DATABASE_URL"
        fi
    else
        echo "⚠️  DATABASE_URL not set, skipping database check"
    fi
}

# Function to run database migrations
run_migrations() {
    if [ -n "$DATABASE_URL" ]; then
        echo "🔄 Running database migrations..."
        
        # Check if migrations directory exists
        if [ -d "./prisma/migrations" ]; then
            npx prisma migrate deploy
            echo "✅ Database migrations completed"
        else
            echo "⚠️  No migrations directory found, skipping migrations"
        fi
    else
        echo "⚠️  DATABASE_URL not set, skipping migrations"
    fi
}

# Function to seed database (development only)
seed_database() {
    if [ "$NODE_ENV" = "development" ] && [ -n "$DATABASE_URL" ]; then
        echo "🌱 Seeding development database..."
        
        if [ -f "./prisma/seed.ts" ]; then
            npx tsx ./prisma/seed.ts
            echo "✅ Database seeding completed"
        else
            echo "⚠️  No seed file found, skipping seeding"
        fi
    fi
}

# Function to validate environment
validate_environment() {
    echo "🔍 Validating environment..."
    
    # Required environment variables
    required_vars="DATABASE_URL JWT_SECRET"
    missing_vars=""
    
    for var in $required_vars; do
        if [ -z "$(eval echo \$$var)" ]; then
            missing_vars="$missing_vars $var"
        fi
    done
    
    if [ -n "$missing_vars" ]; then
        echo "❌ Missing required environment variables:$missing_vars"
        exit 1
    fi
    
    # Validate JWT_SECRET length
    if [ ${#JWT_SECRET} -lt 32 ]; then
        echo "❌ JWT_SECRET must be at least 32 characters long"
        exit 1
    fi
    
    echo "✅ Environment validation passed"
}

# Function to setup logging
setup_logging() {
    echo "📝 Setting up logging..."
    
    # Create logs directory if it doesn't exist
    mkdir -p /app/logs
    
    # Set log file permissions
    touch /app/logs/app.log
    touch /app/logs/error.log
    
    echo "✅ Logging setup completed"
}

# Function to cleanup on shutdown
cleanup() {
    echo "🛑 Shutting down gracefully..."
    
    # Kill any background processes
    pkill -P $$ 2>/dev/null || true
    
    echo "✅ Cleanup completed"
    exit 0
}

# Function to handle startup health check
startup_health_check() {
    echo "🏥 Running startup health check..."
    
    # Check if all required files exist
    required_files="server.js package.json"
    for file in $required_files; do
        if [ ! -f "./$file" ]; then
            echo "❌ Required file not found: $file"
            exit 1
        fi
    done
    
    # Check Node.js version
    node_version=$(node --version)
    echo "📦 Node.js version: $node_version"
    
    # Check available memory
    if [ -f "/proc/meminfo" ]; then
        available_memory=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
        if [ "$available_memory" -lt 512000 ]; then
            echo "⚠️  Low memory available: ${available_memory}KB"
        fi
    fi
    
    echo "✅ Startup health check passed"
}

# Setup signal handlers
trap cleanup TERM INT

# Main execution
main() {
    echo "🔧 Starting initialization sequence..."
    
    # Run initialization steps
    validate_environment
    setup_logging
    startup_health_check
    wait_for_db
    run_migrations
    seed_database
    
    echo "🎯 Initialization completed successfully!"
    echo "🚀 Starting application server..."
    
    # Start the application
    exec node server.js
}

# Run main function
main "$@"