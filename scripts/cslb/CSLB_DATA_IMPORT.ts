/**
 * CSLB Data Import Service
 * 
 * Purpose: Import and sync California contractor license data from CSLB
 * Data Source: CSLB Public Data Portal CSV files
 * Target: california_contractors schema in PostgreSQL
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { Pool } from 'pg';
import { format } from 'date-fns';
import axios from 'axios';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// CSLB Data File Structure
interface CSLBLicenseMaster {
  LICENSE_NUMBER: string;
  BUSINESS_NAME: string;
  DBA_NAME?: string;
  ADDRESS1: string;
  ADDRESS2?: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  COUNTY?: string;
  PHONE?: string;
  LICENSE_STATUS: string;
  LICENSE_STATUS_DATE?: string;
  LICENSE_TYPE?: string;
  ISSUE_DATE?: string;
  ORIGINAL_ISSUE_DATE?: string;
  EXPIRE_DATE?: string;
  ENTITY_TYPE?: string;
  BOND_AMOUNT?: string;
  BOND_COMPANY?: string;
  BOND_NUMBER?: string;
  CLASSIFICATIONS?: string; // Comma-separated list
}

interface CSLBPersonnel {
  LICENSE_NUMBER: string;
  PERSON_NAME: string;
  TITLE?: string;
  ASSOCIATION_DATE?: string;
  DISASSOCIATION_DATE?: string;
}

interface CSLBWorkersComp {
  LICENSE_NUMBER: string;
  CARRIER_NAME?: string;
  POLICY_NUMBER?: string;
  EFFECTIVE_DATE?: string;
  EXPIRATION_DATE?: string;
  EXEMPT?: string;
  EXEMPTION_TYPE?: string;
}

/**
 * Main CSLB Data Import Service
 */
export class CSLBDataImportService {
  private batchId: string;
  private importStats = {
    totalRecords: 0,
    newRecords: 0,
    updatedRecords: 0,
    errorRecords: 0,
    errors: [] as string[]
  };

  constructor() {
    this.batchId = this.generateBatchId();
  }

  /**
   * Main import process
   */
  async importCSLBData(
    licenseMasterPath: string,
    personnelPath: string,
    workersCompPath: string
  ): Promise<void> {
    console.log('Starting CSLB data import...');
    
    try {
      // Create import batch record
      await this.createImportBatch();

      // Import in sequence to maintain referential integrity
      await this.importLicenseMaster(licenseMasterPath);
      await this.importPersonnel(personnelPath);
      await this.importWorkersComp(workersCompPath);

      // Update statistics and market analytics
      await this.updateStatistics();
      
      // Complete batch
      await this.completeImportBatch();
      
      console.log('CSLB data import completed successfully');
      console.log('Import statistics:', this.importStats);
    } catch (error) {
      console.error('Import failed:', error);
      await this.failImportBatch(error as Error);
      throw error;
    }
  }

  /**
   * Import License Master file
   */
  private async importLicenseMaster(filePath: string): Promise<void> {
    console.log('Importing License Master data...');
    
    const parser = fs
      .createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }));

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      for await (const record of parser) {
        try {
          const data = record as CSLBLicenseMaster;
          await this.processContractorRecord(client, data);
          this.importStats.totalRecords++;
        } catch (error) {
          this.importStats.errorRecords++;
          this.importStats.errors.push(`License ${record.LICENSE_NUMBER}: ${error}`);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process individual contractor record
   */
  private async processContractorRecord(
    client: any,
    data: CSLBLicenseMaster
  ): Promise<void> {
    // Check if contractor exists
    const existing = await client.query(
      'SELECT id FROM california_contractors.contractors WHERE license_number = $1',
      [data.LICENSE_NUMBER]
    );

    const contractorData = {
      license_number: data.LICENSE_NUMBER,
      business_name: this.cleanBusinessName(data.BUSINESS_NAME),
      dba_name: data.DBA_NAME || null,
      address_line1: data.ADDRESS1,
      address_line2: data.ADDRESS2 || null,
      city: this.normalizeCity(data.CITY),
      state: data.STATE || 'CA',
      zip_code: this.normalizeZipCode(data.ZIP),
      county: this.determineCounty(data.COUNTY, data.CITY),
      phone: this.normalizePhone(data.PHONE),
      license_status: data.LICENSE_STATUS,
      license_status_date: this.parseDate(data.LICENSE_STATUS_DATE),
      license_type: data.LICENSE_TYPE || null,
      issue_date: this.parseDate(data.ISSUE_DATE),
      original_issue_date: this.parseDate(data.ORIGINAL_ISSUE_DATE),
      expire_date: this.parseDate(data.EXPIRE_DATE),
      business_entity_type: data.ENTITY_TYPE || null,
      bond_amount: this.parseDecimal(data.BOND_AMOUNT),
      bond_company: data.BOND_COMPANY || null,
      bond_number: data.BOND_NUMBER || null,
      import_batch_id: this.batchId,
      last_cslb_sync: new Date(),
      has_valid_address: this.validateAddress(data),
      has_valid_phone: this.validatePhone(data.PHONE)
    };

    if (existing.rows.length > 0) {
      // Update existing contractor
      await this.updateContractor(client, existing.rows[0].id, contractorData);
      this.importStats.updatedRecords++;
    } else {
      // Insert new contractor
      const contractorId = await this.insertContractor(client, contractorData);
      this.importStats.newRecords++;
      
      // Process classifications
      if (data.CLASSIFICATIONS) {
        await this.processClassifications(client, contractorId, data.CLASSIFICATIONS);
      }
    }
  }

  /**
   * Insert new contractor
   */
  private async insertContractor(client: any, data: any): Promise<string> {
    const query = `
      INSERT INTO california_contractors.contractors (
        license_number, business_name, dba_name,
        address_line1, address_line2, city, state, zip_code, county,
        phone, license_status, license_status_date, license_type,
        issue_date, original_issue_date, expire_date,
        business_entity_type, bond_amount, bond_company, bond_number,
        import_batch_id, last_cslb_sync, has_valid_address, has_valid_phone
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24
      ) RETURNING id
    `;

    const values = [
      data.license_number, data.business_name, data.dba_name,
      data.address_line1, data.address_line2, data.city, data.state, data.zip_code, data.county,
      data.phone, data.license_status, data.license_status_date, data.license_type,
      data.issue_date, data.original_issue_date, data.expire_date,
      data.business_entity_type, data.bond_amount, data.bond_company, data.bond_number,
      data.import_batch_id, data.last_cslb_sync, data.has_valid_address, data.has_valid_phone
    ];

    const result = await client.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Update existing contractor
   */
  private async updateContractor(client: any, contractorId: string, data: any): Promise<void> {
    const query = `
      UPDATE california_contractors.contractors
      SET 
        business_name = $2, dba_name = $3,
        address_line1 = $4, address_line2 = $5, city = $6, state = $7, zip_code = $8, county = $9,
        phone = $10, license_status = $11, license_status_date = $12, license_type = $13,
        issue_date = $14, original_issue_date = $15, expire_date = $16,
        business_entity_type = $17, bond_amount = $18, bond_company = $19, bond_number = $20,
        import_batch_id = $21, last_cslb_sync = $22, has_valid_address = $23, has_valid_phone = $24,
        updated_at = NOW()
      WHERE id = $1
    `;

    const values = [
      contractorId,
      data.business_name, data.dba_name,
      data.address_line1, data.address_line2, data.city, data.state, data.zip_code, data.county,
      data.phone, data.license_status, data.license_status_date, data.license_type,
      data.issue_date, data.original_issue_date, data.expire_date,
      data.business_entity_type, data.bond_amount, data.bond_company, data.bond_number,
      data.import_batch_id, data.last_cslb_sync, data.has_valid_address, data.has_valid_phone
    ];

    await client.query(query, values);
  }

  /**
   * Process contractor classifications
   */
  private async processClassifications(
    client: any,
    contractorId: string,
    classifications: string
  ): Promise<void> {
    // Parse comma-separated classifications
    const classificationCodes = classifications
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    for (const code of classificationCodes) {
      try {
        await client.query(
          `INSERT INTO california_contractors.contractor_classifications 
           (contractor_id, classification_code, is_primary, is_active)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (contractor_id, classification_code) DO NOTHING`,
          [contractorId, code, classificationCodes[0] === code]
        );
      } catch (error) {
        console.error(`Error adding classification ${code}:`, error);
      }
    }
  }

  /**
   * Import Personnel file
   */
  private async importPersonnel(filePath: string): Promise<void> {
    console.log('Importing Personnel data...');
    
    const parser = fs
      .createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }));

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      for await (const record of parser) {
        try {
          const data = record as CSLBPersonnel;
          
          // Get contractor ID
          const contractor = await client.query(
            'SELECT id FROM california_contractors.contractors WHERE license_number = $1',
            [data.LICENSE_NUMBER]
          );

          if (contractor.rows.length > 0) {
            await client.query(
              `INSERT INTO california_contractors.personnel 
               (contractor_id, person_name, title, association_date, disassociation_date, is_active)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT DO NOTHING`,
              [
                contractor.rows[0].id,
                data.PERSON_NAME,
                data.TITLE || null,
                this.parseDate(data.ASSOCIATION_DATE),
                this.parseDate(data.DISASSOCIATION_DATE),
                !data.DISASSOCIATION_DATE
              ]
            );
          }
        } catch (error) {
          console.error(`Error processing personnel record:`, error);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Import Workers' Compensation file
   */
  private async importWorkersComp(filePath: string): Promise<void> {
    console.log('Importing Workers Compensation data...');
    
    const parser = fs
      .createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }));

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      for await (const record of parser) {
        try {
          const data = record as CSLBWorkersComp;
          
          // Get contractor ID
          const contractor = await client.query(
            'SELECT id FROM california_contractors.contractors WHERE license_number = $1',
            [data.LICENSE_NUMBER]
          );

          if (contractor.rows.length > 0) {
            const isExempt = data.EXEMPT === 'Y' || data.EXEMPT === 'YES';
            
            await client.query(
              `INSERT INTO california_contractors.workers_comp 
               (contractor_id, carrier_name, policy_number, effective_date, expiration_date, 
                is_exempt, exemption_type, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (contractor_id, policy_number, effective_date) 
               DO UPDATE SET
                 carrier_name = EXCLUDED.carrier_name,
                 expiration_date = EXCLUDED.expiration_date,
                 is_exempt = EXCLUDED.is_exempt,
                 exemption_type = EXCLUDED.exemption_type,
                 status = EXCLUDED.status,
                 updated_at = NOW()`,
              [
                contractor.rows[0].id,
                data.CARRIER_NAME || null,
                data.POLICY_NUMBER || null,
                this.parseDate(data.EFFECTIVE_DATE),
                this.parseDate(data.EXPIRATION_DATE),
                isExempt,
                isExempt ? data.EXEMPTION_TYPE : null,
                this.determineWCStatus(data)
              ]
            );

            // Update contractor's WC status
            await client.query(
              `UPDATE california_contractors.contractors 
               SET workers_comp_status = $2, workers_comp_exempt = $3
               WHERE id = $1`,
              [contractor.rows[0].id, this.determineWCStatus(data), isExempt]
            );
          }
        } catch (error) {
          console.error(`Error processing workers comp record:`, error);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Geocode addresses for mapping
   */
  async geocodeAddresses(limit: number = 1000): Promise<void> {
    console.log('Geocoding contractor addresses...');
    
    const client = await pool.connect();
    
    try {
      // Get contractors without coordinates
      const contractors = await client.query(
        `SELECT id, address_line1, city, state, zip_code
         FROM california_contractors.contractors
         WHERE coordinates IS NULL 
         AND has_valid_address = true
         AND license_status = 'ACTIVE'
         LIMIT $1`,
        [limit]
      );

      for (const contractor of contractors.rows) {
        try {
          const address = `${contractor.address_line1}, ${contractor.city}, ${contractor.state} ${contractor.zip_code}`;
          const coordinates = await this.geocodeAddress(address);
          
          if (coordinates) {
            await client.query(
              `UPDATE california_contractors.contractors
               SET latitude = $2, longitude = $3, 
                   coordinates = ST_SetSRID(ST_MakePoint($3, $2), 4326)
               WHERE id = $1`,
              [contractor.id, coordinates.lat, coordinates.lng]
            );
          }
        } catch (error) {
          console.error(`Error geocoding contractor ${contractor.id}:`, error);
        }
        
        // Rate limit to avoid API limits
        await this.sleep(100);
      }
    } finally {
      client.release();
    }
  }

  /**
   * Update statistics and analytics
   */
  private async updateStatistics(): Promise<void> {
    const client = await pool.connect();
    
    try {
      // Update classification counts
      await client.query(`
        UPDATE california_contractors.classifications c
        SET active_licenses_count = (
          SELECT COUNT(DISTINCT cc.contractor_id)
          FROM california_contractors.contractor_classifications cc
          JOIN california_contractors.contractors con ON cc.contractor_id = con.id
          WHERE cc.classification_code = c.code
          AND cc.is_active = true
          AND con.license_status = 'ACTIVE'
        )
      `);

      // Create market analytics snapshot
      await client.query(`
        INSERT INTO california_contractors.market_analytics (
          snapshot_date, total_contractors, active_contractors,
          namc_members, contacted_contractors, interested_contractors
        )
        SELECT 
          CURRENT_DATE,
          COUNT(*),
          COUNT(*) FILTER (WHERE license_status = 'ACTIVE'),
          COUNT(*) FILTER (WHERE is_namc_member = true),
          COUNT(*) FILTER (WHERE namc_invite_sent = true),
          COUNT(*) FILTER (WHERE namc_invite_response = 'INTERESTED')
        FROM california_contractors.contractors
      `);
    } finally {
      client.release();
    }
  }

  // === Helper Functions ===

  private generateBatchId(): string {
    return `BATCH_${format(new Date(), 'yyyyMMdd_HHmmss')}`;
  }

  private cleanBusinessName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-&.,]/g, '');
  }

  private normalizeCity(city: string): string {
    return city
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private normalizeZipCode(zip: string): string {
    const cleaned = zip.replace(/\D/g, '');
    return cleaned.length > 5 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}` : cleaned;
  }

  private normalizePhone(phone?: string): string | null {
    if (!phone) return null;
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  private parseDate(dateStr?: string): Date | null {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  private parseDecimal(value?: string): number | null {
    if (!value) return null;
    
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  private validateAddress(data: CSLBLicenseMaster): boolean {
    return !!(
      data.ADDRESS1 &&
      data.CITY &&
      data.STATE &&
      data.ZIP &&
      data.ADDRESS1.length > 5 &&
      data.CITY.length > 2
    );
  }

  private validatePhone(phone?: string): boolean {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  }

  private determineCounty(county?: string, city?: string): string | null {
    if (county) return county.toUpperCase();
    
    // Map major cities to counties
    const cityToCounty: Record<string, string> = {
      'SAN FRANCISCO': 'SAN FRANCISCO',
      'OAKLAND': 'ALAMEDA',
      'SAN JOSE': 'SANTA CLARA',
      'SACRAMENTO': 'SACRAMENTO',
      'FRESNO': 'FRESNO',
      'SAN DIEGO': 'SAN DIEGO',
      'LOS ANGELES': 'LOS ANGELES',
      // Add more mappings as needed
    };
    
    if (city) {
      const upperCity = city.toUpperCase();
      return cityToCounty[upperCity] || null;
    }
    
    return null;
  }

  private determineWCStatus(data: CSLBWorkersComp): string {
    if (data.EXEMPT === 'Y' || data.EXEMPT === 'YES') return 'EXEMPT';
    if (!data.EXPIRATION_DATE) return 'UNKNOWN';
    
    const expDate = this.parseDate(data.EXPIRATION_DATE);
    if (!expDate) return 'UNKNOWN';
    
    const now = new Date();
    if (expDate < now) return 'EXPIRED';
    if (expDate < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) return 'EXPIRING_SOON';
    
    return 'ACTIVE';
  }

  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    // This would integrate with a geocoding service like Google Maps or Mapbox
    // For now, returning null to avoid API calls
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async createImportBatch(): Promise<void> {
    await pool.query(
      `INSERT INTO california_contractors.import_batches 
       (id, batch_date, import_type, status, started_at)
       VALUES ($1, CURRENT_DATE, 'FULL', 'PROCESSING', NOW())`,
      [this.batchId]
    );
  }

  private async completeImportBatch(): Promise<void> {
    await pool.query(
      `UPDATE california_contractors.import_batches
       SET status = 'COMPLETED', completed_at = NOW(),
           total_records = $2, new_records = $3, 
           updated_records = $4, error_records = $5
       WHERE id = $1`,
      [
        this.batchId,
        this.importStats.totalRecords,
        this.importStats.newRecords,
        this.importStats.updatedRecords,
        this.importStats.errorRecords
      ]
    );
  }

  private async failImportBatch(error: Error): Promise<void> {
    await pool.query(
      `UPDATE california_contractors.import_batches
       SET status = 'FAILED', completed_at = NOW(),
           error_log = $2
       WHERE id = $1`,
      [this.batchId, error.message]
    );
  }
}

// === CLI Usage ===
if (require.main === module) {
  const importer = new CSLBDataImportService();
  
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: ts-node cslb-import.ts <license_master.csv> <personnel.csv> <workers_comp.csv>');
    process.exit(1);
  }
  
  importer.importCSLBData(args[0], args[1], args[2])
    .then(() => {
      console.log('Import completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}