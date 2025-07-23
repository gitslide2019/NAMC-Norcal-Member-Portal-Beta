#!/usr/bin/env node

/**
 * MCP Monitor - Continuous monitoring of MCP servers
 * Provides health checks, alerting, and automatic recovery
 * Usage: node mcp-monitor.js [--interval <seconds>] [--alert-threshold <count>]
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class MCPMonitor extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.interval = (options.interval || 300) * 1000; // Default 5 minutes
        this.alertThreshold = options.alertThreshold || 3; // Alert after 3 failures
        this.logRetentionDays = options.logRetentionDays || 7;
        
        this.projectRoot = path.resolve(__dirname, '../..');
        this.logDir = path.join(__dirname, 'logs');
        this.configFile = path.join(this.projectRoot, '.mcp.json');
        
        this.servers = {};
        this.monitoringActive = false;
        this.healthCheckInterval = null;
        
        // Circuit breaker state
        this.circuitBreaker = new Map();
        
        this.initializeServerConfig();
    }

    async initializeServerConfig() {
        try {
            const configContent = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(configContent);
            
            this.servers = {
                sequential: {
                    name: 'Sequential Thinking',
                    package: '@modelcontextprotocol/server-sequential-thinking',
                    args: [],
                    status: 'unknown',
                    lastCheck: null,
                    failures: 0,
                    successCount: 0
                },
                filesystem: {
                    name: 'Filesystem',
                    package: '@modelcontextprotocol/server-filesystem',
                    args: ['.'],
                    status: 'unknown',
                    lastCheck: null,
                    failures: 0,
                    successCount: 0
                },
                memory: {
                    name: 'Memory',
                    package: '@modelcontextprotocol/server-memory',
                    args: [],
                    status: 'unknown',
                    lastCheck: null,
                    failures: 0,
                    successCount: 0
                },
                magic: {
                    name: 'Magic UI',
                    package: '@21st-dev/magic',
                    args: [],
                    status: 'unknown',
                    lastCheck: null,
                    failures: 0,
                    successCount: 0
                },
                figma: {
                    name: 'Figma Dev Mode',
                    url: 'http://127.0.0.1:3845/sse',
                    transport: 'sse',
                    status: 'unknown',
                    lastCheck: null,
                    failures: 0,
                    successCount: 0
                }
            };

            // Initialize circuit breaker states
            for (const serverName of Object.keys(this.servers)) {
                this.circuitBreaker.set(serverName, {
                    state: 'closed', // closed, open, half-open
                    failures: 0,
                    lastFailTime: null,
                    nextAttempt: null
                });
            }

        } catch (error) {
            await this.log('ERROR', `Failed to initialize server config: ${error.message}`);
            throw error;
        }
    }

    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        // Console output
        const colors = {
            INFO: '\x1b[34m',
            SUCCESS: '\x1b[32m',
            WARNING: '\x1b[33m',
            ERROR: '\x1b[31m',
            RESET: '\x1b[0m'
        };

        console.log(`${colors[level]}[${level}]${colors.RESET} ${message}`);
        if (data) {
            console.log('  Data:', JSON.stringify(data, null, 2));
        }

        // File logging
        await this.ensureLogDir();
        const logLine = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(path.join(this.logDir, 'monitor.log'), logLine);

        // Emit event for external listeners
        this.emit('log', logEntry);
    }

    async ensureLogDir() {
        try {
            await fs.access(this.logDir);
        } catch {
            await fs.mkdir(this.logDir, { recursive: true });
        }
    }

    async checkServerHealth(serverName, serverConfig) {
        const circuitState = this.circuitBreaker.get(serverName);
        
        // Check circuit breaker
        if (circuitState.state === 'open') {
            const now = Date.now();
            if (now < circuitState.nextAttempt) {
                await this.log('WARNING', `Circuit breaker open for ${serverName}, skipping check`);
                return false;
            } else {
                // Try half-open
                circuitState.state = 'half-open';
                await this.log('INFO', `Circuit breaker half-open for ${serverName}, attempting check`);
            }
        }

        try {
            const startTime = Date.now();
            let isHealthy = false;

            if (serverConfig.package) {
                isHealthy = await this.checkNPXServer(serverName, serverConfig);
            } else if (serverConfig.url) {
                isHealthy = await this.checkSSEServer(serverName, serverConfig);
            }

            const responseTime = Date.now() - startTime;
            serverConfig.lastCheck = new Date().toISOString();
            serverConfig.responseTime = responseTime;

            if (isHealthy) {
                serverConfig.status = 'healthy';
                serverConfig.failures = Math.max(0, serverConfig.failures - 1);
                serverConfig.successCount++;
                
                // Reset circuit breaker
                circuitState.state = 'closed';
                circuitState.failures = 0;
                
                await this.log('SUCCESS', `${serverName} server healthy (${responseTime}ms)`);
                return true;
            } else {
                throw new Error('Health check failed');
            }

        } catch (error) {
            serverConfig.status = 'unhealthy';
            serverConfig.failures++;
            serverConfig.lastCheck = new Date().toISOString();
            
            // Update circuit breaker
            circuitState.failures++;
            circuitState.lastFailTime = Date.now();
            
            if (circuitState.failures >= this.alertThreshold) {
                circuitState.state = 'open';
                circuitState.nextAttempt = Date.now() + (30000 * circuitState.failures); // Exponential backoff
                await this.log('ERROR', `Circuit breaker opened for ${serverName}`);
            }

            await this.log('ERROR', `${serverName} server unhealthy: ${error.message}`);
            
            // Emit alert if threshold reached
            if (serverConfig.failures >= this.alertThreshold) {
                this.emit('alert', {
                    server: serverName,
                    failures: serverConfig.failures,
                    error: error.message
                });
            }

            return false;
        }
    }

    async checkNPXServer(serverName, serverConfig) {
        return new Promise((resolve, reject) => {
            const process = spawn('npx', ['-y', serverConfig.package, ...serverConfig.args], {
                cwd: this.projectRoot,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let resolved = false;

            process.stdout.on('data', (data) => {
                stdout += data.toString();
                if (stdout.includes('running') || stdout.includes('server') || 
                    stdout.includes('Secure MCP') || stdout.includes('listening')) {
                    if (!resolved) {
                        resolved = true;
                        process.kill();
                        resolve(true);
                    }
                }
            });

            process.on('error', (error) => {
                if (!resolved) {
                    resolved = true;
                    reject(error);
                }
            });

            process.on('close', (code) => {
                if (!resolved) {
                    if (code === 0 || code === null) {
                        resolve(true);
                    } else {
                        reject(new Error(`Process exited with code ${code}`));
                    }
                }
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    process.kill();
                    reject(new Error('Health check timeout'));
                }
            }, 10000);
        });
    }

    async checkSSEServer(serverName, serverConfig) {
        return new Promise((resolve, reject) => {
            const http = require('http');
            const url = new URL(serverConfig.url);
            
            const req = http.request({
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method: 'HEAD',
                timeout: 5000
            }, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    resolve(true);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
                req.destroy();
            });

            req.on('error', (error) => {
                reject(new Error(`Connection failed: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Connection timeout'));
            });

            req.end();
        });
    }

    async performHealthChecks() {
        await this.log('INFO', 'Performing health checks for all servers');
        
        const healthPromises = Object.entries(this.servers).map(
            ([serverName, serverConfig]) => this.checkServerHealth(serverName, serverConfig)
        );

        const results = await Promise.allSettled(healthPromises);
        
        const healthy = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const total = results.length;
        
        await this.log('INFO', `Health check complete: ${healthy}/${total} servers healthy`);
        
        // Emit status update
        this.emit('healthCheck', {
            healthy,
            total,
            servers: this.servers,
            timestamp: new Date().toISOString()
        });

        return { healthy, total };
    }

    async cleanupLogs() {
        const logFiles = ['monitor.log', 'health-check.log', 'test-suite.log'];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.logRetentionDays);

        for (const logFile of logFiles) {
            const logPath = path.join(this.logDir, logFile);
            try {
                const stats = await fs.stat(logPath);
                if (stats.mtime < cutoffDate) {
                    // Archive old log
                    const archivePath = path.join(this.logDir, `${logFile}.${stats.mtime.getTime()}`);
                    await fs.rename(logPath, archivePath);
                    await this.log('INFO', `Archived old log: ${logFile}`);
                }
            } catch (error) {
                // Log file doesn't exist or other error, ignore
            }
        }
    }

    async generateStatusReport() {
        const report = {
            timestamp: new Date().toISOString(),
            servers: {},
            summary: {
                total: Object.keys(this.servers).length,
                healthy: 0,
                unhealthy: 0,
                unknown: 0
            }
        };

        for (const [serverName, serverConfig] of Object.entries(this.servers)) {
            report.servers[serverName] = {
                name: serverConfig.name,
                status: serverConfig.status,
                lastCheck: serverConfig.lastCheck,
                failures: serverConfig.failures,
                successCount: serverConfig.successCount,
                responseTime: serverConfig.responseTime,
                circuitBreakerState: this.circuitBreaker.get(serverName).state
            };

            if (serverConfig.status === 'healthy') report.summary.healthy++;
            else if (serverConfig.status === 'unhealthy') report.summary.unhealthy++;
            else report.summary.unknown++;
        }

        return report;
    }

    start() {
        if (this.monitoringActive) {
            throw new Error('Monitoring is already active');
        }

        this.monitoringActive = true;
        
        // Set up alert handler
        this.on('alert', async (alertData) => {
            await this.log('ERROR', `ALERT: Server ${alertData.server} has failed ${alertData.failures} times`);
            // Here you could integrate with external alerting systems
        });

        // Perform initial health check
        this.performHealthChecks();

        // Set up periodic health checks
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.performHealthChecks();
                await this.cleanupLogs();
            } catch (error) {
                await this.log('ERROR', `Health check failed: ${error.message}`);
            }
        }, this.interval);

        this.log('INFO', `MCP Monitor started with ${this.interval / 1000}s interval`);
    }

    stop() {
        if (!this.monitoringActive) {
            return;
        }

        this.monitoringActive = false;
        
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }

        this.log('INFO', 'MCP Monitor stopped');
    }

    async getStatus() {
        return await this.generateStatusReport();
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    const options = {
        interval: 300, // 5 minutes default
        alertThreshold: 3
    };

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--interval' && args[i + 1]) {
            options.interval = parseInt(args[i + 1]);
            i++; // Skip next argument
        } else if (args[i] === '--alert-threshold' && args[i + 1]) {
            options.alertThreshold = parseInt(args[i + 1]);
            i++; // Skip next argument
        }
    }

    const monitor = new MCPMonitor(options);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nReceived SIGINT, shutting down gracefully...');
        monitor.stop();
        
        // Generate final status report
        const finalReport = await monitor.getStatus();
        console.log('\nFinal Status Report:');
        console.log(JSON.stringify(finalReport, null, 2));
        
        process.exit(0);
    });

    // Start monitoring
    monitor.start();

    // Keep the process running
    process.on('uncaughtException', async (error) => {
        await monitor.log('ERROR', `Uncaught exception: ${error.message}`);
        console.error(error);
    });

    process.on('unhandledRejection', async (reason, promise) => {
        await monitor.log('ERROR', `Unhandled rejection: ${reason}`);
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MCPMonitor;