/**
 * CSLB Data Downloader
 * 
 * Purpose: Download daily PDF files from CSLB Public Data Portal
 * Source: https://www.cslb.ca.gov/Consumers/Data.aspx
 * Files: PL (Posting List by Business) and PP (Posting List by Personnel)
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { format, subDays, addDays, parseISO } from 'date-fns';

// Configuration
const CSLB_BASE_URL = 'https://www.cslb.ca.gov/Resources/CSLB/';
const DATA_DIR = './data/cslb';
const LOGS_DIR = './data/logs';

// File types to download
enum CSLBFileType {
  BUSINESS = 'PL', // Posting List by Business
  PERSONNEL = 'PP' // Posting List by Personnel
}

interface DownloadResult {
  filename: string;
  success: boolean;
  fileSize: number;
  error?: string;
  downloadTime: number;
}

interface DownloadSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  filesAttempted: number;
  filesDownloaded: number;
  totalSize: number;
  errors: string[];
}

/**
 * Main CSLB Data Downloader Service
 */
export class CSLBDataDownloader {
  private session: DownloadSession;

  constructor() {
    this.session = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      filesAttempted: 0,
      filesDownloaded: 0,
      totalSize: 0,
      errors: []
    };

    this.ensureDirectories();
  }

  /**
   * Download latest CSLB data files
   */
  async downloadLatest(): Promise<DownloadResult[]> {
    console.log('Starting download of latest CSLB data files...');
    
    const today = new Date();
    return this.downloadForDate(today);
  }

  /**
   * Download CSLB files for a specific date
   */
  async downloadForDate(date: Date): Promise<DownloadResult[]> {
    const dateStr = format(date, 'yyMMdd');
    console.log(`Downloading CSLB files for ${format(date, 'yyyy-MM-dd')} (${dateStr})`);

    const results: DownloadResult[] = [];
    
    // Download both file types
    for (const fileType of Object.values(CSLBFileType)) {
      const filename = `${fileType}${dateStr}.pdf`;
      const result = await this.downloadFile(filename);
      results.push(result);
      
      this.session.filesAttempted++;
      if (result.success) {
        this.session.filesDownloaded++;
        this.session.totalSize += result.fileSize;
      } else {
        this.session.errors.push(`${filename}: ${result.error}`);
      }
    }

    return results;
  }

  /**
   * Download historical data for a date range
   */
  async downloadHistorical(startDate: Date, endDate: Date): Promise<DownloadResult[]> {
    console.log(`Downloading historical CSLB data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    
    const results: DownloadResult[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dateResults = await this.downloadForDate(currentDate);
      results.push(...dateResults);
      
      // Add small delay to be respectful to CSLB servers
      await this.sleep(1000);
      
      currentDate = addDays(currentDate, 1);
    }

    return results;
  }

  /**
   * Download recent files (last N days)
   */
  async downloadRecent(days: number = 7): Promise<DownloadResult[]> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    return this.downloadHistorical(startDate, endDate);
  }

  /**
   * Download a single file
   */
  private async downloadFile(filename: string): Promise<DownloadResult> {
    const url = `${CSLB_BASE_URL}${filename}`;
    const localPath = path.join(DATA_DIR, 'raw-pdfs', filename);
    
    const startTime = Date.now();
    
    try {
      console.log(`Downloading: ${filename}`);
      
      // Check if file already exists
      if (fs.existsSync(localPath)) {
        const stats = fs.statSync(localPath);
        console.log(`File ${filename} already exists (${this.formatFileSize(stats.size)})`);
        
        return {
          filename,
          success: true,
          fileSize: stats.size,
          downloadTime: 0
        };
      }

      // Download file
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 30000,
        headers: {
          'User-Agent': 'NAMC-Data-Pipeline/1.0'
        }
      });

      // Save to file
      const writer = fs.createWriteStream(localPath);
      response.data.pipe(writer);

      return new Promise((resolve) => {
        writer.on('finish', () => {
          const stats = fs.statSync(localPath);
          const downloadTime = Date.now() - startTime;
          
          console.log(`Downloaded: ${filename} (${this.formatFileSize(stats.size)}) in ${downloadTime}ms`);
          
          resolve({
            filename,
            success: true,
            fileSize: stats.size,
            downloadTime
          });
        });

        writer.on('error', (error) => {
          console.error(`Error saving ${filename}:`, error.message);
          
          resolve({
            filename,
            success: false,
            fileSize: 0,
            downloadTime: Date.now() - startTime,
            error: error.message
          });
        });
      });

    } catch (error: any) {
      const downloadTime = Date.now() - startTime;
      let errorMessage = error.message;
      
      if (error.response?.status === 404) {
        errorMessage = 'File not found (may not be available yet)';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Download timeout';
      }

      console.error(`Failed to download ${filename}: ${errorMessage}`);
      
      return {
        filename,
        success: false,
        fileSize: 0,
        downloadTime,
        error: errorMessage
      };
    }
  }

  /**
   * Get available files from CSLB data portal
   */
  async getAvailableFiles(): Promise<string[]> {
    try {
      const response = await axios.get('https://www.cslb.ca.gov/Consumers/Data.aspx', {
        timeout: 10000
      });

      const html = response.data;
      const filePattern = /\/Resources\/CSLB\/(PL|PP)\d{6}\.pdf/g;
      const matches = html.match(filePattern) || [];
      
      return matches.map(match => match.replace('/Resources/CSLB/', ''));
    } catch (error) {
      console.error('Error fetching available files:', error);
      return [];
    }
  }

  /**
   * Validate downloaded files
   */
  async validateDownloads(): Promise<{ filename: string; isValid: boolean; size: number }[]> {
    const pdfDir = path.join(DATA_DIR, 'raw-pdfs');
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    
    const results = [];
    
    for (const file of files) {
      const filePath = path.join(pdfDir, file);
      const stats = fs.statSync(filePath);
      
      // Basic validation: file size should be > 1MB for CSLB data
      const isValid = stats.size > 1024 * 1024;
      
      results.push({
        filename: file,
        isValid,
        size: stats.size
      });
      
      if (!isValid) {
        console.warn(`Warning: ${file} may be invalid (size: ${this.formatFileSize(stats.size)})`);
      }
    }
    
    return results;
  }

  /**
   * Clean up old files
   */
  async cleanupOldFiles(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = subDays(new Date(), daysToKeep);
    const pdfDir = path.join(DATA_DIR, 'raw-pdfs');
    const files = fs.readdirSync(pdfDir);
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(pdfDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted old file: ${file}`);
      }
    }
    
    return deletedCount;
  }

  /**
   * Generate download report
   */
  generateReport(): string {
    this.session.endTime = new Date();
    const duration = this.session.endTime.getTime() - this.session.startTime.getTime();
    
    const report = `
CSLB Data Download Report
========================
Session ID: ${this.session.sessionId}
Start Time: ${this.session.startTime.toISOString()}
End Time: ${this.session.endTime.toISOString()}
Duration: ${Math.round(duration / 1000)} seconds

Files Attempted: ${this.session.filesAttempted}
Files Downloaded: ${this.session.filesDownloaded}
Success Rate: ${Math.round((this.session.filesDownloaded / this.session.filesAttempted) * 100)}%
Total Size: ${this.formatFileSize(this.session.totalSize)}

Errors (${this.session.errors.length}):
${this.session.errors.map(e => `  - ${e}`).join('\n')}
`;

    // Save report to file
    const reportPath = path.join(LOGS_DIR, `download-report-${this.session.sessionId}.txt`);
    fs.writeFileSync(reportPath, report);
    
    return report;
  }

  /**
   * Get file processing queue
   */
  async getProcessingQueue(): Promise<string[]> {
    const pdfDir = path.join(DATA_DIR, 'raw-pdfs');
    const processedDir = path.join(DATA_DIR, 'processed');
    
    const pdfFiles = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    const processedFiles = fs.existsSync(processedDir) 
      ? fs.readdirSync(processedDir).map(f => f.replace('.json', '.pdf'))
      : [];
    
    // Return files that haven't been processed yet
    return pdfFiles.filter(f => !processedFiles.includes(f));
  }

  // === Helper Methods ===

  private generateSessionId(): string {
    return `CSLB_${format(new Date(), 'yyyyMMdd_HHmmss')}_${Math.random().toString(36).substr(2, 4)}`;
  }

  private ensureDirectories(): void {
    const dirs = [
      DATA_DIR,
      path.join(DATA_DIR, 'raw-pdfs'),
      path.join(DATA_DIR, 'extracted-text'),
      path.join(DATA_DIR, 'processed-csv'),
      LOGS_DIR
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Daily Download Scheduler
 */
export class CSLBDownloadScheduler {
  private downloader: CSLBDataDownloader;

  constructor() {
    this.downloader = new CSLBDataDownloader();
  }

  /**
   * Run daily download job
   */
  async runDailyJob(): Promise<void> {
    console.log('Starting daily CSLB download job...');
    
    try {
      // Download latest files
      const results = await this.downloader.downloadLatest();
      
      // Validate downloads
      const validation = await this.downloader.validateDownloads();
      
      // Generate report
      const report = this.downloader.generateReport();
      console.log(report);
      
      // Cleanup old files
      const deletedCount = await this.downloader.cleanupOldFiles(30);
      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old files`);
      }
      
      // Get processing queue
      const queue = await this.downloader.getProcessingQueue();
      if (queue.length > 0) {
        console.log(`Files ready for processing: ${queue.length}`);
        console.log(queue.join(', '));
      }
      
    } catch (error) {
      console.error('Daily download job failed:', error);
      throw error;
    }
  }

  /**
   * Run historical catch-up job
   */
  async runCatchupJob(days: number = 30): Promise<void> {
    console.log(`Starting catchup job for last ${days} days...`);
    
    try {
      const results = await this.downloader.downloadRecent(days);
      const report = this.downloader.generateReport();
      console.log(report);
      
    } catch (error) {
      console.error('Catchup job failed:', error);
      throw error;
    }
  }
}

// === CLI Usage ===
if (require.main === module) {
  const scheduler = new CSLBDownloadScheduler();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'daily';
  
  switch (command) {
    case 'daily':
      scheduler.runDailyJob()
        .then(() => {
          console.log('Daily download completed successfully');
          process.exit(0);
        })
        .catch(error => {
          console.error('Daily download failed:', error);
          process.exit(1);
        });
      break;
      
    case 'catchup':
      const days = parseInt(args[1]) || 30;
      scheduler.runCatchupJob(days)
        .then(() => {
          console.log(`Catchup download completed successfully`);
          process.exit(0);
        })
        .catch(error => {
          console.error('Catchup download failed:', error);
          process.exit(1);
        });
      break;
      
    case 'validate':
      const downloader = new CSLBDataDownloader();
      downloader.validateDownloads()
        .then(results => {
          console.log('Validation results:');
          results.forEach(r => {
            console.log(`${r.filename}: ${r.isValid ? 'VALID' : 'INVALID'} (${r.size} bytes)`);
          });
          process.exit(0);
        })
        .catch(error => {
          console.error('Validation failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: ts-node cslb-downloader.ts [daily|catchup|validate] [days]');
      console.log('  daily    - Download latest files');
      console.log('  catchup  - Download recent files (default: 30 days)');
      console.log('  validate - Validate downloaded files');
      process.exit(1);
  }
}