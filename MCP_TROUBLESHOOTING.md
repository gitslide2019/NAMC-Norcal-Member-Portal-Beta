# MCP Troubleshooting Guide

This guide provides solutions for common issues with MCP (Model Context Protocol) servers in the NAMC Portal project.

## Quick Diagnostics

### Run Health Check
```bash
# Quick health check
./scripts/mcp-testing/mcp-health-check.sh --quick

# Full health check with verbose output
./scripts/mcp-testing/mcp-health-check.sh --verbose

# Test specific server
node scripts/mcp-testing/mcp-test-suite.js --server filesystem --verbose
```

### Check Server Status
```bash
# Start monitoring (runs every 5 minutes)
node scripts/mcp-testing/mcp-monitor.js

# One-time status check
node scripts/mcp-testing/mcp-monitor.js --interval 1
```

## Common Issues & Solutions

### 1. Filesystem Server Issues

#### Problem: "Error accessing directory --"
**Symptoms:**
- Error: `ENOENT: no such file or directory, stat '--'`
- Filesystem server fails to start

**Cause:** Incorrect argument separator in `.mcp.json`

**Solution:**
```json
// ❌ Wrong - includes -- separator
"args": ["-y", "@modelcontextprotocol/server-filesystem", "--", "."]

// ✅ Correct - no separator needed
"args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
```

#### Problem: Permission Denied
**Symptoms:**
- `EACCES: permission denied`
- Server fails to access project directory

**Solution:**
1. Check directory permissions:
   ```bash
   ls -la /Users/revalue.io/NAMC-Norcal-Member-Portal-Beta
   ```
2. Ensure read/write access:
   ```bash
   chmod 755 /Users/revalue.io/NAMC-Norcal-Member-Portal-Beta
   ```

#### Problem: Wrong Working Directory
**Symptoms:**
- Server starts but can't access expected files
- "Allowed directories" shows incorrect path

**Solution:**
Update `.mcp.json` to use absolute path:
```json
"args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/revalue.io/NAMC-Norcal-Member-Portal-Beta"]
```

### 2. Package Resolution Issues

#### Problem: NPX Package Not Found
**Symptoms:**
- `npm ERR! 404 Not Found`
- Package installation fails

**Solution:**
1. Check internet connectivity:
   ```bash
   curl -I https://registry.npmjs.org/
   ```
2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
3. Try global installation:
   ```bash
   npm install -g @modelcontextprotocol/server-filesystem
   ```

#### Problem: Package Version Conflicts
**Symptoms:**
- Server starts but behaves unexpectedly
- Version mismatch warnings

**Solution:**
1. Check installed versions:
   ```bash
   npm list -g @modelcontextprotocol/server-filesystem
   ```
2. Force reinstall:
   ```bash
   npm uninstall -g @modelcontextprotocol/server-filesystem
   npx -y @modelcontextprotocol/server-filesystem@latest
   ```

### 3. Figma Server Issues

#### Problem: Connection Refused
**Symptoms:**
- `ECONNREFUSED` on port 3845
- Figma server not accessible

**Solution:**
1. Start Figma Desktop app
2. Enable Dev Mode in Figma
3. Check if port is available:
   ```bash
   lsof -i :3845
   ```
4. Verify Figma Dev Mode plugin is installed

#### Problem: SSE Connection Drops
**Symptoms:**
- Intermittent connection failures
- Server-sent events not received

**Solution:**
1. Check network stability
2. Increase timeout in `.mcp.json`:
   ```json
   "figma-dev-mode-mcp-server": {
     "url": "http://127.0.0.1:3845/sse",
     "transport": "sse",
     "timeout": 10000
   }
   ```

### 4. Memory Server Issues

#### Problem: Memory Server Crashes
**Symptoms:**
- Out of memory errors
- Server process killed

**Solution:**
1. Monitor memory usage:
   ```bash
   node --max-old-space-size=4096 scripts/mcp-testing/mcp-monitor.js
   ```
2. Clear memory server data:
   ```bash
   # Location varies by OS
   rm -rf ~/.local/share/mcp-memory-server/
   ```

#### Problem: Persistent Storage Issues
**Symptoms:**
- Data not persisting between sessions
- Database connection errors

**Solution:**
1. Check storage permissions:
   ```bash
   ls -la ~/.local/share/mcp-memory-server/
   ```
2. Reset memory server:
   ```bash
   # Backup first if needed
   mv ~/.local/share/mcp-memory-server/ ~/.local/share/mcp-memory-server.bak
   ```

### 5. Magic Server Issues

#### Problem: API Authentication Failed
**Symptoms:**
- 401 Unauthorized errors
- Component generation fails

**Solution:**
1. Check 21st.dev API status
2. Verify account status and quotas
3. Try with different component requests

#### Problem: Rate Limiting
**Symptoms:**
- 429 Too Many Requests
- Temporary server unavailability

**Solution:**
1. Implement exponential backoff
2. Reduce request frequency
3. Use caching for repeated requests

### 6. Sequential Server Issues

#### Problem: Thinking Process Timeout
**Symptoms:**
- Long delays in responses
- Thinking operations never complete

**Solution:**
1. Increase timeout values
2. Break down complex thinking tasks
3. Monitor system resources

#### Problem: Memory Leaks
**Symptoms:**
- Increasing memory usage over time
- Performance degradation

**Solution:**
1. Restart server periodically
2. Monitor with system tools:
   ```bash
   top -p $(pgrep -f sequential-thinking)
   ```

## System-Level Issues

### Node.js Version Issues
**Problem:** Incompatible Node.js version
**Solution:**
```bash
# Check version
node --version

# Install/update Node.js (use nvm if available)
nvm install 20
nvm use 20
```

### Network Connectivity Issues
**Problem:** Cannot reach external services
**Solution:**
1. Check DNS resolution:
   ```bash
   nslookup registry.npmjs.org
   ```
2. Test HTTPS connectivity:
   ```bash
   curl -I https://registry.npmjs.org/
   ```
3. Check proxy settings if behind corporate firewall

### Resource Exhaustion
**Problem:** System running out of resources
**Solution:**
1. Monitor system resources:
   ```bash
   # Memory usage
   free -h
   # macOS
   vm_stat

   # Disk usage
   df -h

   # Process monitoring
   htop
   ```
2. Close unnecessary applications
3. Increase system limits if needed

## Configuration Validation

### Validate .mcp.json Syntax
```bash
# Check JSON syntax
python3 -m json.tool .mcp.json

# Or use jq if available
jq . .mcp.json
```

### Validate Server Configuration
```bash
# Run configuration validator
node scripts/mcp-testing/mcp-config-validator.js
```

## Monitoring & Logging

### Enable Detailed Logging
```bash
# Set log level environment variable
export MCP_LOG_LEVEL=debug

# Run with verbose logging
./scripts/mcp-testing/mcp-health-check.sh --verbose
```

### Log File Locations
- Health check logs: `scripts/mcp-testing/logs/health-check.log`
- Monitor logs: `scripts/mcp-testing/logs/monitor.log`
- Test suite logs: `scripts/mcp-testing/logs/test-suite.log`

### Log Analysis
```bash
# View recent errors
grep "ERROR" scripts/mcp-testing/logs/*.log | tail -20

# Monitor logs in real-time
tail -f scripts/mcp-testing/logs/monitor.log

# Analyze patterns
awk '/ERROR/ {print $0}' scripts/mcp-testing/logs/*.log | sort | uniq -c
```

## Performance Optimization

### Reduce Startup Times
1. Use npm cache effectively:
   ```bash
   npm config set cache ~/.npm-cache
   ```
2. Pre-install packages globally:
   ```bash
   npm install -g @modelcontextprotocol/server-filesystem
   npm install -g @modelcontextprotocol/server-memory
   npm install -g @modelcontextprotocol/server-sequential-thinking
   npm install -g @21st-dev/magic
   ```

### Memory Optimization
1. Set Node.js memory limits:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```
2. Use process monitoring:
   ```bash
   node --inspect scripts/mcp-testing/mcp-monitor.js
   ```

## Recovery Procedures

### Automatic Recovery
The monitoring system includes automatic recovery features:
- Circuit breaker pattern for failed servers
- Exponential backoff for retries
- Automatic server restart after failures

### Manual Recovery Steps
1. **Stop all MCP processes:**
   ```bash
   pkill -f "modelcontextprotocol"
   pkill -f "21st-dev"
   ```

2. **Clear caches:**
   ```bash
   npm cache clean --force
   rm -rf ~/.npm/_npx/
   ```

3. **Reset configuration:**
   ```bash
   # Backup current config
   cp .mcp.json .mcp.json.backup
   
   # Restore from known good config
   git checkout .mcp.json
   ```

4. **Restart services:**
   ```bash
   # Test configuration
   ./scripts/mcp-testing/mcp-health-check.sh
   
   # Start monitoring
   node scripts/mcp-testing/mcp-monitor.js
   ```

## Getting Help

### Debug Information to Collect
When reporting issues, include:

1. **System Information:**
   ```bash
   node --version
   npm --version
   uname -a  # Linux/macOS
   ```

2. **Configuration:**
   ```bash
   cat .mcp.json
   ```

3. **Log Files:**
   ```bash
   tail -100 scripts/mcp-testing/logs/health-check.log
   ```

4. **Health Check Results:**
   ```bash
   ./scripts/mcp-testing/mcp-health-check.sh --json > health-report.json
   ```

### Useful Commands Summary
```bash
# Quick health check
./scripts/mcp-testing/mcp-health-check.sh --quick

# Full test suite
node scripts/mcp-testing/mcp-test-suite.js --verbose

# Test specific server
node scripts/mcp-testing/server-tests/test-filesystem.js --verbose

# Start monitoring
node scripts/mcp-testing/mcp-monitor.js

# Validate configuration
python3 -m json.tool .mcp.json

# Check logs
tail -f scripts/mcp-testing/logs/*.log

# Clean restart
pkill -f "modelcontextprotocol" && npm cache clean --force
```

## Preventive Measures

### Regular Maintenance
1. **Weekly health checks:**
   ```bash
   # Add to crontab
   0 9 * * 1 cd /path/to/project && ./scripts/mcp-testing/mcp-health-check.sh
   ```

2. **Monthly dependency updates:**
   ```bash
   # Check for updates
   npm outdated -g
   
   # Update packages
   npm update -g @modelcontextprotocol/server-filesystem
   npm update -g @modelcontextprotocol/server-memory
   npm update -g @modelcontextprotocol/server-sequential-thinking
   npm update -g @21st-dev/magic
   ```

3. **Log rotation:**
   ```bash
   # Archive old logs monthly
   tar -czf logs-backup-$(date +%Y%m).tar.gz scripts/mcp-testing/logs/
   ```

### Best Practices
1. Always run health checks after configuration changes
2. Monitor resource usage regularly
3. Keep backups of working configurations
4. Document any custom modifications
5. Test in development before deploying changes

---

*Last updated: $(date)*
*For additional support, check the project documentation or create an issue in the repository.*