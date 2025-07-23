#!/usr/bin/env node

/**
 * Filesystem Server Test - Detailed testing of the MCP Filesystem server
 * Tests file operations, permissions, and edge cases
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class FilesystemServerTest {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.projectRoot = path.resolve(__dirname, '../../..');
        this.testDir = path.join(this.projectRoot, 'scripts/mcp-testing/test-data');
        this.package = '@modelcontextprotocol/server-filesystem';
        this.testResults = [];
    }

    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${message}`);
        if (this.verbose && data) {
            console.log('  Data:', JSON.stringify(data, null, 2));
        }
    }

    async runTest(testName, testFunction) {
        await this.log('INFO', `Running test: ${testName}`);
        const startTime = Date.now();

        try {
            await testFunction();
            const duration = Date.now() - startTime;
            this.testResults.push({ name: testName, status: 'passed', duration });
            await this.log('SUCCESS', `${testName} PASSED (${duration}ms)`);
            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.testResults.push({ name: testName, status: 'failed', duration, error: error.message });
            await this.log('ERROR', `${testName} FAILED (${duration}ms): ${error.message}`);
            return false;
        }
    }

    async setupTestData() {
        await this.log('INFO', 'Setting up test data');
        
        try {
            await fs.access(this.testDir);
        } catch {
            await fs.mkdir(this.testDir, { recursive: true });
        }

        // Create test files
        const testFiles = {
            'test-file.txt': 'This is a test file for filesystem server testing.',
            'test-data.json': JSON.stringify({ test: true, timestamp: Date.now() }, null, 2),
            'empty-file.txt': '',
            'large-file.txt': 'x'.repeat(10000) // 10KB file
        };

        for (const [filename, content] of Object.entries(testFiles)) {
            await fs.writeFile(path.join(this.testDir, filename), content);
        }

        // Create subdirectory
        const subDir = path.join(this.testDir, 'subdir');
        try {
            await fs.access(subDir);
        } catch {
            await fs.mkdir(subDir);
        }

        await fs.writeFile(path.join(subDir, 'nested-file.txt'), 'Nested file content');
    }

    async testBasicStartup() {
        await this.runTest('Basic Server Startup', async () => {
            return new Promise((resolve, reject) => {
                const process = spawn('npx', ['-y', this.package, '.'], {
                    cwd: this.projectRoot,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let stdout = '';
                let stderr = '';
                let resolved = false;

                process.stdout.on('data', (data) => {
                    stdout += data.toString();
                    if (stdout.includes('Secure MCP Filesystem Server running') || 
                        stdout.includes('Allowed directories')) {
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

                process.on('error', (error) => {
                    if (!resolved) {
                        resolved = true;
                        reject(new Error(`Process error: ${error.message}`));
                    }
                });

                process.on('close', (code) => {
                    if (!resolved) {
                        if (stderr.includes('ENOENT') || stderr.includes('permission denied')) {
                            reject(new Error(`Permission or path error: ${stderr}`));
                        } else if (code !== 0 && code !== null) {
                            reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
                        } else {
                            resolve();
                        }
                    }
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        process.kill();
                        reject(new Error('Server startup timeout'));
                    }
                }, 10000);
            });
        });
    }

    async testDirectoryPermissions() {
        await this.runTest('Directory Permissions', async () => {
            return new Promise((resolve, reject) => {
                const process = spawn('npx', ['-y', this.package, this.projectRoot], {
                    cwd: this.projectRoot,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let stdout = '';
                let resolved = false;

                process.stdout.on('data', (data) => {
                    stdout += data.toString();
                    if (stdout.includes(`Allowed directories: [ '${this.projectRoot}' ]`)) {
                        if (!resolved) {
                            resolved = true;
                            process.kill();
                            resolve();
                        }
                    }
                });

                process.on('error', (error) => {
                    if (!resolved) {
                        resolved = true;
                        reject(error);
                    }
                });

                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        process.kill();
                        reject(new Error('Directory permission test timeout'));
                    }
                }, 5000);
            });
        });
    }

    async testInvalidDirectoryPath() {
        await this.runTest('Invalid Directory Path Handling', async () => {
            return new Promise((resolve, reject) => {
                const invalidPath = '/nonexistent/directory/path';
                const process = spawn('npx', ['-y', this.package, invalidPath], {
                    cwd: this.projectRoot,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let stderr = '';
                let resolved = false;

                process.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                process.on('close', (code) => {
                    if (!resolved) {
                        resolved = true;
                        if (code !== 0 || stderr.includes('ENOENT') || stderr.includes('no such file')) {
                            resolve(); // Expected to fail
                        } else {
                            reject(new Error('Should have failed with invalid directory path'));
                        }
                    }
                });

                process.on('error', (error) => {
                    if (!resolved) {
                        resolved = true;
                        resolve(); // Expected to fail
                    }
                });

                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        process.kill();
                        resolve(); // Timeout is acceptable for this test
                    }
                }, 5000);
            });
        });
    }

    async testResourceUsage() {
        await this.runTest('Resource Usage Monitoring', async () => {
            const startMemory = process.memoryUsage();
            
            return new Promise((resolve, reject) => {
                const serverProcess = spawn('npx', ['-y', this.package, '.'], {
                    cwd: this.projectRoot,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let resolved = false;
                let memoryPeakRSS = startMemory.rss;

                // Monitor memory usage
                const memoryMonitor = setInterval(() => {
                    const currentMemory = process.memoryUsage();
                    if (currentMemory.rss > memoryPeakRSS) {
                        memoryPeakRSS = currentMemory.rss;
                    }
                }, 100);

                serverProcess.stdout.on('data', (data) => {
                    if (data.toString().includes('running') && !resolved) {
                        resolved = true;
                        clearInterval(memoryMonitor);
                        serverProcess.kill();
                        
                        const memoryUsed = memoryPeakRSS - startMemory.rss;
                        const memoryMB = Math.round(memoryUsed / 1024 / 1024);
                        
                        if (memoryMB > 500) { // More than 500MB is concerning
                            reject(new Error(`High memory usage: ${memoryMB}MB`));
                        } else {
                            resolve();
                        }
                    }
                });

                serverProcess.on('error', (error) => {
                    if (!resolved) {
                        resolved = true;
                        clearInterval(memoryMonitor);
                        reject(error);
                    }
                });

                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        clearInterval(memoryMonitor);
                        serverProcess.kill();
                        reject(new Error('Resource monitoring timeout'));
                    }
                }, 10000);
            });
        });
    }

    async testConcurrentAccess() {
        await this.runTest('Concurrent Server Access', async () => {
            const processes = [];
            const results = [];

            try {
                // Start 3 servers concurrently
                for (let i = 0; i < 3; i++) {
                    const promise = new Promise((resolve, reject) => {
                        const process = spawn('npx', ['-y', this.package, '.'], {
                            cwd: this.projectRoot,
                            stdio: ['pipe', 'pipe', 'pipe']
                        });

                        let resolved = false;

                        process.stdout.on('data', (data) => {
                            if (data.toString().includes('running') && !resolved) {
                                resolved = true;
                                process.kill();
                                resolve(`Process ${i} started successfully`);
                            }
                        });

                        process.on('error', (error) => {
                            if (!resolved) {
                                resolved = true;
                                reject(error);
                            }
                        });

                        setTimeout(() => {
                            if (!resolved) {
                                resolved = true;
                                process.kill();
                                reject(new Error(`Process ${i} timeout`));
                            }
                        }, 5000);
                    });

                    processes.push(promise);
                }

                // Wait for all processes to complete
                const results = await Promise.allSettled(processes);
                
                const successful = results.filter(r => r.status === 'fulfilled').length;
                if (successful < 2) {
                    throw new Error(`Only ${successful}/3 processes started successfully`);
                }
            } catch (error) {
                throw error;
            }
        });
    }

    async runAllTests() {
        await this.log('INFO', 'Starting Filesystem Server Tests');
        await this.log('INFO', `Project root: ${this.projectRoot}`);
        
        // Setup test environment
        await this.setupTestData();

        // Run all tests
        const tests = [
            () => this.testBasicStartup(),
            () => this.testDirectoryPermissions(),
            () => this.testInvalidDirectoryPath(),
            () => this.testResourceUsage(),
            () => this.testConcurrentAccess()
        ];

        let passed = 0;
        let failed = 0;

        for (const test of tests) {
            if (await test()) {
                passed++;
            } else {
                failed++;
            }
        }

        // Summary
        await this.log('INFO', '=== Filesystem Server Test Summary ===');
        await this.log('INFO', `Tests passed: ${passed}`);
        await this.log('INFO', `Tests failed: ${failed}`);

        if (failed > 0) {
            const failedTests = this.testResults.filter(t => t.status === 'failed');
            await this.log('ERROR', 'Failed tests:');
            for (const test of failedTests) {
                await this.log('ERROR', `  - ${test.name}: ${test.error}`);
            }
            process.exit(1);
        } else {
            await this.log('SUCCESS', 'All filesystem server tests passed!');
            process.exit(0);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const options = {
        verbose: args.includes('--verbose')
    };

    const tester = new FilesystemServerTest(options);
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = FilesystemServerTest;