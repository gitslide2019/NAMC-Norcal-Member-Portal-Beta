#!/usr/bin/env node

/**
 * MCP Test Suite - Comprehensive testing of all MCP servers
 * Usage: node mcp-test-suite.js [--verbose] [--json] [--server <name>]
 */

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

class MCPTestSuite {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.jsonOutput = options.json || false;
        this.targetServer = options.server || null;
        
        this.projectRoot = path.resolve(__dirname, '../..');
        this.logDir = path.join(__dirname, 'logs');
        this.mcpConfig = path.join(this.projectRoot, '.mcp.json');
        
        this.testResults = {
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: []
        };
        
        this.servers = {
            sequential: {
                package: '@modelcontextprotocol/server-sequential-thinking',
                args: [],
                timeout: 10000,
                description: 'Sequential thinking server'
            },
            filesystem: {
                package: '@modelcontextprotocol/server-filesystem',
                args: ['.'],
                timeout: 10000,
                description: 'Filesystem server'
            },
            memory: {
                package: '@modelcontextprotocol/server-memory',
                args: [],
                timeout: 10000,
                description: 'Memory server'
            },
            magic: {
                package: '@21st-dev/magic',
                args: [],
                timeout: 15000,
                description: 'Magic UI component server'
            },
            figma: {
                url: 'http://127.0.0.1:3845/sse',
                transport: 'sse',
                timeout: 5000,
                description: 'Figma Dev Mode server'
            }
        };
    }

    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        
        if (this.jsonOutput) {
            console.log(JSON.stringify({
                timestamp,
                level,
                message,
                data
            }));
        } else {
            const colors = {
                INFO: '\x1b[34m',
                SUCCESS: '\x1b[32m',
                WARNING: '\x1b[33m',
                ERROR: '\x1b[31m',
                RESET: '\x1b[0m'
            };
            
            console.log(`${colors[level]}[${level}]${colors.RESET} ${message}`);
            if (this.verbose && data) {
                console.log('  Data:', JSON.stringify(data, null, 2));
            }
        }

        // Always log to file
        await this.ensureLogDir();
        const logEntry = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
        await fs.appendFile(path.join(this.logDir, 'test-suite.log'), logEntry);
    }

    async ensureLogDir() {
        try {
            await fs.access(this.logDir);
        } catch {
            await fs.mkdir(this.logDir, { recursive: true });
        }
    }

    async runTest(testName, testFunction, serverName = null) {
        if (this.targetServer && serverName && this.targetServer !== serverName) {
            this.testResults.skipped++;
            this.testResults.tests.push({
                name: testName,
                status: 'skipped',
                server: serverName,
                reason: `Server ${serverName} not targeted`
            });
            return;
        }

        await this.log('INFO', `Running test: ${testName}`);
        
        const startTime = Date.now();
        let result = {
            name: testName,
            server: serverName,
            startTime,
            status: 'failed',
            error: null,
            duration: 0
        };

        try {
            await testFunction();
            result.status = 'passed';
            result.duration = Date.now() - startTime;
            
            this.testResults.passed++;
            await this.log('SUCCESS', `${testName} PASSED (${result.duration}ms)`);
        } catch (error) {
            result.status = 'failed';
            result.duration = Date.now() - startTime;
            result.error = error.message;
            
            this.testResults.failed++;
            await this.log('ERROR', `${testName} FAILED (${result.duration}ms)`, { error: error.message });
        }

        this.testResults.tests.push(result);
    }

    async testPackageResolution() {
        const packages = [
            '@modelcontextprotocol/server-sequential-thinking',
            '@modelcontextprotocol/server-filesystem',
            '@modelcontextprotocol/server-memory',
            '@21st-dev/magic'
        ];

        for (const pkg of packages) {
            await this.runTest(`Package Resolution: ${pkg}`, async () => {
                // Test if package can be resolved
                try {
                    const { stdout, stderr } = await execAsync(`npm view ${pkg} version`, { timeout: 30000 });
                    if (!stdout.trim()) {
                        throw new Error(`Package ${pkg} not found in registry`);
                    }
                } catch (error) {
                    throw new Error(`Failed to resolve package ${pkg}: ${error.message}`);
                }
            }, 'package-resolution');
        }
    }

    async testNPXServerStartup(serverName, serverConfig) {
        await this.runTest(`NPX Server Startup: ${serverName}`, async () => {
            return new Promise((resolve, reject) => {
                const args = ['-y', serverConfig.package, ...serverConfig.args];
                const process = spawn('npx', args, {
                    cwd: this.projectRoot,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let stdout = '';
                let stderr = '';
                let resolved = false;

                process.stdout.on('data', (data) => {
                    stdout += data.toString();
                    // Look for success indicators
                    if (stdout.includes('running') || stdout.includes('server') || stdout.includes('listening')) {
                        if (!resolved) {
                            resolved = true;
                            process.kill();
                            resolve();
                        }
                    }
                });

                process.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                process.on('close', (code) => {
                    if (!resolved) {
                        if (code === 0 || code === null) {
                            resolve();
                        } else {
                            reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
                        }
                    }
                });

                process.on('error', (error) => {
                    if (!resolved) {
                        resolved = true;
                        reject(error);
                    }
                });

                // Timeout
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        process.kill();
                        reject(new Error(`Server startup timeout after ${serverConfig.timeout}ms`));
                    }
                }, serverConfig.timeout);
            });
        }, serverName);
    }

    async testSSEServerConnectivity(serverName, serverConfig) {
        await this.runTest(`SSE Server Connectivity: ${serverName}`, async () => {
            return new Promise((resolve, reject) => {
                const https = require('http');
                const url = new URL(serverConfig.url);
                
                const req = https.request({
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname,
                    method: 'GET',
                    timeout: serverConfig.timeout
                }, (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 400) {
                        resolve();
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
        }, serverName);
    }

    async testMCPConfigValidation() {
        await this.runTest('MCP Configuration Validation', async () => {
            try {
                await fs.access(this.mcpConfig);
                const configContent = await fs.readFile(this.mcpConfig, 'utf8');
                const config = JSON.parse(configContent);
                
                if (!config.mcpServers) {
                    throw new Error('Missing mcpServers section in .mcp.json');
                }

                const serverNames = Object.keys(config.mcpServers);
                if (serverNames.length === 0) {
                    throw new Error('No servers configured in .mcp.json');
                }

                // Validate each server configuration
                for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
                    if (serverConfig.command && !serverConfig.args) {
                        throw new Error(`Server ${name} missing args array`);
                    }
                    if (serverConfig.url && !serverConfig.transport) {
                        throw new Error(`Server ${name} missing transport type`);
                    }
                }

            } catch (error) {
                throw new Error(`MCP config validation failed: ${error.message}`);
            }
        }, 'config');
    }

    async testPerformanceMetrics() {
        await this.runTest('Performance Metrics Collection', async () => {
            const startTime = Date.now();
            const startMemory = process.memoryUsage();

            // Simulate some work
            await new Promise(resolve => setTimeout(resolve, 100));

            const endTime = Date.now();
            const endMemory = process.memoryUsage();

            const metrics = {
                duration: endTime - startTime,
                memoryDelta: {
                    rss: endMemory.rss - startMemory.rss,
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal
                }
            };

            await this.log('INFO', 'Performance metrics collected', metrics);
        }, 'performance');
    }

    async runAllTests() {
        await this.log('INFO', 'Starting MCP Test Suite');
        await this.log('INFO', `Project root: ${this.projectRoot}`);
        
        // Configuration validation
        await this.log('INFO', '=== Configuration Tests ===');
        await this.testMCPConfigValidation();

        // Package resolution tests
        if (!this.targetServer || this.targetServer === 'package-resolution') {
            await this.log('INFO', '=== Package Resolution Tests ===');
            await this.testPackageResolution();
        }

        // Server startup tests
        await this.log('INFO', '=== Server Startup Tests ===');
        
        for (const [serverName, serverConfig] of Object.entries(this.servers)) {
            if (this.targetServer && this.targetServer !== serverName) continue;

            if (serverConfig.package) {
                await this.testNPXServerStartup(serverName, serverConfig);
            } else if (serverConfig.url) {
                await this.testSSEServerConnectivity(serverName, serverConfig);
            }
        }

        // Performance tests
        if (!this.targetServer || this.targetServer === 'performance') {
            await this.log('INFO', '=== Performance Tests ===');
            await this.testPerformanceMetrics();
        }

        // Generate summary
        await this.generateSummary();
    }

    async generateSummary() {
        await this.log('INFO', '=== Test Summary ===');
        await this.log('INFO', `Tests passed: ${this.testResults.passed}`);
        await this.log('INFO', `Tests failed: ${this.testResults.failed}`);
        await this.log('INFO', `Tests skipped: ${this.testResults.skipped}`);
        
        if (this.testResults.failed > 0) {
            const failedTests = this.testResults.tests.filter(t => t.status === 'failed');
            await this.log('ERROR', 'Failed tests:');
            for (const test of failedTests) {
                await this.log('ERROR', `  - ${test.name}: ${test.error}`);
            }
        }

        // Write detailed results to file
        const resultsFile = path.join(this.logDir, 'test-results.json');
        await fs.writeFile(resultsFile, JSON.stringify(this.testResults, null, 2));
        await this.log('INFO', `Detailed results written to: ${resultsFile}`);

        if (this.testResults.failed > 0) {
            process.exit(1);
        } else {
            await this.log('SUCCESS', 'All tests passed! MCP servers are ready');
            process.exit(0);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const options = {
        verbose: args.includes('--verbose'),
        json: args.includes('--json'),
        server: null
    };

    const serverIndex = args.indexOf('--server');
    if (serverIndex !== -1 && args[serverIndex + 1]) {
        options.server = args[serverIndex + 1];
    }

    const testSuite = new MCPTestSuite(options);
    
    try {
        await testSuite.runAllTests();
    } catch (error) {
        await testSuite.log('ERROR', `Test suite failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MCPTestSuite;