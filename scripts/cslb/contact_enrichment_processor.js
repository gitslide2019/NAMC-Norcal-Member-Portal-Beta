/**
 * Contact Enrichment Processor - Phase 1
 * 
 * Extracts and cleans business names from CSLB raw data
 * Prepares contractor data for contact information enrichment
 * 
 * Phase 1 Tasks:
 * 1. Extract clean business names from raw_text fields
 * 2. Normalize addresses for better search accuracy
 * 3. Create priority scoring for contractors
 * 4. Generate enhanced CSV with email/phone columns
 */

const fs = require('fs');
const path = require('path');

class ContactEnrichmentProcessor {
  constructor() {
    this.csvDir = './data/cslb/processed-csv';
    this.enhancedDir = './data/cslb/enhanced-csv';
    this.reportDir = './data/logs';
    
    this.stats = {
      totalContractors: 0,
      businessNamesExtracted: 0,
      addressesNormalized: 0,
      phoneNumbersFound: 0,
      priorityScored: 0,
      errors: []
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.enhancedDir)) {
      fs.mkdirSync(this.enhancedDir, { recursive: true });
      console.log(`Created directory: ${this.enhancedDir}`);
    }
  }

  /**
   * Phase 1: Process all business listing files
   */
  async processAllBusinessFiles() {
    console.log('🔄 Phase 1: Processing CSLB Business Files for Contact Enrichment');
    console.log('=' .repeat(70));

    const businessFiles = fs.readdirSync(this.csvDir)
      .filter(file => file.startsWith('PL') && file.endsWith('.csv'))
      .sort();

    console.log(`Found ${businessFiles.length} business files to process`);

    const allContractors = [];

    for (const file of businessFiles) {
      console.log(`\n📄 Processing: ${file}`);
      const contractors = await this.processBusinessFile(file);
      allContractors.push(...contractors);
      console.log(`✅ Processed ${contractors.length} contractors from ${file}`);
    }

    // Sort by priority score (highest first)
    allContractors.sort((a, b) => b.priority_score - a.priority_score);

    // Generate consolidated enhanced CSV
    const enhancedFile = await this.generateEnhancedCSV(allContractors);

    // Generate processing report
    this.generateProcessingReport(allContractors, enhancedFile);

    return {
      totalContractors: allContractors.length,
      enhancedFile: enhancedFile,
      stats: this.stats
    };
  }

  /**
   * Process individual business CSV file
   */
  async processBusinessFile(filename) {
    const filePath = path.join(this.csvDir, filename);
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n');
    
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const contractors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const contractor = this.parseCsvLine(line, headers);
        const enhancedContractor = await this.enhanceContractorData(contractor);
        
        if (enhancedContractor) {
          contractors.push(enhancedContractor);
          this.stats.totalContractors++;
        }
      } catch (error) {
        this.stats.errors.push(`Line ${i} in ${filename}: ${error.message}`);
        console.log(`⚠️  Error processing line ${i}: ${error.message}`);
      }
    }

    return contractors;
  }

  /**
   * Parse CSV line handling quoted fields
   */
  parseCsvLine(line, headers) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current); // Add last value

    const contractor = {};
    headers.forEach((header, index) => {
      contractor[header] = values[index] || '';
    });

    return contractor;
  }

  /**
   * Enhance contractor data with extracted business name, normalized address, etc.
   */
  async enhanceContractorData(contractor) {
    try {
      const enhanced = {
        ...contractor,
        // New fields for contact enrichment
        clean_business_name: '',
        clean_address: '',
        city: '',
        state: 'CA',
        zip_code: '',
        existing_phone: '',
        existing_email: '',
        website: '',
        priority_score: 0,
        search_terms: [],
        enrichment_status: 'pending',
        data_quality_score: 0
      };

      // Extract clean business name from raw_text
      enhanced.clean_business_name = this.extractBusinessName(contractor.raw_text);
      if (enhanced.clean_business_name) {
        this.stats.businessNamesExtracted++;
      }

      // Normalize address information
      const addressInfo = this.normalizeAddress(contractor.city_state_zip, contractor.address);
      enhanced.clean_address = addressInfo.address;
      enhanced.city = addressInfo.city;
      enhanced.zip_code = addressInfo.zipCode;
      if (addressInfo.city) {
        this.stats.addressesNormalized++;
      }

      // Extract existing phone if available
      enhanced.existing_phone = this.extractPhone(contractor.phone || contractor.raw_text);
      if (enhanced.existing_phone) {
        this.stats.phoneNumbersFound++;
      }

      // Generate search terms for enrichment
      enhanced.search_terms = this.generateSearchTerms(enhanced);

      // Calculate priority score
      enhanced.priority_score = this.calculatePriorityScore(enhanced);
      if (enhanced.priority_score > 0) {
        this.stats.priorityScored++;
      }

      // Calculate initial data quality score
      enhanced.data_quality_score = this.calculateDataQualityScore(enhanced);

      return enhanced;

    } catch (error) {
      console.log(`⚠️  Error enhancing contractor ${contractor.license_number}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract clean business name from raw text
   */
  extractBusinessName(rawText) {
    if (!rawText) return '';

    try {
      // Common patterns in CSLB raw text for business names
      const patterns = [
        // Pattern: "LICENSE_NUMBER O TYPE E BUSINESS_NAME"
        /\d+\s+[A-Z]\s+[A-Z]{2,4}\s+[A-Z]\s+([A-Z][A-Z0-9\s&.,'-]+?)(?:\s+\d|\s+[A-Z]{2}\s+\d)/,
        // Pattern: Look for business name after license number and codes
        /\d{11}\s+[A-Z]\s+[A-Z]{2,4}\s+[A-Z]\s+(.+?)(?:\s+\d{4}\s)/,
        // More flexible pattern
        /[A-Z]{3,}[\s&.,'-]*[A-Z]*(?:\s+(?:INC|LLC|CORP|CO|COMPANY|CONSTRUCTION|BUILDER|CONTRACTOR))?/
      ];

      for (const pattern of patterns) {
        const match = rawText.match(pattern);
        if (match && match[1]) {
          let businessName = match[1].trim();
          
          // Clean up the business name
          businessName = businessName
            .replace(/\s+/g, ' ')  // Multiple spaces to single
            .replace(/^\W+|\W+$/g, '')  // Remove leading/trailing non-word chars
            .replace(/\s+(INC|LLC|CORP|CO|COMPANY)\.?$/i, ' $1')  // Normalize endings
            .trim();

          if (businessName.length > 3 && businessName.length < 100) {
            return businessName;
          }
        }
      }

      // Fallback: extract any sequence of capital letters that looks like a business name
      const fallbackMatch = rawText.match(/\b([A-Z][A-Z\s&.'-]*[A-Z](?:\s+(?:INC|LLC|CORP|CO|COMPANY|CONSTRUCTION|BUILDER|CONTRACTOR))?)\b/);
      if (fallbackMatch && fallbackMatch[1] && fallbackMatch[1].length > 5) {
        return fallbackMatch[1].trim();
      }

      return '';
    } catch (error) {
      console.log(`Error extracting business name from: ${rawText}`);
      return '';
    }
  }

  /**
   * Normalize address information
   */
  normalizeAddress(cityStateZip, address) {
    const result = {
      address: '',
      city: '',
      state: 'CA',
      zipCode: ''
    };

    try {
      // Extract city and zip from city_state_zip field
      if (cityStateZip) {
        // Pattern: "CITY CA ZIPCODE" or "CITY ZIPCODE"
        const cityZipMatch = cityStateZip.match(/([A-Z\s]+?)(?:\s+CA)?\s+(\d{5}(?:-\d{4})?)/);
        if (cityZipMatch) {
          result.city = cityZipMatch[1].trim();
          result.zipCode = cityZipMatch[2];
        } else {
          // Just extract city name
          const cityMatch = cityStateZip.match(/([A-Z\s]+)/);
          if (cityMatch) {
            result.city = cityMatch[1].trim();
          }
        }
      }

      // Clean up address
      if (address) {
        result.address = address
          .replace(/\s+/g, ' ')
          .replace(/^[,\s]+|[,\s]+$/g, '')
          .trim();
      }

      // Validate city name (should be reasonable length)
      if (result.city.length < 2 || result.city.length > 30) {
        result.city = '';
      }

      return result;
    } catch (error) {
      console.log(`Error normalizing address: ${cityStateZip}, ${address}`);
      return result;
    }
  }

  /**
   * Extract phone number if present
   */
  extractPhone(text) {
    if (!text) return '';

    try {
      // Common phone patterns
      const phonePatterns = [
        /\((\d{3})\)\s*(\d{3})-?(\d{4})/,  // (555) 123-4567
        /(\d{3})[-.\s](\d{3})[-.\s](\d{4})/,  // 555-123-4567 or 555.123.4567
        /(\d{10})/  // 5551234567
      ];

      for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match) {
          if (match.length === 4) {
            // Format as (555) 123-4567
            return `(${match[1]}) ${match[2]}-${match[3]}`;
          } else if (match[1] && match[1].length === 10) {
            // Format 10-digit number
            const phone = match[1];
            return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
          }
        }
      }

      return '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Generate search terms for enrichment APIs
   */
  generateSearchTerms(contractor) {
    const terms = [];

    if (contractor.clean_business_name) {
      terms.push(contractor.clean_business_name);
      
      // Add variations
      if (contractor.city) {
        terms.push(`${contractor.clean_business_name} ${contractor.city}`);
        terms.push(`${contractor.clean_business_name} ${contractor.city} CA`);
      }
      
      // Add with classification
      if (contractor.classifications) {
        const classifications = contractor.classifications.split(';')[0]; // First classification
        terms.push(`${contractor.clean_business_name} contractor`);
        terms.push(`${contractor.clean_business_name} ${classifications} contractor`);
      }
    }

    return terms.filter(term => term.length > 0).slice(0, 5); // Limit to 5 terms
  }

  /**
   * Calculate priority score for targeting
   */
  calculatePriorityScore(contractor) {
    let score = 0;

    try {
      // Business name quality (0-30 points)
      if (contractor.clean_business_name) {
        if (contractor.clean_business_name.length > 10) score += 20;
        else if (contractor.clean_business_name.length > 5) score += 10;
        
        // Bonus for professional endings
        if (/\b(INC|LLC|CORP|COMPANY|CONSTRUCTION|BUILDER|CONTRACTOR)\b/i.test(contractor.clean_business_name)) {
          score += 10;
        }
      }

      // Bond amount (0-25 points)
      const bondAmount = this.parseNumeric(contractor.bond_amount);
      if (bondAmount >= 1000000) score += 25;
      else if (bondAmount >= 500000) score += 20;
      else if (bondAmount >= 100000) score += 15;
      else if (bondAmount >= 50000) score += 10;
      else if (bondAmount > 0) score += 5;

      // Classification desirability (0-20 points)
      if (contractor.classifications) {
        const classifications = contractor.classifications.toLowerCase();
        if (classifications.includes('b')) score += 15; // General Building
        if (classifications.includes('c-10')) score += 15; // Electrical
        if (classifications.includes('c-20')) score += 15; // HVAC
        if (classifications.includes('c-46')) score += 10; // Solar
        if (classifications.includes('c-2')) score += 10; // Insulation
      }

      // Location desirability (0-15 points) - Bay Area focus
      if (contractor.city) {
        const city = contractor.city.toUpperCase();
        const topTierCities = ['SAN FRANCISCO', 'SAN JOSE', 'OAKLAND', 'FREMONT'];
        const secondTierCities = ['SANTA CLARA', 'SUNNYVALE', 'HAYWARD', 'RICHMOND'];
        
        if (topTierCities.some(c => city.includes(c))) score += 15;
        else if (secondTierCities.some(c => city.includes(c))) score += 10;
        else if (city.includes('SAN') || city.includes('SANTA')) score += 5;
      }

      // Data completeness (0-10 points)
      if (contractor.existing_phone) score += 5;
      if (contractor.clean_address) score += 3;
      if (contractor.zip_code) score += 2;

      return Math.min(score, 100); // Cap at 100
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate data quality score
   */
  calculateDataQualityScore(contractor) {
    let score = 0;

    if (contractor.clean_business_name) score += 25;
    if (contractor.city) score += 20;
    if (contractor.clean_address) score += 15;
    if (contractor.zip_code) score += 15;
    if (contractor.classifications) score += 10;
    if (contractor.existing_phone) score += 10;
    if (contractor.license_number) score += 5;

    return score;
  }

  /**
   * Parse numeric value from string
   */
  parseNumeric(value) {
    if (!value) return 0;
    const cleaned = value.toString().replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Generate enhanced CSV with all contractors
   */
  async generateEnhancedCSV(contractors) {
    const enhancedFile = path.join(this.enhancedDir, 'enhanced_contractors_for_enrichment.csv');
    
    const headers = [
      'license_number', 'clean_business_name', 'original_business_name_field',
      'clean_address', 'city', 'state', 'zip_code',
      'existing_phone', 'existing_email', 'website',
      'classifications', 'bond_amount', 'expire_date',
      'priority_score', 'data_quality_score', 'search_terms',
      'enrichment_status', 'enriched_email', 'enriched_phone',
      'email_confidence', 'phone_confidence', 'last_enriched',
      'data_source', 'notes', 'raw_text'
    ];

    let csvContent = headers.join(',') + '\n';

    for (const contractor of contractors) {
      const row = [
        contractor.license_number || '',
        this.escapeCsv(contractor.clean_business_name || ''),
        this.escapeCsv(contractor.business_name || ''),
        this.escapeCsv(contractor.clean_address || ''),
        this.escapeCsv(contractor.city || ''),
        contractor.state || 'CA',
        contractor.zip_code || '',
        this.escapeCsv(contractor.existing_phone || ''),
        contractor.existing_email || '',
        contractor.website || '',
        this.escapeCsv(contractor.classifications || ''),
        contractor.bond_amount || '',
        contractor.expire_date || '',
        contractor.priority_score || 0,
        contractor.data_quality_score || 0,
        this.escapeCsv(contractor.search_terms.join('; ') || ''),
        contractor.enrichment_status || 'pending',
        '', // enriched_email (to be filled by enrichment process)
        '', // enriched_phone (to be filled by enrichment process)
        '', // email_confidence
        '', // phone_confidence
        '', // last_enriched
        '', // data_source
        '', // notes
        this.escapeCsv(contractor.raw_text || '')
      ];

      csvContent += row.join(',') + '\n';
    }

    fs.writeFileSync(enhancedFile, csvContent);
    console.log(`\n✅ Generated enhanced CSV: ${enhancedFile}`);
    console.log(`📊 Total contractors ready for enrichment: ${contractors.length}`);

    return enhancedFile;
  }

  /**
   * Escape CSV values
   */
  escapeCsv(value) {
    if (!value) return '';
    const str = value.toString();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Generate processing report
   */
  generateProcessingReport(contractors, enhancedFile) {
    const sessionId = `ENHANCE_${Date.now()}`;
    
    // Calculate priority distribution
    const priorityDistribution = {
      high: contractors.filter(c => c.priority_score >= 70).length,
      medium: contractors.filter(c => c.priority_score >= 40 && c.priority_score < 70).length,
      low: contractors.filter(c => c.priority_score < 40).length
    };

    // Calculate top business types
    const businessTypes = {};
    contractors.forEach(c => {
      if (c.classifications) {
        c.classifications.split(';').forEach(cls => {
          businessTypes[cls] = (businessTypes[cls] || 0) + 1;
        });
      }
    });

    const topBusinessTypes = Object.entries(businessTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const report = `
Contact Enrichment Processing Report - Phase 1
=============================================
Session ID: ${sessionId}
Generated: ${new Date().toISOString()}
Enhanced File: ${enhancedFile}

PROCESSING STATISTICS:
=====================
Total Contractors Processed: ${this.stats.totalContractors}
Business Names Extracted: ${this.stats.businessNamesExtracted} (${Math.round(this.stats.businessNamesExtracted/this.stats.totalContractors*100)}%)
Addresses Normalized: ${this.stats.addressesNormalized} (${Math.round(this.stats.addressesNormalized/this.stats.totalContractors*100)}%)
Existing Phone Numbers Found: ${this.stats.phoneNumbersFound} (${Math.round(this.stats.phoneNumbersFound/this.stats.totalContractors*100)}%)
Priority Scores Calculated: ${this.stats.priorityScored} (${Math.round(this.stats.priorityScored/this.stats.totalContractors*100)}%)

PRIORITY DISTRIBUTION:
=====================
High Priority (70-100): ${priorityDistribution.high} contractors
Medium Priority (40-69): ${priorityDistribution.medium} contractors  
Low Priority (0-39): ${priorityDistribution.low} contractors

TOP CONTRACTOR CLASSIFICATIONS:
==============================
${topBusinessTypes.map(([type, count]) => `${type}: ${count} contractors`).join('\n')}

TOP PRIORITY CONTRACTORS (Sample):
=================================
${contractors.slice(0, 10).map(c => 
  `${c.license_number} | ${c.clean_business_name} | ${c.city} | Score: ${c.priority_score}`
).join('\n')}

DATA QUALITY SUMMARY:
====================
Average Data Quality Score: ${Math.round(contractors.reduce((sum, c) => sum + c.data_quality_score, 0) / contractors.length)}
Contractors with Phone: ${this.stats.phoneNumbersFound}
Contractors Missing Business Name: ${this.stats.totalContractors - this.stats.businessNamesExtracted}
Contractors Missing City: ${contractors.filter(c => !c.city).length}

ERRORS ENCOUNTERED:
==================
${this.stats.errors.length > 0 ? this.stats.errors.join('\n') : 'No errors encountered'}

NEXT STEPS:
===========
1. Review enhanced CSV file: ${enhancedFile}
2. Begin Phase 2: Contact enrichment using APIs
3. Target high-priority contractors first (${priorityDistribution.high} contractors)
4. Set up data enrichment service integrations

Ready for Phase 2: Contact Information Enrichment
`;

    const reportPath = path.join(this.reportDir, `contact-enrichment-phase1-${sessionId}.txt`);
    fs.writeFileSync(reportPath, report);
    
    console.log('\n' + '='.repeat(70));
    console.log(report);
    console.log(`📄 Full report saved to: ${reportPath}`);

    return reportPath;
  }
}

// CLI Usage
async function main() {
  console.log('🚀 Contact Enrichment Processor - Phase 1');
  console.log('==========================================');
  
  const processor = new ContactEnrichmentProcessor();
  
  try {
    const result = await processor.processAllBusinessFiles();
    
    console.log('\n🎉 Phase 1 completed successfully!');
    console.log(`📊 ${result.totalContractors} contractors prepared for enrichment`);
    console.log(`📁 Enhanced data file: ${result.enhancedFile}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Phase 1 failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ContactEnrichmentProcessor;