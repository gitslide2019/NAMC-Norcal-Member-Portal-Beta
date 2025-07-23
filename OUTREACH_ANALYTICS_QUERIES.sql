-- =====================================================
-- NAMC Outreach Analytics & Targeting Queries
-- =====================================================
-- Purpose: SQL queries for contractor outreach, market analysis, and campaign management
-- Target: california_contractors schema
-- Usage: NAMC member recruitment and market intelligence
-- =====================================================

-- =====================================================
-- TARGETED OUTREACH QUERIES
-- =====================================================

-- 1. High-Value Targets: Large Contractors Not Yet Members
-- Find contractors with high bond amounts who aren't NAMC members
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.bond_amount,
  c.phone,
  c.years_in_business,
  array_agg(DISTINCT cc.classification_code) as classifications,
  CASE 
    WHEN c.bond_amount >= 1000000 THEN 'TIER_1_MAJOR'
    WHEN c.bond_amount >= 500000 THEN 'TIER_2_LARGE'
    WHEN c.bond_amount >= 100000 THEN 'TIER_3_MEDIUM'
    ELSE 'TIER_4_SMALL'
  END as target_tier
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
LEFT JOIN california_contractors.do_not_contact dnc ON c.id = dnc.contractor_id
WHERE 
  c.license_status = 'ACTIVE'
  AND c.is_namc_member = false
  AND c.namc_invite_sent = false
  AND c.bond_amount >= 100000
  AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
  AND dnc.id IS NULL
GROUP BY c.id, c.license_number, c.business_name, c.city, c.county, c.bond_amount, c.phone, c.years_in_business
ORDER BY c.bond_amount DESC, c.years_in_business DESC
LIMIT 500;

-- 2. Green Building/Electrification Targets
-- Find contractors in classifications relevant to green building and electrification
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.phone,
  c.email,
  array_agg(DISTINCT cc.classification_code) as classifications,
  array_agg(DISTINCT cl.name) as classification_names
FROM california_contractors.contractors c
JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
JOIN california_contractors.classifications cl ON cc.classification_code = cl.code
LEFT JOIN california_contractors.do_not_contact dnc ON c.id = dnc.contractor_id
WHERE 
  c.license_status = 'ACTIVE'
  AND c.is_namc_member = false
  AND c.namc_invite_sent = false
  AND cc.classification_code IN (
    'C-10',  -- Electrical
    'C-20',  -- HVAC
    'C-46',  -- Solar
    'C-2',   -- Insulation
    'C-38',  -- Refrigeration
    'C-36',  -- Plumbing
    'B'      -- General Building
  )
  AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
  AND dnc.id IS NULL
GROUP BY c.id, c.license_number, c.business_name, c.city, c.county, c.phone, c.email
ORDER BY c.city, c.bond_amount DESC
LIMIT 1000;

-- 3. Geographic Targeting: Bay Area Focus
-- Target contractors in key Bay Area counties
SELECT 
  c.county,
  c.city,
  COUNT(*) as total_contractors,
  COUNT(*) FILTER (WHERE c.is_namc_member = true) as current_members,
  COUNT(*) FILTER (WHERE c.namc_invite_sent = false AND c.is_namc_member = false) as untapped_prospects,
  ROUND(100.0 * COUNT(*) FILTER (WHERE c.is_namc_member = true) / COUNT(*), 2) as member_penetration_rate,
  ROUND(AVG(c.bond_amount), 0) as avg_bond_amount
FROM california_contractors.contractors c
WHERE 
  c.license_status = 'ACTIVE'
  AND c.county IN (
    'SAN FRANCISCO', 'ALAMEDA', 'SANTA CLARA', 'SAN MATEO', 'CONTRA COSTA',
    'MARIN', 'SONOMA', 'NAPA', 'SOLANO', 'SANTA CRUZ', 'MONTEREY'
  )
  AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
GROUP BY c.county, c.city
HAVING COUNT(*) >= 10
ORDER BY untapped_prospects DESC, member_penetration_rate ASC;

-- 4. New License Holders (Potential Early Adopters)
-- Target contractors who got their licenses within the last 2 years
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.phone,
  c.email,
  c.issue_date,
  c.years_in_business,
  array_agg(DISTINCT cc.classification_code) as classifications
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
LEFT JOIN california_contractors.do_not_contact dnc ON c.id = dnc.contractor_id
WHERE 
  c.license_status = 'ACTIVE'
  AND c.is_namc_member = false
  AND c.namc_invite_sent = false
  AND c.issue_date >= CURRENT_DATE - INTERVAL '2 years'
  AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
  AND dnc.id IS NULL
GROUP BY c.id, c.license_number, c.business_name, c.city, c.county, c.phone, c.email, c.issue_date, c.years_in_business
ORDER BY c.issue_date DESC
LIMIT 200;

-- 5. Lapsed Members Recovery (Contractors who let licenses expire)
-- Find contractors with recently expired licenses for renewal outreach
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.phone,
  c.expire_date,
  c.license_status,
  EXTRACT(DAYS FROM CURRENT_DATE - c.expire_date) as days_since_expiry,
  array_agg(DISTINCT cc.classification_code) as classifications
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
WHERE 
  c.license_status IN ('EXPIRED', 'SUSPENDED')
  AND c.expire_date >= CURRENT_DATE - INTERVAL '6 months'
  AND c.expire_date < CURRENT_DATE
  AND c.is_namc_member = false
GROUP BY c.id, c.license_number, c.business_name, c.city, c.county, c.phone, c.expire_date, c.license_status
ORDER BY c.expire_date DESC
LIMIT 100;

-- =====================================================
-- MARKET ANALYSIS QUERIES
-- =====================================================

-- 6. Market Penetration Analysis by Classification
-- Understand NAMC's market share in each contractor classification
WITH classification_stats AS (
  SELECT 
    cl.code,
    cl.name,
    cl.category,
    COUNT(DISTINCT c.id) as total_contractors,
    COUNT(DISTINCT c.id) FILTER (WHERE c.is_namc_member = true) as namc_members,
    COUNT(DISTINCT c.id) FILTER (WHERE c.namc_invite_sent = true) as contacted,
    COUNT(DISTINCT c.id) FILTER (WHERE c.namc_invite_response = 'INTERESTED') as interested,
    COUNT(DISTINCT c.id) FILTER (WHERE c.namc_invite_response = 'NOT_INTERESTED') as declined,
    ROUND(AVG(c.bond_amount), 0) as avg_bond_amount,
    COUNT(DISTINCT c.id) FILTER (WHERE c.bond_amount >= 500000) as large_contractors,
    COUNT(DISTINCT c.id) FILTER (WHERE c.years_in_business >= 10) as established_contractors
  FROM california_contractors.classifications cl
  LEFT JOIN california_contractors.contractor_classifications cc ON cl.code = cc.classification_code AND cc.is_active = true
  LEFT JOIN california_contractors.contractors c ON cc.contractor_id = c.id AND c.license_status = 'ACTIVE'
  GROUP BY cl.code, cl.name, cl.category
)
SELECT 
  *,
  ROUND(100.0 * namc_members / NULLIF(total_contractors, 0), 2) as member_penetration_rate,
  ROUND(100.0 * contacted / NULLIF(total_contractors, 0), 2) as contact_rate,
  ROUND(100.0 * interested / NULLIF(contacted, 0), 2) as interest_rate,
  ROUND(100.0 * namc_members / NULLIF(interested, 0), 2) as conversion_rate,
  total_contractors - namc_members - contacted as untapped_market
FROM classification_stats
WHERE total_contractors > 0
ORDER BY total_contractors DESC;

-- 7. Geographic Market Analysis
-- County-level market penetration and opportunity analysis
WITH county_stats AS (
  SELECT 
    c.county,
    COUNT(*) as total_contractors,
    COUNT(*) FILTER (WHERE c.is_namc_member = true) as namc_members,
    COUNT(*) FILTER (WHERE c.namc_invite_sent = true) as contacted,
    COUNT(*) FILTER (WHERE c.namc_invite_response = 'INTERESTED') as interested,
    COUNT(*) FILTER (WHERE c.bond_amount >= 100000) as medium_large_contractors,
    COUNT(*) FILTER (WHERE c.bond_amount >= 500000) as large_contractors,
    COUNT(*) FILTER (WHERE c.years_in_business >= 10) as established_contractors,
    ROUND(AVG(c.bond_amount), 0) as avg_bond_amount,
    COUNT(DISTINCT cc.classification_code) as classification_diversity
  FROM california_contractors.contractors c
  LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
  WHERE 
    c.license_status = 'ACTIVE'
    AND c.county IS NOT NULL
    AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
  GROUP BY c.county
)
SELECT 
  *,
  ROUND(100.0 * namc_members / NULLIF(total_contractors, 0), 2) as penetration_rate,
  total_contractors - namc_members as market_opportunity,
  CASE 
    WHEN penetration_rate < 5 THEN 'HIGH_OPPORTUNITY'
    WHEN penetration_rate < 15 THEN 'MEDIUM_OPPORTUNITY'
    WHEN penetration_rate < 30 THEN 'ESTABLISHED_MARKET'
    ELSE 'SATURATED_MARKET'
  END as market_status
FROM county_stats
WHERE total_contractors >= 50
ORDER BY market_opportunity DESC, penetration_rate ASC;

-- 8. Competitive Analysis: Similar Organizations
-- Find contractors who might be members of competing organizations
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.website,
  c.years_in_business,
  c.bond_amount,
  array_agg(DISTINCT cc.classification_code) as classifications,
  CASE 
    WHEN c.website ILIKE '%abc%' OR c.business_name ILIKE '%associated building%' THEN 'ABC_MEMBER'
    WHEN c.website ILIKE '%agc%' OR c.business_name ILIKE '%general contractor%' THEN 'AGC_MEMBER'
    WHEN c.business_name ILIKE '%minority%' OR c.business_name ILIKE '%diverse%' THEN 'MINORITY_FOCUSED'
    ELSE 'OTHER'
  END as likely_affiliation
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
WHERE 
  c.license_status = 'ACTIVE'
  AND c.is_namc_member = false
  AND (
    c.website IS NOT NULL 
    OR c.business_name ~* '(associated|building|general|minority|diverse)'
  )
  AND c.bond_amount >= 100000
GROUP BY c.id, c.license_number, c.business_name, c.city, c.county, c.website, c.years_in_business, c.bond_amount
ORDER BY c.bond_amount DESC;

-- =====================================================
-- CAMPAIGN PERFORMANCE QUERIES
-- =====================================================

-- 9. Campaign Effectiveness Analysis
-- Analyze performance of past outreach campaigns
SELECT 
  oc.campaign_id,
  ocmp.campaign_name,
  ocmp.campaign_type,
  ocmp.campaign_channel,
  COUNT(*) as total_contacts,
  COUNT(*) FILTER (WHERE oc.contact_successful = true) as successful_contacts,
  COUNT(*) FILTER (WHERE oc.delivered = true) as delivered_messages,
  COUNT(*) FILTER (WHERE oc.opened = true) as opened_messages,
  COUNT(*) FILTER (WHERE oc.clicked = true) as clicked_messages,
  COUNT(*) FILTER (WHERE oc.response_received = true) as responses_received,
  COUNT(*) FILTER (WHERE oc.response_type = 'INTERESTED') as interested_responses,
  COUNT(*) FILTER (WHERE oc.converted_to_member = true) as conversions,
  -- Calculate rates
  ROUND(100.0 * COUNT(*) FILTER (WHERE oc.delivered = true) / NULLIF(COUNT(*), 0), 2) as delivery_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE oc.opened = true) / NULLIF(COUNT(*) FILTER (WHERE oc.delivered = true), 0), 2) as open_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE oc.clicked = true) / NULLIF(COUNT(*) FILTER (WHERE oc.opened = true), 0), 2) as click_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE oc.response_received = true) / NULLIF(COUNT(*), 0), 2) as response_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE oc.converted_to_member = true) / NULLIF(COUNT(*), 0), 2) as conversion_rate,
  -- ROI calculation
  ROUND(ocmp.revenue_generated / NULLIF(ocmp.campaign_cost, 0), 2) as roi_ratio
FROM california_contractors.outreach_contacts oc
JOIN california_contractors.outreach_campaigns ocmp ON oc.campaign_id = ocmp.id
WHERE ocmp.status = 'COMPLETED'
GROUP BY oc.campaign_id, ocmp.campaign_name, ocmp.campaign_type, ocmp.campaign_channel, ocmp.revenue_generated, ocmp.campaign_cost
ORDER BY conversion_rate DESC, response_rate DESC;

-- 10. Response Analysis by Contractor Characteristics
-- Understand which types of contractors respond best to outreach
SELECT 
  CASE 
    WHEN c.bond_amount >= 1000000 THEN 'LARGE'
    WHEN c.bond_amount >= 100000 THEN 'MEDIUM'
    ELSE 'SMALL'
  END as contractor_size,
  CASE 
    WHEN c.years_in_business >= 20 THEN 'ESTABLISHED'
    WHEN c.years_in_business >= 5 THEN 'EXPERIENCED'
    ELSE 'NEW'
  END as business_maturity,
  cl.category as classification_category,
  COUNT(*) as total_contacts,
  COUNT(*) FILTER (WHERE oc.response_received = true) as responses,
  COUNT(*) FILTER (WHERE oc.response_type = 'INTERESTED') as interested,
  COUNT(*) FILTER (WHERE oc.converted_to_member = true) as conversions,
  ROUND(100.0 * COUNT(*) FILTER (WHERE oc.response_received = true) / COUNT(*), 2) as response_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE oc.response_type = 'INTERESTED') / NULLIF(COUNT(*) FILTER (WHERE oc.response_received = true), 0), 2) as interest_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE oc.converted_to_member = true) / COUNT(*), 2) as conversion_rate
FROM california_contractors.outreach_contacts oc
JOIN california_contractors.contractors c ON oc.contractor_id = c.id
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id AND cc.is_primary = true
LEFT JOIN california_contractors.classifications cl ON cc.classification_code = cl.code
GROUP BY 
  CASE 
    WHEN c.bond_amount >= 1000000 THEN 'LARGE'
    WHEN c.bond_amount >= 100000 THEN 'MEDIUM'
    ELSE 'SMALL'
  END,
  CASE 
    WHEN c.years_in_business >= 20 THEN 'ESTABLISHED'
    WHEN c.years_in_business >= 5 THEN 'EXPERIENCED'
    ELSE 'NEW'
  END,
  cl.category
HAVING COUNT(*) >= 20
ORDER BY conversion_rate DESC, response_rate DESC;

-- =====================================================
-- PROSPECTING AND LEAD SCORING QUERIES
-- =====================================================

-- 11. Lead Scoring Algorithm
-- Score contractors based on likelihood to join NAMC
WITH contractor_scores AS (
  SELECT 
    c.id,
    c.license_number,
    c.business_name,
    c.city,
    c.county,
    c.phone,
    c.email,
    c.bond_amount,
    c.years_in_business,
    -- Scoring factors
    CASE 
      WHEN c.bond_amount >= 1000000 THEN 25
      WHEN c.bond_amount >= 500000 THEN 20
      WHEN c.bond_amount >= 100000 THEN 15
      WHEN c.bond_amount >= 50000 THEN 10
      ELSE 5
    END as bond_score,
    CASE 
      WHEN c.years_in_business >= 20 THEN 20
      WHEN c.years_in_business >= 10 THEN 15
      WHEN c.years_in_business >= 5 THEN 10
      WHEN c.years_in_business >= 2 THEN 5
      ELSE 0
    END as experience_score,
    CASE 
      WHEN c.county IN ('SAN FRANCISCO', 'ALAMEDA', 'SANTA CLARA', 'SAN MATEO') THEN 15
      WHEN c.county IN ('CONTRA COSTA', 'MARIN', 'SONOMA', 'NAPA') THEN 10
      ELSE 5
    END as location_score,
    CASE 
      WHEN c.has_valid_phone AND c.has_valid_email THEN 10
      WHEN c.has_valid_phone OR c.has_valid_email THEN 5
      ELSE 0
    END as contact_score,
    CASE 
      WHEN cc.classification_count >= 3 THEN 10
      WHEN cc.classification_count >= 2 THEN 5
      ELSE 0
    END as specialization_score
  FROM california_contractors.contractors c
  LEFT JOIN (
    SELECT 
      contractor_id, 
      COUNT(*) as classification_count,
      bool_or(classification_code IN ('B', 'C-10', 'C-20', 'C-46', 'C-2')) as has_green_classifications
    FROM california_contractors.contractor_classifications 
    WHERE is_active = true 
    GROUP BY contractor_id
  ) cc ON c.id = cc.contractor_id
  WHERE 
    c.license_status = 'ACTIVE'
    AND c.is_namc_member = false
    AND c.namc_invite_sent = false
    AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
)
SELECT 
  *,
  (bond_score + experience_score + location_score + contact_score + specialization_score) as total_score,
  CASE 
    WHEN (bond_score + experience_score + location_score + contact_score + specialization_score) >= 70 THEN 'A_HOT'
    WHEN (bond_score + experience_score + location_score + contact_score + specialization_score) >= 50 THEN 'B_WARM'
    WHEN (bond_score + experience_score + location_score + contact_score + specialization_score) >= 30 THEN 'C_COLD'
    ELSE 'D_MINIMAL'
  END as lead_grade
FROM contractor_scores
WHERE total_score >= 30
ORDER BY total_score DESC, bond_amount DESC
LIMIT 500;

-- 12. Follow-up Opportunities
-- Find contractors who showed interest but haven't converted
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.phone,
  c.email,
  c.namc_invite_date,
  c.namc_invite_response,
  oc.contact_date as last_contact_date,
  oc.response_date,
  oc.follow_up_required,
  oc.follow_up_date,
  EXTRACT(DAYS FROM CURRENT_DATE - oc.response_date) as days_since_response,
  CASE 
    WHEN oc.follow_up_date < CURRENT_DATE THEN 'OVERDUE'
    WHEN oc.follow_up_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'DUE_SOON'
    ELSE 'SCHEDULED'
  END as follow_up_status
FROM california_contractors.contractors c
LEFT JOIN california_contractors.outreach_contacts oc ON c.id = oc.contractor_id
WHERE 
  c.is_namc_member = false
  AND (
    c.namc_invite_response = 'INTERESTED'
    OR oc.response_type = 'INTERESTED'
  )
  AND oc.converted_to_member = false
  AND oc.follow_up_required = true
ORDER BY 
  CASE 
    WHEN oc.follow_up_date < CURRENT_DATE THEN 1
    WHEN oc.follow_up_date <= CURRENT_DATE + INTERVAL '7 days' THEN 2
    ELSE 3
  END,
  oc.follow_up_date;

-- =====================================================
-- EXPORT QUERIES FOR CAMPAIGNS
-- =====================================================

-- 13. Email Campaign Export
-- Export contractor data for email marketing campaigns
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.email,
  c.phone,
  c.bond_amount,
  c.years_in_business,
  string_agg(DISTINCT cc.classification_code, ', ' ORDER BY cc.classification_code) as classifications,
  CASE 
    WHEN c.bond_amount >= 500000 THEN 'LARGE_CONTRACTOR'
    WHEN c.bond_amount >= 100000 THEN 'MEDIUM_CONTRACTOR'
    ELSE 'SMALL_CONTRACTOR'
  END as segment,
  'outreach@namcnorcal.org' as sender_email,
  'Join NAMC NorCal - Northern California''s Premier Minority Contractor Association' as subject_line
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
LEFT JOIN california_contractors.do_not_contact dnc ON c.id = dnc.contractor_id
WHERE 
  c.license_status = 'ACTIVE'
  AND c.is_namc_member = false
  AND c.namc_invite_sent = false
  AND c.has_valid_email = true
  AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
  AND (dnc.id IS NULL OR dnc.no_email = false)
GROUP BY c.id, c.license_number, c.business_name, c.city, c.county, c.email, c.phone, c.bond_amount, c.years_in_business
ORDER BY c.bond_amount DESC, c.years_in_business DESC;

-- 14. Direct Mail Campaign Export
-- Export for direct mail campaigns (postal addresses)
SELECT 
  c.license_number,
  c.business_name,
  c.address_line1,
  c.address_line2,
  c.city,
  c.state,
  c.zip_code,
  c.county,
  c.bond_amount,
  string_agg(DISTINCT cc.classification_code, ', ' ORDER BY cc.classification_code) as classifications
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
LEFT JOIN california_contractors.do_not_contact dnc ON c.id = dnc.contractor_id
WHERE 
  c.license_status = 'ACTIVE'
  AND c.is_namc_member = false
  AND c.namc_invite_sent = false
  AND c.has_valid_address = true
  AND c.expire_date > CURRENT_DATE + INTERVAL '90 days'
  AND (dnc.id IS NULL OR dnc.no_mail = false)
  AND c.county IN ('SAN FRANCISCO', 'ALAMEDA', 'SANTA CLARA', 'SAN MATEO', 'CONTRA COSTA', 'MARIN')
GROUP BY c.id, c.license_number, c.business_name, c.address_line1, c.address_line2, c.city, c.state, c.zip_code, c.county, c.bond_amount
ORDER BY c.county, c.city, c.bond_amount DESC;

-- =====================================================
-- AUTOMATED ALERTS AND MONITORING
-- =====================================================

-- 15. License Expiration Alerts
-- Monitor contractors with expiring licenses for renewal outreach
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.phone,
  c.email,
  c.expire_date,
  EXTRACT(DAYS FROM c.expire_date - CURRENT_DATE) as days_until_expiry,
  c.is_namc_member,
  CASE 
    WHEN c.expire_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'URGENT'
    WHEN c.expire_date <= CURRENT_DATE + INTERVAL '60 days' THEN 'SOON'
    WHEN c.expire_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'UPCOMING'
  END as urgency_level
FROM california_contractors.contractors c
WHERE 
  c.license_status = 'ACTIVE'
  AND c.expire_date <= CURRENT_DATE + INTERVAL '90 days'
  AND c.expire_date > CURRENT_DATE
ORDER BY c.expire_date, c.is_namc_member DESC;

-- 16. New Contractors Alert
-- Daily alert for newly licensed contractors
SELECT 
  c.license_number,
  c.business_name,
  c.city,
  c.county,
  c.phone,
  c.email,
  c.issue_date,
  c.bond_amount,
  array_agg(DISTINCT cc.classification_code) as classifications
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
WHERE 
  c.license_status = 'ACTIVE'
  AND c.issue_date >= CURRENT_DATE - INTERVAL '7 days'
  AND c.is_namc_member = false
GROUP BY c.id, c.license_number, c.business_name, c.city, c.county, c.phone, c.email, c.issue_date, c.bond_amount
ORDER BY c.issue_date DESC;

-- =====================================================
-- PERFORMANCE DASHBOARDS
-- =====================================================

-- 17. Executive Dashboard Summary
-- High-level metrics for leadership reporting
SELECT 
  'Total Active Contractors' as metric,
  COUNT(*) as value,
  'CA Statewide' as scope
FROM california_contractors.contractors 
WHERE license_status = 'ACTIVE'

UNION ALL

SELECT 
  'NAMC Members' as metric,
  COUNT(*) as value,
  'Current Members' as scope
FROM california_contractors.contractors 
WHERE is_namc_member = true AND license_status = 'ACTIVE'

UNION ALL

SELECT 
  'Market Penetration Rate' as metric,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_namc_member = true) / COUNT(*), 2) as value,
  'Percentage' as scope
FROM california_contractors.contractors 
WHERE license_status = 'ACTIVE'

UNION ALL

SELECT 
  'Contractors Contacted' as metric,
  COUNT(*) as value,
  'Outreach Pipeline' as scope
FROM california_contractors.contractors 
WHERE namc_invite_sent = true

UNION ALL

SELECT 
  'Interested Prospects' as metric,
  COUNT(*) as value,
  'Hot Leads' as scope
FROM california_contractors.contractors 
WHERE namc_invite_response = 'INTERESTED' AND is_namc_member = false

UNION ALL

SELECT 
  'Untapped Market (Large)' as metric,
  COUNT(*) as value,
  'Bond > $500K' as scope
FROM california_contractors.contractors 
WHERE 
  license_status = 'ACTIVE' 
  AND is_namc_member = false 
  AND namc_invite_sent = false 
  AND bond_amount >= 500000;

-- =====================================================
-- DATA QUALITY MONITORING
-- =====================================================

-- 18. Data Quality Report
-- Monitor data completeness and quality issues
SELECT 
  'Total Contractors' as data_point,
  COUNT(*) as count,
  '100%' as completeness
FROM california_contractors.contractors

UNION ALL

SELECT 
  'Missing Phone Numbers' as data_point,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM california_contractors.contractors WHERE license_status = 'ACTIVE'), 2) || '%' as completeness
FROM california_contractors.contractors 
WHERE license_status = 'ACTIVE' AND (phone IS NULL OR phone = '')

UNION ALL

SELECT 
  'Missing Email Addresses' as data_point,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM california_contractors.contractors WHERE license_status = 'ACTIVE'), 2) || '%' as completeness
FROM california_contractors.contractors 
WHERE license_status = 'ACTIVE' AND (email IS NULL OR email = '')

UNION ALL

SELECT 
  'Missing Geocoding' as data_point,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM california_contractors.contractors WHERE license_status = 'ACTIVE'), 2) || '%' as completeness
FROM california_contractors.contractors 
WHERE license_status = 'ACTIVE' AND coordinates IS NULL

UNION ALL

SELECT 
  'No Classifications' as data_point,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM california_contractors.contractors WHERE license_status = 'ACTIVE'), 2) || '%' as completeness
FROM california_contractors.contractors c
LEFT JOIN california_contractors.contractor_classifications cc ON c.id = cc.contractor_id
WHERE c.license_status = 'ACTIVE' AND cc.id IS NULL;

-- =====================================================
-- NOTES FOR IMPLEMENTATION
-- =====================================================

/*
IMPLEMENTATION NOTES:

1. PERFORMANCE OPTIMIZATION:
   - These queries are optimized for the indexes created in the schema
   - Consider creating materialized views for frequently accessed analytics
   - Use EXPLAIN ANALYZE to monitor query performance

2. AUTOMATION:
   - Schedule daily runs of queries 15, 16 for alerts
   - Weekly runs of queries 6, 7 for market analysis
   - Monthly runs of query 17 for executive reporting

3. EXPORT INTEGRATION:
   - Queries 13, 14 can be integrated with email marketing platforms
   - Consider CSV export functionality for mail merge campaigns
   - Add campaign tracking parameters to URLs

4. PRIVACY COMPLIANCE:
   - Ensure compliance with CAN-SPAM Act for email campaigns
   - Respect do-not-contact preferences
   - Log all outreach activities for audit trails

5. CAMPAIGN MANAGEMENT:
   - Use these queries to populate campaign management tools
   - Track response rates and ROI for optimization
   - A/B test different messaging approaches
*/