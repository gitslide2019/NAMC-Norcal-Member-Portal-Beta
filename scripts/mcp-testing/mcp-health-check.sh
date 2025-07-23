#!/bin/bash

# MCP Health Check Script
# Comprehensive testing of all MCP servers to prevent breakages
# Usage: ./mcp-health-check.sh [--verbose] [--json] [--quick]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
MCP_CONFIG="$PROJECT_ROOT/.mcp.json"
VERBOSE=false
JSON_OUTPUT=false
QUICK_MODE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--verbose] [--json] [--quick]"
            exit 1
            ;;
    esac
done

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    if [[ "$JSON_OUTPUT" == "true" ]]; then
        echo "{\"timestamp\":\"$timestamp\",\"level\":\"$level\",\"message\":\"$message\"}"
    else
        case $level in
            "INFO")
                echo -e "${BLUE}[INFO]${NC} $message"
                ;;
            "SUCCESS")
                echo -e "${GREEN}[SUCCESS]${NC} $message"
                ;;
            "WARNING")
                echo -e "${YELLOW}[WARNING]${NC} $message"
                ;;
            "ERROR")
                echo -e "${RED}[ERROR]${NC} $message"
                ;;
        esac
    fi
    
    # Always log to file
    echo "[$timestamp] [$level] $message" >> "$LOG_DIR/health-check.log"
}

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Test function wrapper
run_test() {
    local test_name=$1
    local test_function=$2
    
    log "INFO" "Running test: $test_name"
    
    if [[ "$VERBOSE" == "true" ]]; then
        echo "  Starting: $test_name"
    fi
    
    if $test_function; then
        ((TESTS_PASSED++))
        log "SUCCESS" "$test_name PASSED"
        return 0
    else
        ((TESTS_FAILED++))
        FAILED_TESTS+=("$test_name")
        log "ERROR" "$test_name FAILED"
        return 1
    fi
}

# Phase 1: System Prerequisites Validation
test_node_version() {
    local node_version=$(node --version 2>/dev/null | sed 's/v//')
    if [[ -z "$node_version" ]]; then
        log "ERROR" "Node.js not found"
        return 1
    fi
    
    local major_version=$(echo "$node_version" | cut -d. -f1)
    if [[ "$major_version" -ge 18 ]]; then
        log "SUCCESS" "Node.js version $node_version (>= 18.0.0)"
        return 0
    else
        log "ERROR" "Node.js version $node_version is too old (< 18.0.0)"
        return 1
    fi
}

test_npm_availability() {
    if command -v npm &> /dev/null && command -v npx &> /dev/null; then
        local npm_version=$(npm --version)
        local npx_version=$(npx --version)
        log "SUCCESS" "npm v$npm_version and npx v$npx_version available"
        return 0
    else
        log "ERROR" "npm or npx not available"
        return 1
    fi
}

test_internet_connectivity() {
    if curl -s --connect-timeout 5 https://registry.npmjs.org/ > /dev/null; then
        log "SUCCESS" "Internet connectivity to NPM registry"
        return 0
    else
        log "WARNING" "No internet connectivity to NPM registry"
        return 1
    fi
}

test_project_permissions() {
    if [[ -r "$PROJECT_ROOT" && -w "$PROJECT_ROOT" ]]; then
        log "SUCCESS" "Project directory permissions OK"
        return 0
    else
        log "ERROR" "Insufficient project directory permissions"
        return 1
    fi
}

test_system_resources() {
    # Check available RAM (minimum 4GB)
    if command -v free &> /dev/null; then
        local available_ram=$(free -m | awk 'NR==2{printf "%d", $7}')
        if [[ "$available_ram" -gt 4000 ]]; then
            log "SUCCESS" "Sufficient RAM available: ${available_ram}MB"
            return 0
        else
            log "WARNING" "Low RAM available: ${available_ram}MB (< 4GB recommended)"
            return 1
        fi
    elif command -v vm_stat &> /dev/null; then
        # macOS - get total memory instead of just free pages
        local total_memory=$(sysctl -n hw.memsize)
        local total_memory_gb=$((total_memory / 1024 / 1024 / 1024))
        if [[ "$total_memory_gb" -gt 4 ]]; then
            log "SUCCESS" "Sufficient RAM available: ${total_memory_gb}GB total"
            return 0
        else
            log "WARNING" "Low RAM available: ${total_memory_gb}GB total (< 4GB recommended)"
            return 1
        fi
    else
        log "WARNING" "Cannot determine available RAM"
        return 1
    fi
}

test_mcp_config_syntax() {
    if [[ ! -f "$MCP_CONFIG" ]]; then
        log "ERROR" ".mcp.json not found at $MCP_CONFIG"
        return 1
    fi
    
    if python3 -m json.tool "$MCP_CONFIG" > /dev/null 2>&1; then
        log "SUCCESS" ".mcp.json syntax is valid"
        return 0
    else
        log "ERROR" ".mcp.json has invalid syntax"
        return 1
    fi
}

# Phase 2: NPX Package Resolution Testing
test_package_resolution() {
    local packages=(
        "@modelcontextprotocol/server-sequential-thinking"
        "@modelcontextprotocol/server-filesystem"
        "@modelcontextprotocol/server-memory"
        "@21st-dev/magic"
    )
    
    local failed_packages=()
    
    for package in "${packages[@]}"; do
        log "INFO" "Testing package resolution: $package"
        
        # Test if package can be resolved
        if timeout 30 npx --yes "$package" --help > /dev/null 2>&1 || 
           timeout 30 npx --yes "$package" . > /dev/null 2>&1 ||
           npm view "$package" > /dev/null 2>&1; then
            log "SUCCESS" "Package $package resolved successfully"
        else
            log "ERROR" "Failed to resolve package: $package"
            failed_packages+=("$package")
        fi
    done
    
    if [[ ${#failed_packages[@]} -eq 0 ]]; then
        return 0
    else
        log "ERROR" "Failed packages: ${failed_packages[*]}"
        return 1
    fi
}

# Phase 3: Individual Server Testing
test_sequential_server() {
    log "INFO" "Testing Sequential server startup"
    
    # Start server and capture output to verify startup
    local temp_output=$(mktemp)
    local server_pid
    
    npx -y @modelcontextprotocol/server-sequential-thinking > "$temp_output" 2>&1 &
    server_pid=$!
    
    # Wait up to 10 seconds for startup message
    local count=0
    local max_attempts=20
    local started=false
    
    while [[ $count -lt $max_attempts ]]; do
        if [[ -f "$temp_output" ]] && grep -q "Sequential Thinking MCP Server" "$temp_output"; then
            started=true
            break
        fi
        sleep 0.5
        ((count++))
    done
    
    # Clean up
    kill "$server_pid" 2>/dev/null || true
    
    if [[ "$started" == "true" ]]; then
        log "SUCCESS" "Sequential server starts successfully"
        rm -f "$temp_output"
        return 0
    else
        log "ERROR" "Sequential server failed to start"
        [[ -f "$temp_output" ]] && cat "$temp_output" >&2
        rm -f "$temp_output"
        return 1
    fi
}

test_filesystem_server() {
    log "INFO" "Testing Filesystem server startup and permissions"
    
    local temp_output=$(mktemp)
    local server_pid
    
    cd "$PROJECT_ROOT"
    npx -y @modelcontextprotocol/server-filesystem . > "$temp_output" 2>&1 &
    server_pid=$!
    
    # Wait up to 10 seconds for startup message
    local count=0
    local max_attempts=20
    local started=false
    
    while [[ $count -lt $max_attempts ]]; do
        if [[ -f "$temp_output" ]] && grep -q "Secure MCP Filesystem Server" "$temp_output"; then
            started=true
            break
        fi
        sleep 0.5
        ((count++))
    done
    
    # Clean up
    kill "$server_pid" 2>/dev/null || true
    
    if [[ "$started" == "true" ]]; then
        log "SUCCESS" "Filesystem server starts successfully"
        rm -f "$temp_output"
        return 0
    else
        log "ERROR" "Filesystem server failed to start"
        [[ -f "$temp_output" ]] && cat "$temp_output" >&2
        rm -f "$temp_output"
        return 1
    fi
}

test_memory_server() {
    log "INFO" "Testing Memory server startup"
    
    local temp_output=$(mktemp)
    local server_pid
    
    npx -y @modelcontextprotocol/server-memory > "$temp_output" 2>&1 &
    server_pid=$!
    
    # Wait up to 10 seconds for startup message
    local count=0
    local max_attempts=20
    local started=false
    
    while [[ $count -lt $max_attempts ]]; do
        if [[ -f "$temp_output" ]] && (grep -q "Knowledge Graph MCP Server" "$temp_output" || grep -q "Memory MCP Server" "$temp_output" || grep -q "server" "$temp_output"); then
            started=true
            break
        fi
        sleep 0.5
        ((count++))
    done
    
    # Clean up
    kill "$server_pid" 2>/dev/null || true
    
    if [[ "$started" == "true" ]]; then
        log "SUCCESS" "Memory server starts successfully"
        rm -f "$temp_output"
        return 0
    else
        log "ERROR" "Memory server failed to start"
        [[ -f "$temp_output" ]] && cat "$temp_output" >&2
        rm -f "$temp_output"
        return 1
    fi
}

test_magic_server() {
    log "INFO" "Testing Magic server startup"
    
    local temp_output=$(mktemp)
    local server_pid
    
    npx -y @21st-dev/magic > "$temp_output" 2>&1 &
    server_pid=$!
    
    # Wait up to 15 seconds for startup message (Magic might take longer)
    local count=0
    local max_attempts=30
    local started=false
    
    while [[ $count -lt $max_attempts ]]; do
        if [[ -f "$temp_output" ]] && (grep -q "Starting server" "$temp_output" || grep -q "Server started" "$temp_output" || grep -q "Magic" "$temp_output"); then
            started=true
            break
        fi
        sleep 0.5
        ((count++))
    done
    
    # Clean up
    kill "$server_pid" 2>/dev/null || true
    
    if [[ "$started" == "true" ]]; then
        log "SUCCESS" "Magic server starts successfully"
        rm -f "$temp_output"
        return 0
    else
        log "ERROR" "Magic server failed to start"
        [[ -f "$temp_output" ]] && cat "$temp_output" >&2
        rm -f "$temp_output"
        return 1
    fi
}

test_figma_server() {
    log "INFO" "Testing Figma server connectivity"
    
    # Test SSE endpoint connectivity
    if timeout 5 curl -s "http://127.0.0.1:3845/sse" > /dev/null 2>&1; then
        log "SUCCESS" "Figma server is accessible"
        return 0
    else
        log "WARNING" "Figma server not accessible (may not be running)"
        return 1
    fi
}

# Main execution
main() {
    log "INFO" "Starting MCP Health Check"
    log "INFO" "Project root: $PROJECT_ROOT"
    log "INFO" "Log directory: $LOG_DIR"
    
    # Ensure log directory exists
    mkdir -p "$LOG_DIR"
    
    # Phase 1: System Prerequisites
    log "INFO" "=== Phase 1: System Prerequisites ==="
    run_test "Node.js Version" test_node_version
    run_test "NPM/NPX Availability" test_npm_availability
    run_test "Internet Connectivity" test_internet_connectivity
    run_test "Project Permissions" test_project_permissions
    run_test "System Resources" test_system_resources
    run_test "MCP Config Syntax" test_mcp_config_syntax
    
    # Phase 2: Package Resolution (skip in quick mode)
    if [[ "$QUICK_MODE" != "true" ]]; then
        log "INFO" "=== Phase 2: Package Resolution ==="
        run_test "NPX Package Resolution" test_package_resolution
    fi
    
    # Phase 3: Individual Server Testing
    log "INFO" "=== Phase 3: Individual Server Testing ==="
    run_test "Sequential Server" test_sequential_server
    run_test "Filesystem Server" test_filesystem_server
    run_test "Memory Server" test_memory_server
    run_test "Magic Server" test_magic_server
    run_test "Figma Server" test_figma_server
    
    # Summary
    log "INFO" "=== Test Summary ==="
    log "INFO" "Tests passed: $TESTS_PASSED"
    log "INFO" "Tests failed: $TESTS_FAILED"
    
    if [[ $TESTS_FAILED -gt 0 ]]; then
        log "ERROR" "Failed tests: ${FAILED_TESTS[*]}"
        log "ERROR" "MCP Health Check FAILED"
        exit 1
    else
        log "SUCCESS" "All tests passed! MCP servers are healthy"
        exit 0
    fi
}

# Run main function
main "$@"