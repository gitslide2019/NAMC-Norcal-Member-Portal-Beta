/**
 * Email Validator Service
 * 
 * Validates email addresses for deliverability and quality
 * Uses multiple validation techniques:
 * 1. Syntax validation (RFC 5322)
 * 2. Domain validation (DNS/MX records)
 * 3. Disposable email detection
 * 4. Professional email scoring
 */

const dns = require('dns');
const util = require('util');
const fs = require('fs');
const path = require('path');

class EmailValidator {
  constructor() {
    this.dnsLookup = util.promisify(dns.resolveMx);
    
    // DNS cache to avoid repeated lookups
    this.dnsCache = new Map();
    this.dnsTimeout = 3000; // 3 second timeout for DNS lookups
    
    // Common disposable email domains
    this.disposableDomains = new Set([
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
      'mailinator.com', 'maildrop.cc', 'throwaway.email',
      'temp-mail.org', 'yopmail.com', 'sharklasers.com'
    ]);
    
    // Professional email indicators
    this.professionalDomains = new Set([
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'comcast.net', 'verizon.net'
    ]);
    
    this.stats = {
      total: 0,
      valid: 0,
      invalid: 0,
      risky: 0,
      professional: 0,
      businessDomain: 0,
      errors: []
    };
  }

  /**
   * Validate a single email address
   */
  async validateEmail(email, businessName = '') {
    try {
      const result = {
        email: email,
        isValid: false,
        score: 0,
        issues: [],
        recommendations: [],
        details: {
          syntaxValid: false,
          domainValid: false,
          mxRecordExists: false,
          isDisposable: false,
          isProfessional: false,
          isBusinessDomain: false,
          domainAge: null,
          confidence: 0
        }
      };

      // Step 1: Syntax validation
      const syntaxResult = this.validateSyntax(email);
      result.details.syntaxValid = syntaxResult.isValid;
      if (!syntaxResult.isValid) {
        result.issues.push(...syntaxResult.issues);
        return result;
      }

      const [localPart, domain] = email.toLowerCase().split('@');

      // Step 2: Domain validation
      const domainResult = await this.validateDomain(domain);
      result.details.domainValid = domainResult.isValid;
      result.details.mxRecordExists = domainResult.hasMxRecord;
      
      if (!domainResult.isValid) {
        result.issues.push(...domainResult.issues);
      }

      // Step 3: Disposable email check
      result.details.isDisposable = this.isDisposableEmail(domain);
      if (result.details.isDisposable) {
        result.issues.push('Disposable/temporary email domain');
      }

      // Step 4: Professional vs business domain
      result.details.isProfessional = this.professionalDomains.has(domain);
      result.details.isBusinessDomain = !result.details.isProfessional && !result.details.isDisposable;

      // Step 5: Business alignment check
      const alignmentScore = this.checkBusinessAlignment(email, businessName);

      // Step 6: Calculate overall score
      result.score = this.calculateEmailScore(result.details, alignmentScore);
      result.details.confidence = result.score;

      // Step 7: Overall validity
      result.isValid = result.details.syntaxValid && 
                      result.details.domainValid && 
                      !result.details.isDisposable &&
                      result.score >= 60;

      // Step 8: Generate recommendations
      result.recommendations = this.generateRecommendations(result);

      return result;

    } catch (error) {
      console.log(`Error validating email ${email}: ${error.message}`);
      return {
        email: email,
        isValid: false,
        score: 0,
        issues: [`Validation error: ${error.message}`],
        recommendations: ['Manual verification recommended'],
        details: {
          syntaxValid: false,
          domainValid: false,
          mxRecordExists: false,
          isDisposable: false,
          isProfessional: false,
          isBusinessDomain: false,
          confidence: 0
        }
      };
    }
  }

  /**
   * Validate email syntax according to RFC 5322
   */
  validateSyntax(email) {
    const issues = [];
    
    // Basic format check
    if (!email || typeof email !== 'string') {
      return { isValid: false, issues: ['Email is empty or invalid type'] };
    }

    // Length check
    if (email.length > 254) {
      issues.push('Email exceeds maximum length (254 characters)');
    }

    // Must contain exactly one @
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) {
      return { isValid: false, issues: ['Email must contain exactly one @ symbol'] };
    }

    const [localPart, domain] = email.split('@');

    // Local part validation
    if (!localPart || localPart.length === 0) {
      issues.push('Local part (before @) is empty');
    } else if (localPart.length > 64) {
      issues.push('Local part exceeds maximum length (64 characters)');
    }

    // Domain part validation
    if (!domain || domain.length === 0) {
      issues.push('Domain part (after @) is empty');
    } else if (domain.length > 253) {
      issues.push('Domain exceeds maximum length (253 characters)');
    }

    // RFC 5322 regex (simplified but comprehensive)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      issues.push('Email format does not comply with RFC 5322 standard');
    }

    // Additional checks
    if (email.includes('..')) {
      issues.push('Email contains consecutive dots');
    }

    if (email.startsWith('.') || email.endsWith('.')) {
      issues.push('Email starts or ends with a dot');
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Validate domain and check MX records (with caching and timeout)
   */
  async validateDomain(domain) {
    const issues = [];
    
    try {
      // Domain format validation
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(domain)) {
        issues.push('Invalid domain format');
        return { isValid: false, hasMxRecord: false, issues };
      }

      // Check for minimum domain structure (must have at least one dot)
      if (!domain.includes('.')) {
        issues.push('Domain must contain at least one dot');
        return { isValid: false, hasMxRecord: false, issues };
      }

      // Check cache first
      if (this.dnsCache.has(domain)) {
        const cached = this.dnsCache.get(domain);
        return {
          isValid: cached.isValid,
          hasMxRecord: cached.hasMxRecord,
          issues: cached.hasMxRecord ? [] : ['No MX records found for domain']
        };
      }

      // MX record lookup with timeout
      let hasMxRecord = false;
      try {
        const mxRecords = await Promise.race([
          this.dnsLookup(domain),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('DNS timeout')), this.dnsTimeout)
          )
        ]);
        hasMxRecord = mxRecords && mxRecords.length > 0;
        
        // Cache result
        this.dnsCache.set(domain, { isValid: true, hasMxRecord });
        
        if (!hasMxRecord) {
          issues.push('No MX records found for domain');
        }
      } catch (dnsError) {
        // For timeout or DNS errors, assume domain is questionable but don't fail completely
        if (dnsError.message === 'DNS timeout') {
          issues.push('DNS lookup timeout - domain may be slow');
          hasMxRecord = false; // Conservative approach
          this.dnsCache.set(domain, { isValid: true, hasMxRecord: false });
        } else {
          // Try A record as fallback quickly
          try {
            await Promise.race([
              util.promisify(dns.resolve4)(domain),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('DNS timeout')), 1000)
              )
            ]);
            hasMxRecord = true; // Domain exists even without MX record
            this.dnsCache.set(domain, { isValid: true, hasMxRecord: true });
          } catch (aError) {
            issues.push('Domain does not exist or is unreachable');
            this.dnsCache.set(domain, { isValid: false, hasMxRecord: false });
          }
        }
      }

      return {
        isValid: issues.length === 0,
        hasMxRecord: hasMxRecord,
        issues: issues
      };

    } catch (error) {
      issues.push(`Domain validation error: ${error.message}`);
      return { isValid: false, hasMxRecord: false, issues };
    }
  }

  /**
   * Check if email is from disposable domain
   */
  isDisposableEmail(domain) {
    return this.disposableDomains.has(domain.toLowerCase());
  }

  /**
   * Check business name alignment with email
   */
  checkBusinessAlignment(email, businessName) {
    if (!businessName) return 50; // Neutral score

    const domain = email.split('@')[1].toLowerCase();
    const localPart = email.split('@')[0].toLowerCase();
    
    // Clean business name for comparison
    const cleanBusinessName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/(inc|llc|corp|company|construction|contractor|builder|remodeling)$/g, '');

    let alignmentScore = 0;

    // Check if domain contains business name
    const domainWithoutTld = domain.split('.')[0];
    if (domainWithoutTld.includes(cleanBusinessName.slice(0, 10))) {
      alignmentScore += 40;
    }

    // Check if local part suggests business communication
    const businessLocalParts = ['info', 'contact', 'office', 'admin', 'sales', 'service', 'support'];
    if (businessLocalParts.includes(localPart)) {
      alignmentScore += 30;
    }

    // Check for owner/personal name patterns
    const personalPatterns = ['john', 'mike', 'steve', 'david', 'robert', 'james', 'mary', 'sarah'];
    if (personalPatterns.some(pattern => localPart.includes(pattern))) {
      alignmentScore += 10; // Lower score for personal emails
    }

    return Math.min(alignmentScore, 100);
  }

  /**
   * Calculate overall email score
   */
  calculateEmailScore(details, alignmentScore) {
    let score = 0;

    // Base syntax validation (30 points)
    if (details.syntaxValid) score += 30;

    // Domain validation (25 points)
    if (details.domainValid) score += 20;
    if (details.mxRecordExists) score += 5;

    // Email type scoring (25 points)
    if (details.isBusinessDomain) {
      score += 25; // Business domains are best
    } else if (details.isProfessional) {
      score += 15; // Professional emails are good
    }

    // Disposable email penalty (-30 points)
    if (details.isDisposable) score -= 30;

    // Business alignment (20 points)
    score += Math.round(alignmentScore * 0.2);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations(result) {
    const recommendations = [];

    if (!result.isValid) {
      recommendations.push('Email validation failed - manual verification required');
    }

    if (result.details.isDisposable) {
      recommendations.push('Disposable email detected - avoid for important communications');
    }

    if (result.details.isProfessional && result.score < 80) {
      recommendations.push('Consider finding business email instead of personal email');
    }

    if (!result.details.mxRecordExists) {
      recommendations.push('Domain has no mail server - email may not be deliverable');
    }

    if (result.score >= 80) {
      recommendations.push('High-quality email address - suitable for outreach');
    } else if (result.score >= 60) {
      recommendations.push('Moderate-quality email - suitable with caution');
    } else {
      recommendations.push('Low-quality email - manual verification recommended');
    }

    return recommendations;
  }

  /**
   * Validate multiple emails from CSV file
   */
  async validateEmailsFromCSV(inputFile, outputFile) {
    console.log('📧 Email Validation Service');
    console.log('=' .repeat(40));
    console.log(`📂 Input: ${inputFile}`);
    console.log(`💾 Output: ${outputFile}`);

    if (!fs.existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }

    // Load CSV data
    const csvContent = fs.readFileSync(inputFile, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('No data found in input file');
    }

    const headers = this.parseCsvLine(lines[0]);
    const contractors = [];

    // Parse contractors
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCsvLine(lines[i]);
        const contractor = {};
        
        headers.forEach((header, index) => {
          contractor[header] = values[index] || '';
        });
        
        contractors.push(contractor);
      } catch (error) {
        console.log(`⚠️  Error parsing line ${i}: ${error.message}`);
      }
    }

    console.log(`📊 Found ${contractors.length} contractors to validate`);

    // Validate emails
    const validatedContractors = [];
    this.stats.total = contractors.length;

    for (let i = 0; i < contractors.length; i++) {
      const contractor = contractors[i];
      
      console.log(`🔍 Validating ${i + 1}/${contractors.length}: ${contractor.clean_business_name}`);

      if (contractor.enriched_email) {
        const validation = await this.validateEmail(contractor.enriched_email, contractor.clean_business_name);
        
        // Add validation results to contractor
        contractor.email_validation_score = validation.score;
        contractor.email_is_valid = validation.isValid;
        contractor.email_issues = validation.issues.join('; ');
        contractor.email_recommendations = validation.recommendations.join('; ');
        contractor.email_type = validation.details.isBusinessDomain ? 'business' : 
                               validation.details.isProfessional ? 'professional' : 'other';
        contractor.domain_has_mx = validation.details.mxRecordExists;
        contractor.is_disposable = validation.details.isDisposable;
        contractor.validation_date = new Date().toISOString();

        // Update stats
        if (validation.isValid) {
          this.stats.valid++;
        } else {
          this.stats.invalid++;
        }

        if (validation.score < 60) {
          this.stats.risky++;
        }

        if (validation.details.isProfessional) {
          this.stats.professional++;
        }

        if (validation.details.isBusinessDomain) {
          this.stats.businessDomain++;
        }

        console.log(`  📊 Score: ${validation.score}/100 | Valid: ${validation.isValid ? '✅' : '❌'} | Type: ${contractor.email_type}`);
      } else {
        // No email to validate
        contractor.email_validation_score = 0;
        contractor.email_is_valid = false;
        contractor.email_issues = 'No email address found';
        contractor.email_recommendations = 'Find email address through additional research';
        contractor.email_type = 'none';
        contractor.domain_has_mx = false;
        contractor.is_disposable = false;
        contractor.validation_date = new Date().toISOString();
      }

      validatedContractors.push(contractor);

      // Rate limiting (reduced for DNS-optimized version)
      await this.sleep(50);
    }

    // Save results
    await this.saveValidatedCSV(validatedContractors, outputFile);

    // Generate report
    this.generateValidationReport(outputFile);

    return {
      total: this.stats.total,
      valid: this.stats.valid,
      invalid: this.stats.invalid,
      outputFile: outputFile
    };
  }

  /**
   * Save validated results to CSV
   */
  async saveValidatedCSV(contractors, outputFile) {
    if (contractors.length === 0) return;

    const headers = Object.keys(contractors[0]);
    let csvContent = headers.join(',') + '\n';

    for (const contractor of contractors) {
      const row = headers.map(header => {
        const value = contractor[header] || '';
        return this.escapeCsv(value);
      });
      csvContent += row.join(',') + '\n';
    }

    fs.writeFileSync(outputFile, csvContent);
    console.log(`\n💾 Validated results saved to: ${outputFile}`);
  }

  /**
   * Generate validation report
   */
  generateValidationReport(outputFile) {
    const report = `
Email Validation Report
=======================
Generated: ${new Date().toISOString()}
Output File: ${outputFile}

VALIDATION STATISTICS:
=====================
Total Emails Processed: ${this.stats.total}
Valid Emails: ${this.stats.valid} (${Math.round(this.stats.valid/this.stats.total*100)}%)
Invalid Emails: ${this.stats.invalid} (${Math.round(this.stats.invalid/this.stats.total*100)}%)
Risky Emails (Score < 60): ${this.stats.risky} (${Math.round(this.stats.risky/this.stats.total*100)}%)

EMAIL TYPES:
============
Business Domain Emails: ${this.stats.businessDomain} (${Math.round(this.stats.businessDomain/this.stats.total*100)}%)
Professional Emails: ${this.stats.professional} (${Math.round(this.stats.professional/this.stats.total*100)}%)

QUALITY BREAKDOWN:
==================
High Quality (80-100): ${this.stats.total - this.stats.risky - this.stats.invalid} emails
Medium Quality (60-79): ${this.stats.risky - this.stats.invalid} emails  
Low Quality (0-59): ${this.stats.invalid} emails

RECOMMENDATIONS:
================
1. Prioritize business domain emails for outreach
2. Use high-quality emails (80+) for primary campaigns
3. Manual verification recommended for low-quality emails
4. Avoid disposable emails for important communications

Ready for targeted outreach campaigns!
`;

    const reportPath = path.join('./data/logs', `email-validation-report-${Date.now()}.txt`);
    fs.writeFileSync(reportPath, report);
    
    console.log('\n' + '='.repeat(50));
    console.log(report);
    console.log(`📄 Full report saved to: ${reportPath}`);
  }

  // Utility methods
  parseCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
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
    values.push(current);
    
    return values;
  }

  escapeCsv(value) {
    if (!value) return '';
    const str = value.toString();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node email_validator.js <input_csv> <output_csv>');
    console.log('Example: node email_validator.js contractors_with_emails.csv validated_contractors.csv');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1];
  
  const validator = new EmailValidator();
  
  try {
    const result = await validator.validateEmailsFromCSV(inputFile, outputFile);
    
    console.log('\n🎉 Email validation completed successfully!');
    console.log(`✅ ${result.valid} valid emails out of ${result.total} processed`);
    console.log(`💾 Results saved to: ${result.outputFile}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Email validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = EmailValidator;