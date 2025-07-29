#!/bin/bash

# TECH Clean California Test Runner
# Runs the complete TECH E2E test suite with proper setup and reporting

set -e

echo "🚀 Starting TECH Clean California E2E Test Suite"
echo "================================================="

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Ensure Playwright browsers are installed
echo "🌐 Setting up Playwright browsers..."
npx playwright install

# Start the application if not running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "🏃 Starting application server..."
    npm run dev &
    APP_PID=$!
    
    # Wait for server to be ready
    echo "⏳ Waiting for server to start..."
    while ! curl -s http://localhost:3000 > /dev/null; do
        sleep 1
    done
    echo "✅ Server is ready"
fi

# Create test results directory
mkdir -p test-results
mkdir -p playwright-report/tech-clean-california

echo "🧪 Running TECH Clean California E2E Tests"
echo "-------------------------------------------"

# Run test suites in order
test_files=(
    "setup.ts"
    "api.spec.ts"
    "contractor-enrollment.spec.ts"
    "project-lifecycle.spec.ts"
    "documentation-compliance.spec.ts"
    "incentive-processing.spec.ts"
    "dashboard-widget.spec.ts"
)

failed_tests=()
passed_tests=()

for test_file in "${test_files[@]}"; do
    echo "Running: $test_file"
    
    if npx playwright test "e2e/tech-clean-california/$test_file" --config=e2e/tech-clean-california/playwright.config.ts; then
        passed_tests+=("$test_file")
        echo "✅ $test_file - PASSED"
    else
        failed_tests+=("$test_file")
        echo "❌ $test_file - FAILED"
    fi
    
    echo ""
done

# Generate summary report
echo "📊 Test Execution Summary"
echo "========================="
echo "Total test files: ${#test_files[@]}"
echo "Passed: ${#passed_tests[@]}"
echo "Failed: ${#failed_tests[@]}"

if [ ${#passed_tests[@]} -gt 0 ]; then
    echo ""
    echo "✅ Passed Tests:"
    for test in "${passed_tests[@]}"; do
        echo "  - $test"
    done
fi

if [ ${#failed_tests[@]} -gt 0 ]; then
    echo ""
    echo "❌ Failed Tests:"
    for test in "${failed_tests[@]}"; do
        echo "  - $test"
    done
    echo ""
    echo "🔍 Check the detailed report at: playwright-report/tech-clean-california/index.html"
fi

# Cleanup: Stop the application server if we started it
if [ ! -z "$APP_PID" ]; then
    echo "🛑 Stopping application server..."
    kill $APP_PID
fi

echo ""
echo "🎯 TECH Clean California Test Suite Complete"
echo "============================================="

# Set exit code based on test results
if [ ${#failed_tests[@]} -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "💥 Some tests failed. Check the reports for details."
    exit 1
fi