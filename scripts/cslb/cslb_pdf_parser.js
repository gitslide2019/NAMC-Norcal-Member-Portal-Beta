/**
 * CSLB PDF Parser
 * Extracts contractor data from CSLB PDF files and converts to structured CSV
 * 
 * Usage: node cslb_pdf_parser.js [file.pdf|all]
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class CSLBPDFParser {
  constructor() {
    this.pdfDir = './data/cslb/raw-pdfs';
    this.textDir = './data/cslb/extracted-text';
    this.csvDir = './data/cslb/processed-csv';
    this.logsDir = './data/logs';
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.textDir, this.csvDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Extract text from PDF using pdftotext (from poppler-utils)
   */
  async extractTextFromPDF(pdfPath) {
    return new Promise((resolve, reject) => {
      const filename = path.basename(pdfPath, '.pdf');
      const outputPath = path.join(this.textDir, `${filename}.txt`);
      
      // Check if text file already exists
      if (fs.existsSync(outputPath)) {
        console.log(`Text already extracted: ${filename}.txt`);
        const text = fs.readFileSync(outputPath, 'utf-8');
        resolve(text);
        return;
      }

      console.log(`Extracting text from: ${filename}.pdf`);
      
      // Try using pdftotext command (requires poppler-utils)
      const pdftotext = spawn('pdftotext', ['-layout', pdfPath, outputPath]);
      
      pdftotext.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          const text = fs.readFileSync(outputPath, 'utf-8');
          console.log(`Successfully extracted text: ${filename}.txt (${text.length} chars)`);
          resolve(text);
        } else {
          // Fallback: try without layout preservation
          const fallback = spawn('pdftotext', [pdfPath, outputPath]);
          
          fallback.on('close', (fallbackCode) => {
            if (fallbackCode === 0 && fs.existsSync(outputPath)) {
              const text = fs.readFileSync(outputPath, 'utf-8');
              console.log(`Extracted text (fallback): ${filename}.txt (${text.length} chars)`);
              resolve(text);
            } else {
              reject(new Error(`Failed to extract text from ${filename}.pdf. Is pdftotext installed?`));
            }
          });
          
          fallback.on('error', (error) => {
            reject(new Error(`pdftotext command failed: ${error.message}. Install with: brew install poppler`));
          });
        }
      });
      
      pdftotext.on('error', (error) => {
        reject(new Error(`pdftotext command failed: ${error.message}. Install with: brew install poppler`));
      });
    });
  }

  /**
   * Parse Business Listing (PL) file
   */
  parseBusinessListing(text, filename) {
    console.log(`Parsing business listing: ${filename}`);
    
    const lines = text.split('\n');
    const contractors = [];
    let currentContractor = null;
    let lineNumber = 0;
    
    // Skip header lines and find start of data
    let dataStarted = false;
    
    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Look for license number pattern (typically starts with a number)
      const licenseMatch = trimmed.match(/^([0-9]+)\s+(.+)/);
      
      if (licenseMatch) {
        // Save previous contractor if exists
        if (currentContractor) {
          contractors.push(currentContractor);
        }
        
        // Start new contractor
        const licenseNumber = licenseMatch[1];
        const remainingText = licenseMatch[2];
        
        currentContractor = {
          license_number: licenseNumber,
          line_number: lineNumber,
          raw_text: trimmed,
          parsed_fields: {}
        };
        
        // Try to parse the remaining text
        this.parseBusinessLine(currentContractor, remainingText);
        dataStarted = true;
      } else if (dataStarted && currentContractor) {
        // Continuation line for current contractor
        currentContractor.raw_text += ' ' + trimmed;
        this.parseBusinessLine(currentContractor, trimmed);
      }
    }
    
    // Don't forget the last contractor
    if (currentContractor) {
      contractors.push(currentContractor);
    }
    
    console.log(`Parsed ${contractors.length} contractors from ${filename}`);
    return contractors;
  }

  /**
   * Parse individual business line
   */
  parseBusinessLine(contractor, text) {
    // Common patterns in CSLB business listings
    const patterns = {
      business_name: /^([A-Z][A-Z0-9\s&.,'-]+?)(?:\s+(?:ACTIVE|INACTIVE|EXPIRED|SUSPENDED))/,
      status: /(ACTIVE|INACTIVE|EXPIRED|SUSPENDED)/,
      address: /\d+\s+[A-Z\s]+(?:ST|STREET|AVE|AVENUE|BLVD|BOULEVARD|RD|ROAD|DR|DRIVE|CT|COURT|PL|PLACE|WAY|LN|LANE)/i,
      city_state_zip: /([A-Z\s]+),?\s+(CA|CALIFORNIA)\s+(\d{5}(?:-\d{4})?)/,
      phone: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      bond_amount: /\$[\d,]+\.?\d*/,
      classifications: /\b[ABC]-?\d+\b|\bASB\b|\bHAZ\b/g,
      expire_date: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
    };

    // Apply patterns
    for (const [field, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        if (field === 'classifications') {
          contractor.parsed_fields[field] = match; // Array of all matches
        } else {
          contractor.parsed_fields[field] = match[1] || match[0];
        }
      }
    }
  }

  /**
   * Parse Personnel Listing (PP) file
   */
  parsePersonnelListing(text, filename) {
    console.log(`Parsing personnel listing: ${filename}`);
    
    const lines = text.split('\n');
    const personnel = [];
    let lineNumber = 0;
    
    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Look for license number pattern followed by person name
      const personnelMatch = trimmed.match(/^([0-9]+)\s+([A-Z][A-Z\s,.-]+?)(?:\s+(OWNER|RMO|RME|PARTNER|OFFICER|MEMBER))?/);
      
      if (personnelMatch) {
        const person = {
          license_number: personnelMatch[1],
          person_name: personnelMatch[2].trim(),
          title: personnelMatch[3] || null,
          line_number: lineNumber,
          raw_text: trimmed
        };
        
        // Try to parse additional info (dates, etc.)
        const dateMatch = trimmed.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/g);
        if (dateMatch && dateMatch.length > 0) {
          person.association_date = dateMatch[0];
          if (dateMatch.length > 1) {
            person.disassociation_date = dateMatch[1];
          }
        }
        
        personnel.push(person);
      }
    }
    
    console.log(`Parsed ${personnel.length} personnel records from ${filename}`);
    return personnel;
  }

  /**
   * Convert parsed data to CSV format
   */
  saveToCSV(data, filename, type) {
    const csvPath = path.join(this.csvDir, `${filename}.csv`);
    
    if (type === 'business') {
      // Business CSV headers
      const headers = [
        'license_number', 'business_name', 'status', 'address', 'city_state_zip',
        'phone', 'bond_amount', 'classifications', 'expire_date', 'line_number', 'raw_text'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      for (const contractor of data) {
        const row = headers.map(header => {
          let value = contractor.parsed_fields[header] || contractor[header] || '';
          
          // Handle arrays (like classifications)
          if (Array.isArray(value)) {
            value = value.join(';');
          }
          
          // Escape quotes and wrap in quotes if needed
          if (typeof value === 'string') {
            value = value.replace(/"/g, '""');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              value = `"${value}"`;
            }
          }
          
          return value;
        });
        
        csvContent += row.join(',') + '\n';
      }
      
      fs.writeFileSync(csvPath, csvContent);
      console.log(`Saved business data to: ${csvPath} (${data.length} records)`);
      
    } else if (type === 'personnel') {
      // Personnel CSV headers
      const headers = [
        'license_number', 'person_name', 'title', 'association_date', 
        'disassociation_date', 'line_number', 'raw_text'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      for (const person of data) {
        const row = headers.map(header => {
          let value = person[header] || '';
          
          // Escape quotes and wrap in quotes if needed
          if (typeof value === 'string') {
            value = value.replace(/"/g, '""');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              value = `"${value}"`;
            }
          }
          
          return value;
        });
        
        csvContent += row.join(',') + '\n';
      }
      
      fs.writeFileSync(csvPath, csvContent);
      console.log(`Saved personnel data to: ${csvPath} (${data.length} records)`);
    }
    
    return csvPath;
  }

  /**
   * Process a single PDF file
   */
  async processPDF(pdfFilename) {
    const pdfPath = path.join(this.pdfDir, pdfFilename);
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }
    
    console.log(`\nProcessing: ${pdfFilename}`);
    
    try {
      // Extract text from PDF
      const text = await this.extractTextFromPDF(pdfPath);
      
      // Determine file type and parse accordingly
      const baseName = path.basename(pdfFilename, '.pdf');
      let data, type, csvPath;
      
      if (baseName.startsWith('PL')) {
        // Business listing
        type = 'business';
        data = this.parseBusinessListing(text, pdfFilename);
        csvPath = this.saveToCSV(data, baseName, type);
      } else if (baseName.startsWith('PP')) {
        // Personnel listing
        type = 'personnel';
        data = this.parsePersonnelListing(text, pdfFilename);
        csvPath = this.saveToCSV(data, baseName, type);
      } else {
        throw new Error(`Unknown file type: ${pdfFilename}`);
      }
      
      return {
        filename: pdfFilename,
        type: type,
        records_parsed: data.length,
        csv_file: csvPath,
        success: true
      };
      
    } catch (error) {
      console.error(`Error processing ${pdfFilename}:`, error.message);
      return {
        filename: pdfFilename,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process all PDF files in the directory
   */
  async processAllPDFs() {
    const pdfFiles = fs.readdirSync(this.pdfDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .sort();
    
    console.log(`Found ${pdfFiles.length} PDF files to process`);
    
    const results = [];
    
    for (const pdfFile of pdfFiles) {
      const result = await this.processPDF(pdfFile);
      results.push(result);
      
      // Small delay between files
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  /**
   * Generate processing report
   */
  generateReport(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalRecords = successful.reduce((sum, r) => sum + (r.records_parsed || 0), 0);
    
    const businessFiles = successful.filter(r => r.type === 'business');
    const personnelFiles = successful.filter(r => r.type === 'personnel');
    
    const report = `
CSLB PDF Processing Report
==========================
Date: ${new Date().toISOString()}

Files Processed: ${results.length}
Files Successful: ${successful.length}
Files Failed: ${failed.length}
Success Rate: ${Math.round((successful.length / results.length) * 100)}%

Total Records Extracted: ${totalRecords}
Business Files: ${businessFiles.length} (${businessFiles.reduce((sum, r) => sum + r.records_parsed, 0)} contractors)
Personnel Files: ${personnelFiles.length} (${personnelFiles.reduce((sum, r) => sum + r.records_parsed, 0)} personnel)

Successful Processing:
${successful.map(r => `  ✓ ${r.filename} → ${r.records_parsed} ${r.type} records`).join('\n')}

${failed.length > 0 ? `Failed Processing:
${failed.map(r => `  ✗ ${r.filename} - ${r.error}`).join('\n')}` : ''}

CSV Files Generated:
${successful.map(r => `  → ${r.csv_file}`).join('\n')}
`;

    // Save report
    const reportPath = path.join(this.logsDir, `pdf-processing-report-${Date.now()}.txt`);
    fs.writeFileSync(reportPath, report);
    
    console.log(report);
    console.log(`\nReport saved to: ${reportPath}`);
    
    return report;
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);
  const parser = new CSLBPDFParser();
  
  console.log('CSLB PDF Parser');
  console.log('===============');
  
  try {
    let results;
    
    if (args.length === 0 || args[0] === 'all') {
      // Process all PDFs
      results = await parser.processAllPDFs();
    } else {
      // Process specific file
      const filename = args[0];
      const result = await parser.processPDF(filename);
      results = [result];
    }
    
    // Generate report
    parser.generateReport(results);
    
    console.log('\nPDF processing completed!');
    
  } catch (error) {
    console.error('Processing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}