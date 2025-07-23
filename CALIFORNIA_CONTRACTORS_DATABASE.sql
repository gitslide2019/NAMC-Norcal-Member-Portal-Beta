-- =====================================================
-- California Contractors Database Schema
-- =====================================================
-- Purpose: Comprehensive database of ALL California licensed contractors
-- Source: CSLB (Contractors State License Board) public data
-- Usage: NAMC NorCal member outreach, verification, and market intelligence
-- =====================================================

-- Create dedicated schema for California contractors data
CREATE SCHEMA IF NOT EXISTS california_contractors;

-- Set search path
SET search_path TO california_contractors, public;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Main contractor table (ALL CA contractors, not just NAMC members)
CREATE TABLE california_contractors.contractors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  license_number TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  dba_name TEXT,
  
  -- Contact information
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT DEFAULT 'CA',
  zip_code TEXT,
  county TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Geographic coordinates for mapping
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  coordinates GEOGRAPHY(POINT, 4326),
  
  -- License information
  license_status TEXT NOT NULL,
  license_status_date DATE,
  license_type TEXT,
  issue_date DATE,
  original_issue_date DATE,
  expire_date DATE,
  
  -- Business details
  business_entity_type TEXT,
  business_effective_date DATE,
  workers_comp_status TEXT,
  workers_comp_exempt BOOLEAN DEFAULT false,
  bond_amount DECIMAL(12,2),
  bond_company TEXT,
  bond_number TEXT,
  
  -- Business metrics (for outreach targeting)
  estimated_annual_revenue DECIMAL(15,2),
  estimated_employees INTEGER,
  years_in_business INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN original_issue_date IS NOT NULL 
      THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, original_issue_date))::INTEGER
      ELSE NULL
    END
  ) STORED,
  
  -- NAMC relationship tracking
  is_namc_member BOOLEAN DEFAULT false,
  namc_member_id TEXT REFERENCES public.users(id),
  namc_member_since DATE,
  namc_membership_type TEXT,
  
  -- Outreach tracking
  namc_invite_sent BOOLEAN DEFAULT false,
  namc_invite_date TIMESTAMP,
  namc_invite_method TEXT, -- 'EMAIL', 'MAIL', 'PHONE', 'EVENT'
  namc_invite_response TEXT, -- 'INTERESTED', 'NOT_INTERESTED', 'PENDING'
  namc_invite_notes TEXT,
  
  -- Data quality flags
  has_valid_address BOOLEAN DEFAULT false,
  has_valid_phone BOOLEAN DEFAULT false,
  has_valid_email BOOLEAN DEFAULT false,
  address_verified_date DATE,
  
  -- Data management
  data_source TEXT DEFAULT 'CSLB',
  cslb_last_action TEXT,
  cslb_last_action_date DATE,
  import_batch_id TEXT,
  last_cslb_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Classifications lookup table (all CSLB license classifications)
CREATE TABLE california_contractors.classifications (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('GENERAL', 'SPECIALTY', 'SUBCONTRACTOR')),
  trade_group TEXT, -- 'BUILDING', 'ENGINEERING', 'ELECTRICAL', 'PLUMBING', 'HVAC', etc.
  
  -- Requirements
  experience_required_years INTEGER DEFAULT 4,
  exam_required BOOLEAN DEFAULT true,
  
  -- Statistics
  active_licenses_count INTEGER DEFAULT 0,
  average_bond_amount DECIMAL(12,2),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  discontinued_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contractor-Classification junction table
CREATE TABLE california_contractors.contractor_classifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id TEXT NOT NULL REFERENCES california_contractors.contractors(id) ON DELETE CASCADE,
  classification_code TEXT NOT NULL REFERENCES california_contractors.classifications(code),
  
  -- Classification details
  is_primary BOOLEAN DEFAULT false,
  date_added DATE,
  date_removed DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- Certification details
  certification_number TEXT,
  certification_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(contractor_id, classification_code)
);

-- Personnel associated with licenses
CREATE TABLE california_contractors.personnel (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id TEXT NOT NULL REFERENCES california_contractors.contractors(id) ON DELETE CASCADE,
  
  -- Person details
  person_name TEXT NOT NULL,
  title TEXT,
  role TEXT, -- 'OWNER', 'RMO', 'RME', 'PARTNER', 'OFFICER', 'MEMBER', 'OTHER'
  
  -- Qualifier information
  is_qualifier BOOLEAN DEFAULT false,
  qualifier_type TEXT, -- 'RMO' (Responsible Managing Officer), 'RME' (Responsible Managing Employee)
  
  -- Association dates
  association_date DATE,
  disassociation_date DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- Contact (if available)
  direct_phone TEXT,
  direct_email TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workers' compensation information
CREATE TABLE california_contractors.workers_comp (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id TEXT NOT NULL REFERENCES california_contractors.contractors(id) ON DELETE CASCADE,
  
  -- Insurance details
  carrier_name TEXT,
  carrier_phone TEXT,
  policy_number TEXT,
  
  -- Coverage period
  effective_date DATE,
  expiration_date DATE,
  
  -- Exemption information
  is_exempt BOOLEAN DEFAULT false,
  exemption_type TEXT, -- 'SOLE_OWNER', 'PARTNERSHIP', 'CORPORATION', 'LLC'
  exemption_date DATE,
  
  -- Status
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'CANCELLED', 'EXEMPT'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(contractor_id, policy_number, effective_date)
);

-- =====================================================
-- OUTREACH AND CAMPAIGN MANAGEMENT
-- =====================================================

-- Outreach campaigns
CREATE TABLE california_contractors.outreach_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_description TEXT,
  
  -- Campaign type and channel
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('RECRUITMENT', 'RENEWAL', 'EVENT', 'GENERAL')),
  campaign_channel TEXT NOT NULL CHECK (campaign_channel IN ('EMAIL', 'MAIL', 'PHONE', 'SMS', 'EVENT', 'MIXED')),
  
  -- Targeting criteria
  target_classifications TEXT[] DEFAULT '{}',
  target_cities TEXT[] DEFAULT '{}',
  target_counties TEXT[] DEFAULT '{}',
  target_zip_codes TEXT[] DEFAULT '{}',
  target_license_status TEXT[] DEFAULT '{ACTIVE}',
  target_years_in_business_min INTEGER,
  target_years_in_business_max INTEGER,
  target_employees_min INTEGER,
  target_employees_max INTEGER,
  exclude_current_members BOOLEAN DEFAULT true,
  custom_criteria JSONB DEFAULT '{}',
  
  -- Campaign content
  email_template_id TEXT,
  mail_template_id TEXT,
  phone_script_id TEXT,
  landing_page_url TEXT,
  
  -- Campaign metrics
  target_audience_size INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_opened INTEGER DEFAULT 0,
  messages_clicked INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  positive_responses INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- ROI tracking
  campaign_cost DECIMAL(10,2) DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  
  -- Scheduling
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
  scheduled_date TIMESTAMP,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES public.users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_by TEXT REFERENCES public.users(id),
  approved_at TIMESTAMP
);

-- Individual outreach records
CREATE TABLE california_contractors.outreach_contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL REFERENCES california_contractors.outreach_campaigns(id) ON DELETE CASCADE,
  contractor_id TEXT NOT NULL REFERENCES california_contractors.contractors(id) ON DELETE CASCADE,
  
  -- Contact details
  contact_method TEXT NOT NULL,
  contact_date TIMESTAMP DEFAULT NOW(),
  contact_successful BOOLEAN DEFAULT true,
  
  -- Message tracking
  message_id TEXT, -- External ID from email/SMS service
  delivered BOOLEAN,
  delivered_at TIMESTAMP,
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMP,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP,
  
  -- Response tracking
  response_received BOOLEAN DEFAULT false,
  response_date TIMESTAMP,
  response_type TEXT CHECK (response_type IN ('INTERESTED', 'NOT_INTERESTED', 'ALREADY_MEMBER', 'WRONG_CONTACT', 'DO_NOT_CONTACT', 'OTHER')),
  response_notes TEXT,
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP,
  follow_up_assigned_to TEXT REFERENCES public.users(id),
  follow_up_completed BOOLEAN DEFAULT false,
  
  -- Conversion tracking
  converted_to_member BOOLEAN DEFAULT false,
  conversion_date DATE,
  membership_type TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(campaign_id, contractor_id)
);

-- Do not contact list
CREATE TABLE california_contractors.do_not_contact (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id TEXT REFERENCES california_contractors.contractors(id) ON DELETE CASCADE,
  license_number TEXT,
  business_name TEXT,
  
  -- Contact preferences
  no_email BOOLEAN DEFAULT false,
  no_phone BOOLEAN DEFAULT false,
  no_mail BOOLEAN DEFAULT false,
  no_sms BOOLEAN DEFAULT false,
  
  -- Reason and source
  reason TEXT,
  source TEXT, -- 'UNSUBSCRIBE', 'COMPLAINT', 'MANUAL', 'BOUNCE'
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES public.users(id),
  
  CONSTRAINT unique_contractor_dnc UNIQUE(contractor_id),
  CONSTRAINT unique_license_dnc UNIQUE(license_number)
);

-- =====================================================
-- DATA IMPORT AND SYNC TRACKING
-- =====================================================

-- Import batch tracking
CREATE TABLE california_contractors.import_batches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date DATE NOT NULL,
  import_type TEXT NOT NULL CHECK (import_type IN ('FULL', 'INCREMENTAL', 'MANUAL')),
  
  -- File information
  license_master_file TEXT,
  personnel_file TEXT,
  workers_comp_file TEXT,
  
  -- Import statistics
  total_records INTEGER DEFAULT 0,
  new_records INTEGER DEFAULT 0,
  updated_records INTEGER DEFAULT 0,
  error_records INTEGER DEFAULT 0,
  
  -- Processing details
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_log TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES public.users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary lookup indexes
CREATE INDEX idx_ca_contractors_license ON california_contractors.contractors(license_number);
CREATE INDEX idx_ca_contractors_business ON california_contractors.contractors(business_name);
CREATE INDEX idx_ca_contractors_status ON california_contractors.contractors(license_status) WHERE license_status = 'ACTIVE';

-- Geographic indexes
CREATE INDEX idx_ca_contractors_location ON california_contractors.contractors USING GIST (coordinates);
CREATE INDEX idx_ca_contractors_city ON california_contractors.contractors(city, license_status);
CREATE INDEX idx_ca_contractors_county ON california_contractors.contractors(county, license_status);
CREATE INDEX idx_ca_contractors_zip ON california_contractors.contractors(zip_code);

-- Classification indexes
CREATE INDEX idx_ca_contractor_class_contractor ON california_contractors.contractor_classifications(contractor_id);
CREATE INDEX idx_ca_contractor_class_code ON california_contractors.contractor_classifications(classification_code);
CREATE INDEX idx_ca_contractor_class_active ON california_contractors.contractor_classifications(classification_code) WHERE is_active = true;

-- Outreach optimization indexes
CREATE INDEX idx_ca_contractors_not_member ON california_contractors.contractors(is_namc_member, license_status) 
  WHERE is_namc_member = false AND license_status = 'ACTIVE';
CREATE INDEX idx_ca_contractors_no_invite ON california_contractors.contractors(namc_invite_sent, is_namc_member) 
  WHERE namc_invite_sent = false AND is_namc_member = false;
CREATE INDEX idx_ca_contractors_invite_response ON california_contractors.contractors(namc_invite_response) 
  WHERE namc_invite_response IS NOT NULL;

-- License expiration tracking
CREATE INDEX idx_ca_contractors_expiring ON california_contractors.contractors(expire_date) 
  WHERE expire_date > CURRENT_DATE AND expire_date < CURRENT_DATE + INTERVAL '90 days';

-- Workers comp expiration
CREATE INDEX idx_ca_workers_comp_expiring ON california_contractors.workers_comp(expiration_date, contractor_id) 
  WHERE expiration_date > CURRENT_DATE AND expiration_date < CURRENT_DATE + INTERVAL '30 days';

-- Campaign performance
CREATE INDEX idx_outreach_contacts_campaign ON california_contractors.outreach_contacts(campaign_id, response_received);
CREATE INDEX idx_outreach_contacts_contractor ON california_contractors.outreach_contacts(contractor_id, contact_date DESC);

-- Do not contact
CREATE INDEX idx_dnc_license ON california_contractors.do_not_contact(license_number);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active contractors with classifications
CREATE VIEW california_contractors.active_contractors_view AS
SELECT 
  c.*,
  array_agg(DISTINCT cc.classification_code) FILTER (WHERE cc.classification_code IS NOT NULL) as classifications,
  array_agg(DISTINCT cl.name) FILTER (WHERE cl.name IS NOT NULL) as classification_names,
  CASE 
    WHEN c.is_namc_member THEN 'MEMBER'
    WHEN c.namc_invite_sent AND c.namc_invite_response = 'INTERESTED' THEN 'PROSPECT'
    WHEN c.namc_invite_sent AND c.namc_invite_response = 'NOT_INTERESTED' THEN 'DECLINED'
    WHEN c.namc_invite_sent THEN 'CONTACTED'
    ELSE 'POTENTIAL'
  END as namc_status
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id AND cc.is_active = true
LEFT JOIN california_contractors.classifications cl ON cc.classification_code = cl.code
WHERE c.license_status = 'ACTIVE'
GROUP BY c.id;

-- Outreach targets (non-members, not contacted)
CREATE VIEW california_contractors.outreach_targets_view AS
SELECT 
  c.*,
  array_agg(DISTINCT cc.classification_code) as classifications
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
LEFT JOIN california_contractors.do_not_contact dnc ON c.id = dnc.contractor_id
WHERE 
  c.license_status = 'ACTIVE'
  AND c.is_namc_member = false
  AND c.namc_invite_sent = false
  AND dnc.id IS NULL
  AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
GROUP BY c.id;

-- Market penetration by classification
CREATE VIEW california_contractors.market_penetration_view AS
SELECT 
  cl.code as classification_code,
  cl.name as classification_name,
  cl.category,
  COUNT(DISTINCT c.id) as total_contractors,
  COUNT(DISTINCT c.id) FILTER (WHERE c.is_namc_member = true) as namc_members,
  COUNT(DISTINCT c.id) FILTER (WHERE c.namc_invite_sent = true) as contacted,
  COUNT(DISTINCT c.id) FILTER (WHERE c.namc_invite_response = 'INTERESTED') as interested,
  ROUND(100.0 * COUNT(DISTINCT c.id) FILTER (WHERE c.is_namc_member = true) / NULLIF(COUNT(DISTINCT c.id), 0), 2) as member_penetration_rate,
  ROUND(100.0 * COUNT(DISTINCT c.id) FILTER (WHERE c.namc_invite_response = 'INTERESTED') / NULLIF(COUNT(DISTINCT c.id) FILTER (WHERE c.namc_invite_sent = true), 0), 2) as interest_rate
FROM california_contractors.classifications cl
LEFT JOIN california_contractors.contractor_classifications cc ON cl.code = cc.classification_code AND cc.is_active = true
LEFT JOIN california_contractors.contractors c ON cc.contractor_id = c.id AND c.license_status = 'ACTIVE'
GROUP BY cl.code, cl.name, cl.category
ORDER BY total_contractors DESC;

-- Geographic distribution
CREATE VIEW california_contractors.geographic_distribution_view AS
SELECT 
  county,
  city,
  COUNT(*) as total_contractors,
  COUNT(*) FILTER (WHERE is_namc_member = true) as namc_members,
  COUNT(*) FILTER (WHERE namc_invite_sent = true) as contacted,
  COUNT(*) FILTER (WHERE namc_invite_response = 'INTERESTED') as interested,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_namc_member = true) / COUNT(*), 2) as penetration_rate
FROM california_contractors.contractors
WHERE license_status = 'ACTIVE'
GROUP BY county, city
HAVING COUNT(*) >= 10
ORDER BY county, total_contractors DESC;

-- =====================================================
-- FUNCTIONS FOR DATA MANAGEMENT
-- =====================================================

-- Update contractor from NAMC member
CREATE OR REPLACE FUNCTION california_contractors.link_namc_member(
  p_license_number TEXT,
  p_user_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE california_contractors.contractors
  SET 
    is_namc_member = true,
    namc_member_id = p_user_id,
    namc_member_since = CURRENT_DATE,
    updated_at = NOW()
  WHERE license_number = p_license_number;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Mark contractor as do not contact
CREATE OR REPLACE FUNCTION california_contractors.add_do_not_contact(
  p_license_number TEXT,
  p_reason TEXT,
  p_no_email BOOLEAN DEFAULT true,
  p_no_phone BOOLEAN DEFAULT true,
  p_no_mail BOOLEAN DEFAULT true,
  p_no_sms BOOLEAN DEFAULT true
) RETURNS VOID AS $$
DECLARE
  v_contractor_id TEXT;
BEGIN
  -- Find contractor
  SELECT id INTO v_contractor_id
  FROM california_contractors.contractors
  WHERE license_number = p_license_number;
  
  -- Insert or update do not contact
  INSERT INTO california_contractors.do_not_contact (
    contractor_id, license_number, reason, 
    no_email, no_phone, no_mail, no_sms, source
  ) VALUES (
    v_contractor_id, p_license_number, p_reason,
    p_no_email, p_no_phone, p_no_mail, p_no_sms, 'MANUAL'
  )
  ON CONFLICT (license_number) DO UPDATE
  SET 
    no_email = EXCLUDED.no_email,
    no_phone = EXCLUDED.no_phone,
    no_mail = EXCLUDED.no_mail,
    no_sms = EXCLUDED.no_sms,
    reason = EXCLUDED.reason;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA LOAD
-- =====================================================

-- Insert CSLB Classifications
INSERT INTO california_contractors.classifications (code, name, category, trade_group) VALUES
-- General Classifications
('A', 'General Engineering Contractor', 'GENERAL', 'ENGINEERING'),
('B', 'General Building Contractor', 'GENERAL', 'BUILDING'),

-- Specialty Classifications (C-licenses)
('C-2', 'Insulation and Acoustical Contractor', 'SPECIALTY', 'INSULATION'),
('C-4', 'Boiler, Hot Water Heating and Steam Fitting', 'SPECIALTY', 'PLUMBING'),
('C-5', 'Framing and Rough Carpentry', 'SPECIALTY', 'BUILDING'),
('C-6', 'Cabinet, Millwork and Finish Carpentry', 'SPECIALTY', 'BUILDING'),
('C-7', 'Low Voltage Systems', 'SPECIALTY', 'ELECTRICAL'),
('C-8', 'Concrete', 'SPECIALTY', 'CONCRETE'),
('C-9', 'Drywall', 'SPECIALTY', 'BUILDING'),
('C-10', 'Electrical', 'SPECIALTY', 'ELECTRICAL'),
('C-11', 'Elevator', 'SPECIALTY', 'MECHANICAL'),
('C-12', 'Earthwork and Paving', 'SPECIALTY', 'ENGINEERING'),
('C-13', 'Fencing', 'SPECIALTY', 'BUILDING'),
('C-15', 'Flooring and Floor Covering', 'SPECIALTY', 'BUILDING'),
('C-16', 'Fire Protection', 'SPECIALTY', 'FIRE'),
('C-17', 'Glazing', 'SPECIALTY', 'BUILDING'),
('C-20', 'Warm-Air Heating, Ventilating and Air Conditioning', 'SPECIALTY', 'HVAC'),
('C-21', 'Building Moving and Demolition', 'SPECIALTY', 'ENGINEERING'),
('C-23', 'Ornamental Metal', 'SPECIALTY', 'BUILDING'),
('C-27', 'Landscaping', 'SPECIALTY', 'LANDSCAPING'),
('C-28', 'Lock and Security Equipment', 'SPECIALTY', 'SECURITY'),
('C-29', 'Masonry', 'SPECIALTY', 'BUILDING'),
('C-31', 'Construction Zone Traffic Control', 'SPECIALTY', 'ENGINEERING'),
('C-32', 'Parking and Highway Improvement', 'SPECIALTY', 'ENGINEERING'),
('C-33', 'Painting and Decorating', 'SPECIALTY', 'BUILDING'),
('C-34', 'Pipeline', 'SPECIALTY', 'ENGINEERING'),
('C-35', 'Lathing and Plastering', 'SPECIALTY', 'BUILDING'),
('C-36', 'Plumbing', 'SPECIALTY', 'PLUMBING'),
('C-38', 'Refrigeration', 'SPECIALTY', 'HVAC'),
('C-39', 'Roofing', 'SPECIALTY', 'ROOFING'),
('C-42', 'Sanitation System', 'SPECIALTY', 'PLUMBING'),
('C-43', 'Sheet Metal', 'SPECIALTY', 'HVAC'),
('C-45', 'Sign', 'SPECIALTY', 'BUILDING'),
('C-46', 'Solar', 'SPECIALTY', 'ELECTRICAL'),
('C-47', 'General Manufactured Housing', 'SPECIALTY', 'BUILDING'),
('C-50', 'Reinforcing Steel', 'SPECIALTY', 'CONCRETE'),
('C-51', 'Structural Steel', 'SPECIALTY', 'BUILDING'),
('C-53', 'Swimming Pool', 'SPECIALTY', 'SWIMMING_POOL'),
('C-54', 'Tile', 'SPECIALTY', 'BUILDING'),
('C-55', 'Water Conditioning', 'SPECIALTY', 'PLUMBING'),
('C-57', 'Well Drilling', 'SPECIALTY', 'ENGINEERING'),
('C-60', 'Welding', 'SPECIALTY', 'WELDING'),
('C-61', 'Limited Specialty', 'SPECIALTY', 'OTHER'),

-- D-licenses (previously used for specialty contractors)
('D-06', 'Concrete Related Services', 'SPECIALTY', 'CONCRETE'),
('D-09', 'Drilling, Blasting and Oil Field Work', 'SPECIALTY', 'ENGINEERING'),
('D-12', 'Synthetic Products', 'SPECIALTY', 'BUILDING'),
('D-34', 'Prefabricated Equipment', 'SPECIALTY', 'BUILDING'),
('D-59', 'Hydroseed Spraying', 'SPECIALTY', 'LANDSCAPING'),

-- Special Classifications
('ASB', 'Asbestos Certification', 'SPECIALTY', 'HAZMAT'),
('HAZ', 'Hazardous Substance Removal Certification', 'SPECIALTY', 'HAZMAT');

-- =====================================================
-- TRIGGERS FOR DATA MAINTENANCE
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON california_contractors.contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classifications_updated_at BEFORE UPDATE ON california_contractors.classifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON california_contractors.personnel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_comp_updated_at BEFORE UPDATE ON california_contractors.workers_comp
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_campaigns_updated_at BEFORE UPDATE ON california_contractors.outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_contacts_updated_at BEFORE UPDATE ON california_contractors.outreach_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECURITY AND PERMISSIONS
-- =====================================================

-- Create read-only role for analytics
CREATE ROLE california_contractors_read;
GRANT USAGE ON SCHEMA california_contractors TO california_contractors_read;
GRANT SELECT ON ALL TABLES IN SCHEMA california_contractors TO california_contractors_read;

-- Create write role for data import
CREATE ROLE california_contractors_write;
GRANT USAGE ON SCHEMA california_contractors TO california_contractors_write;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA california_contractors TO california_contractors_write;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA california_contractors TO california_contractors_write;

-- Create admin role
CREATE ROLE california_contractors_admin;
GRANT ALL ON SCHEMA california_contractors TO california_contractors_admin;
GRANT ALL ON ALL TABLES IN SCHEMA california_contractors TO california_contractors_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA california_contractors TO california_contractors_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA california_contractors TO california_contractors_admin;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA california_contractors IS 'California licensed contractors database from CSLB public data for NAMC outreach and market intelligence';
COMMENT ON TABLE california_contractors.contractors IS 'Main table containing all California licensed contractors from CSLB';
COMMENT ON TABLE california_contractors.classifications IS 'CSLB license classifications (A, B, C-licenses)';
COMMENT ON TABLE california_contractors.contractor_classifications IS 'Junction table linking contractors to their license classifications';
COMMENT ON TABLE california_contractors.outreach_campaigns IS 'NAMC member recruitment and outreach campaign management';
COMMENT ON TABLE california_contractors.outreach_contacts IS 'Individual contractor contacts within outreach campaigns';
COMMENT ON COLUMN california_contractors.contractors.is_namc_member IS 'Flag indicating if contractor is current NAMC member';
COMMENT ON COLUMN california_contractors.contractors.namc_invite_sent IS 'Whether NAMC has sent membership invitation to this contractor';