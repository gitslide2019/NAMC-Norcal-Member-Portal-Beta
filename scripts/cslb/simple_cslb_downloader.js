/**
 * Simple CSLB Data Downloader
 * Downloads PDF files from CSLB website using Node.js built-in modules
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const dataDir = './data/cslb/raw-pdfs';
const logsDir = './data/logs';

function ensureDirectories() {
  const dirs = [dataDir, logsDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

function formatDate(date) {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(dataDir, filename);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`File ${filename} already exists (${formatFileSize(stats.size)})`);
      resolve({
        filename,
        success: true,
        fileSize: stats.size,
        downloadTime: 0,
        alreadyExists: true
      });
      return;
    }

    console.log(`Downloading: ${filename} from ${url}`);
    const file = fs.createWriteStream(filePath);
    const startTime = Date.now();

    const request = https.get(url, {
      headers: {
        'User-Agent': 'NAMC-Data-Pipeline/1.0'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filePath);
          const downloadTime = Date.now() - startTime;
          
          console.log(`Downloaded: ${filename} (${formatFileSize(stats.size)}) in ${downloadTime}ms`);
          
          resolve({
            filename,
            success: true,
            fileSize: stats.size,
            downloadTime
          });
        });
      } else {
        file.close();
        fs.unlinkSync(filePath);
        
        let errorMessage;
        if (response.statusCode === 404) {
          errorMessage = 'File not found (may not be available yet)';
        } else {
          errorMessage = `HTTP ${response.statusCode}`;
        }
        
        console.error(`Failed to download ${filename}: ${errorMessage}`);
        resolve({
          filename,
          success: false,
          fileSize: 0,
          downloadTime: Date.now() - startTime,
          error: errorMessage
        });
      }
    });

    request.on('error', (error) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      console.error(`Error downloading ${filename}:`, error.message);
      resolve({
        filename,
        success: false,
        fileSize: 0,
        downloadTime: Date.now() - startTime,
        error: error.message
      });
    });

    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      console.error(`Download timeout for ${filename}`);
      resolve({
        filename,
        success: false,
        fileSize: 0,
        downloadTime: Date.now() - startTime,
        error: 'Download timeout'
      });
    });
  });
}

function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

async function downloadForDate(date) {
  const dateStr = formatDate(date);
  console.log(`\nDownloading CSLB files for ${date.toDateString()} (${dateStr})`);

  const baseUrl = 'https://www.cslb.ca.gov/Resources/CSLB/';
  const fileTypes = ['PL', 'PP']; // Business and Personnel files
  const results = [];

  for (const fileType of fileTypes) {
    const filename = `${fileType}${dateStr}.pdf`;
    const url = `${baseUrl}${filename}`;
    
    const result = await downloadFile(url, filename);
    results.push(result);
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

async function downloadRecent(days = 7) {
  console.log(`Downloading recent CSLB files (last ${days} days)...`);
  
  const results = [];
  const endDate = new Date();
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(endDate);
    currentDate.setDate(endDate.getDate() - i);
    
    const dateResults = await downloadForDate(currentDate);
    results.push(...dateResults);
    
    // Delay between dates
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}

function generateReport(results) {
  const sessionId = `CSLB_${formatDate(new Date())}_${Math.random().toString(36).substr(2, 4)}`;
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalSize = successful.reduce((sum, r) => sum + r.fileSize, 0);
  
  const report = `
CSLB Data Download Report
========================
Session ID: ${sessionId}
Date: ${new Date().toISOString()}

Files Attempted: ${results.length}
Files Downloaded: ${successful.length}
Files Failed: ${failed.length}
Success Rate: ${Math.round((successful.length / results.length) * 100)}%
Total Size: ${formatFileSize(totalSize)}

Successful Downloads:
${successful.map(r => `  ✓ ${r.filename} (${formatFileSize(r.fileSize)})${r.alreadyExists ? ' [already existed]' : ''}`).join('\n')}

${failed.length > 0 ? `Failed Downloads:
${failed.map(r => `  ✗ ${r.filename} - ${r.error}`).join('\n')}` : ''}
`;

  // Save report to file
  const reportPath = path.join(logsDir, `download-report-${sessionId}.txt`);
  fs.writeFileSync(reportPath, report);
  
  console.log(report);
  console.log(`\nReport saved to: ${reportPath}`);
  
  return report;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'daily';
  
  console.log('CSLB Data Downloader - Simple Version');
  console.log('=====================================');
  
  ensureDirectories();
  
  let results = [];
  
  switch (command) {
    case 'daily':
      console.log('Downloading latest CSLB files...');
      results = await downloadForDate(new Date());
      break;
      
    case 'recent':
      const days = parseInt(args[1]) || 7;
      results = await downloadRecent(days);
      break;
      
    case 'date':
      if (!args[1]) {
        console.error('Please provide a date in YYYY-MM-DD format');
        process.exit(1);
      }
      const targetDate = new Date(args[1]);
      if (isNaN(targetDate.getTime())) {
        console.error('Invalid date format. Use YYYY-MM-DD');
        process.exit(1);
      }
      results = await downloadForDate(targetDate);
      break;
      
    default:
      console.log('Usage: node simple_cslb_downloader.js [daily|recent|date] [options]');
      console.log('  daily           - Download latest files');
      console.log('  recent [days]   - Download recent files (default: 7 days)');
      console.log('  date YYYY-MM-DD - Download files for specific date');
      process.exit(1);
  }
  
  generateReport(results);
  
  console.log('\nDownload completed!');
}

if (require.main === module) {
  main().catch(error => {
    console.error('Download failed:', error);
    process.exit(1);
  });
}