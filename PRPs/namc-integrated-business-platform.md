name: "NAMC NorCal Integrated Business Platform - Green Contractor Ecosystem PRP"
description: |

## Purpose
Comprehensive PRP for enhancing the existing NAMC NorCal Member Portal (NAMCNorCalMemberPortal2025) with green building capabilities to create an integrated business platform. This builds upon the proven foundation of 68+ active members and $312K annual revenue, adding green building opportunity matching, environmental impact tracking, and energy efficiency program integration.

## Core Principles
1. **Green Building Domain First**: Understand electrification, retrofit, and green construction business rules
2. **Impact Measurement**: Track jobs created, carbon reduced, and communities served
3. **Government Compliance**: Meet DEI requirements for utility and government contracts
4. **Opportunity Matching**: AI-powered contractor-to-project matching system
5. **Financial Integration**: Built-in funding assistance and capital access
6. **Accessibility Required**: WCAG 2.1 AA compliance for government accessibility standards
7. **Mobile-First**: Responsive design optimized for field workers
8. **Follow CLAUDE.md**: Adhere to all NAMC-specific project rules and conventions

---

## Goal
Enhance the existing NAMC NorCal Member Portal (NAMCNorCalMemberPortal2025) with green building capabilities to create a comprehensive growth engine for minority contractors. Building upon the proven platform with 68+ active members generating $312K annually, we will add green building opportunity matching, environmental impact tracking, energy efficiency program integration, and sponsor analytics to connect contractors to $10B+ in green building opportunities.

## Why
- **Market Opportunity**: California's electrification mandates creating $10B+ opportunity with Federal IRA funding flowing to local programs
- **Sponsor Value**: Utilities like PG&E need certified minority contractors to meet diversity requirements for climate funding
- **Contractor Need**: Members struggle to access green building opportunities due to manual processes and lack of specialized knowledge
- **Impact Tracking**: Current systems don't measure job creation, carbon reduction, or community impact for sponsor reporting
- **Competitive Advantage**: No platform exists that combines minority contractor certification with green building opportunity matching
- **Revenue Growth**: Platform enables diversified revenue streams from memberships, transaction fees, and sponsor packages

## What
Enhanced modules for the existing NAMCNorCalMemberPortal2025 platform, adding green building capabilities to the proven foundation:

### 🏗️ **Existing Foundation (Already Implemented):**
- ✅ **Authentication & Access Control**: JWT-based with admin/member roles
- ✅ **Member Management**: CRUD operations, CSV import, business card scanner (OCR)
- ✅ **Project Opportunities**: Mapbox-integrated listings with AI contract analyzer
- ✅ **Learning Management System**: Course catalog, progress tracking, certificates
- ✅ **Finance Hub**: NAMC Shop, project funding, revenue tracking ($312K annually)
- ✅ **Community Hub**: Member directory (68+ members across NorCal counties)
- ✅ **Influencer Program**: Referral tracking, commission management
- ✅ **Admin Analytics**: Member statistics, geographic distribution, activity feeds

### 🌱 **Green Building Enhancements (To Be Added):**

### 1. Green Building Opportunity Enhancement
**Enhance Existing Project Opportunities Module:**
- **Address-Based Program Finder**: Enter any address and see all applicable energy programs, funding, and deadlines
- **Green Project Categories**: Add electrification, retrofits, energy audits to existing project types
- **Energy Program Integration**: Connect to PG&E, TECH Clean CA, and DOE Building Performance APIs
- **Environmental Impact Tracking**: Add kWh saved, CO2 reduced, and jobs created metrics

### 2. AI Assistant Green Building Training
**Enhance Existing AI Contract Analyzer:**
- **Green Building Knowledge**: Train on California Energy Code, LEED standards, and permit requirements
- **Certification Guidance**: Help contractors understand TECH Clean CA, BPI, and other green certifications
- **Compliance Assistant**: Navigate prevailing wage, DEI requirements, and environmental justice criteria
- **Financial Modeling**: Calculate project ROI, tax credits, and incentive optimization

### 3. Enhanced Member Analytics & Impact Dashboard
**Extend Existing Admin Analytics:**
- **Environmental Impact Metrics**: Track CO2 reduction, energy savings, and green jobs created
- **Sponsor Reporting**: Automated compliance reports for PG&E, CPUC, and federal grant requirements
- **Certification Tracking**: Monitor member green building credentials and renewal dates
- **Geographic Green Opportunities**: Overlay energy efficiency programs on existing Mapbox integration

### 4. Enhanced Learning Management System
**Extend Existing LMS with Green Building Focus:**
- **Green Certification Pathways**: Integrate TECH Clean CA, BPI, and LEED AP certification tracking
- **Partner Training Programs**: Connect with Richmond BUILD, Cypress Mandela, and Skyline College
- **Compliance Training**: OSHA, lead RRP, and environmental justice education
- **Continuing Education**: Green building code updates and emerging technology training

### 5. Enhanced Finance Hub 
**Extend Existing Finance Hub ($312K Revenue Platform):**
- **Green Financing Tools**: Working capital loans for green projects, equipment financing for heat pumps/solar
- **Tax Credit Optimization**: IRA tax credit calculator and monetization services
- **Project ROI Analysis**: Cash flow modeling for green building projects
- **Green Bond Funding**: Connect contractors to green social bond opportunities

### 6. Sponsor & Utility Integration
**New Module for Energy Program Sponsors:**
- **Real-Time Impact Dashboard**: Track contractors activated, projects completed, investment deployed
- **Program Creation Wizard**: Sponsors create targeted energy efficiency programs
- **Automated Compliance Reporting**: CPUC diversity reports, federal grant requirements
- **Contractor Performance Analytics**: Success rates, environmental impact, and diversity metrics

### Success Criteria
- [ ] 750 new certified green contractors recruited annually
- [ ] $50M in green building projects facilitated through platform
- [ ] 1,500 local jobs created with wage tracking
- [ ] 90% sponsor retention through demonstrated impact metrics
- [ ] 25,000 tons CO2e reduced through completed projects
- [ ] WCAG 2.1 AA accessibility compliance across all features
- [ ] Mobile responsiveness with 44px+ touch targets
- [ ] Sub-3-second page load times on mobile networks
- [ ] 99.9% uptime for critical opportunity matching features

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- file: CLAUDE.md
  why: NAMC-specific requirements, tech stack, and development conventions

- file: examples/README.md
  why: Overview of all available patterns and examples

- file: examples/components/MemberCard.tsx
  why: Component structure with role-based access control and accessibility

- file: examples/components/EventCard.tsx
  why: Pattern for displaying complex business objects with user interactions

- file: examples/api/events.ts
  why: Comprehensive API pattern with authentication, validation, and audit trails

- file: examples/database/event-operations.ts
  why: Database operation patterns with business logic validation and transactions

- file: examples/forms/MemberRegistration.tsx
  why: Form handling pattern with validation and error states

- file: examples/components/AccessControlWrapper.tsx
  why: Role-based access control implementation

- url: https://nextjs.org/docs/app/building-your-application/routing
  why: Next.js 15.3.5 App Router patterns for complex application routing

- url: https://www.prisma.io/docs/orm/prisma-schema/data-model/models
  why: Prisma 6.1.0 schema modeling for complex business relationships

- url: https://tailwindcss.com/docs/responsive-design
  why: Mobile-first responsive design patterns for field workers

- url: https://react-hook-form.com/docs/useform
  why: Form handling with Zod validation for complex business forms

- url: https://docs.mapbox.com/mapbox-gl-js/api/
  why: Mapbox integration for opportunity mapping and geospatial features

- url: https://www.energy.ca.gov/programs-and-topics/programs/building-energy-efficiency-standards/2025-building-energy-efficiency
  why: 2025 California Energy Code requirements for green building compliance

- url: https://www.pge.com/en/save-energy-and-money/rebates-and-incentives/green-energy-incentives.html
  why: PG&E green energy programs for opportunity integration

- url: https://www.energy.gov/eere/buildings/application-programming-interface
  why: Department of Energy Building Performance Database API
```

### Current Project Structure Analysis
Based on comprehensive codebase analysis, the platform should extend:
- **NAMCNorCalMemberPortalV2**: Full-stack foundation with Express.js backend and Next.js 15.3.5 frontend
- **Existing Auth System**: JWT with refresh tokens, role-based access control, and audit logging
- **Database Schema**: Prisma 6.1.0 with PostgreSQL, extend with green building entities
- **Component Library**: Existing patterns for member management, event systems, and messaging

### Target Implementation Structure
```bash
# New modules to be created/extended
src/modules/
├── opportunities/
│   ├── components/
│   │   ├── OpportunityCard.tsx          # Green project display component
│   │   ├── OpportunityMap.tsx           # Mapbox-based opportunity visualization
│   │   ├── AddressOpportunityFinder.tsx # Address-based opportunity lookup
│   │   ├── ProjectMatchingEngine.tsx    # AI-powered matching interface
│   │   └── ImpactTracker.tsx           # Environmental and economic impact display
│   ├── hooks/
│   │   ├── useOpportunityMatching.ts   # Smart matching algorithm hook
│   │   ├── useAddressLookup.ts         # Address-based program finder
│   │   └── useImpactMetrics.ts         # Impact calculation and display
│   ├── api/
│   │   ├── opportunities.ts            # CRUD operations for opportunities
│   │   ├── matching.ts                 # AI matching algorithm endpoints
│   │   └── impact-tracking.ts          # Environmental impact calculations
│   └── types/
│       ├── opportunity.types.ts        # Green building opportunity interfaces
│       ├── impact.types.ts             # Environmental impact measurement types
│       └── matching.types.ts           # Algorithm and preference types

├── green-programs/
│   ├── components/
│   │   ├── ProgramCard.tsx             # Energy efficiency program display
│   │   ├── CertificationTracker.tsx    # TECH Clean CA, BPI certification tracking
│   │   ├── RebateCalculator.tsx        # Program incentive calculator
│   │   └── ComplianceReporter.tsx      # Government compliance reporting
│   ├── integrations/
│   │   ├── pge-api.ts                  # PG&E program integration
│   │   ├── tech-clean-ca.ts           # TECH Clean CA certification API
│   │   ├── doe-building-api.ts         # DOE Building Performance Database
│   │   └── ca-energy-commission.ts     # California Energy Commission APIs
│   └── database/
│       ├── program-operations.ts       # Energy program CRUD operations
│       └── certification-tracking.ts   # Certification status management

├── financial-tools/
│   ├── components/
│   │   ├── FundingOpportunityFinder.tsx # Capital access tools
│   │   ├── CashFlowAnalyzer.tsx        # Project financial modeling
│   │   ├── TaxCreditOptimizer.tsx      # IRA tax credit maximization
│   │   └── InvoiceFactoring.tsx        # Working capital solutions
│   ├── calculators/
│   │   ├── project-roi.ts              # Return on investment calculations
│   │   ├── prevailing-wage.ts          # Government contract wage calculations
│   │   └── carbon-credits.ts           # Environmental credit valuations
│   └── integrations/
│       ├── stripe-capital.ts           # Equipment financing
│       └── green-bonds.ts              # Green bond funding sources

├── ai-assistant/
│   ├── components/
│   │   ├── ProjectAssistant.tsx        # AI-powered project guidance
│   │   ├── ContractAnalyzer.tsx        # AI contract document analysis
│   │   ├── PermitNavigator.tsx         # Building code and permit assistance
│   │   └── BiiddingAssistant.tsx       # Proposal generation and optimization
│   ├── engines/
│   │   ├── nlp-processor.ts            # Natural language processing
│   │   ├── document-analysis.ts        # Contract and specification analysis
│   │   └── knowledge-base.ts           # Green building code and standards
│   └── training-data/
│       ├── building-codes.json         # California building code knowledge
│       ├── green-standards.json        # LEED, ENERGY STAR, and other standards
│       └── permit-requirements.json    # City and county permit data

├── sponsor-portal/
│   ├── components/
│   │   ├── ImpactDashboard.tsx         # Real-time sponsor impact metrics
│   │   ├── ProgramBuilder.tsx          # Sponsor program creation wizard
│   │   ├── ContractorMetrics.tsx       # Contractor performance analytics
│   │   └── ComplianceReporter.tsx      # Automated regulatory reporting
│   ├── analytics/
│   │   ├── diversity-metrics.ts        # DEI compliance tracking
│   │   ├── environmental-impact.ts     # Carbon reduction calculations
│   │   └── economic-impact.ts          # Job creation and economic metrics
│   └── integrations/
│       ├── cpuc-reporting.ts           # California Public Utilities Commission
│       └── federal-grants.ts           # Federal grant compliance reporting

└── recruitment-engine/
    ├── components/
    │   ├── SmartLandingPage.tsx        # Dynamic content based on visitor source
    │   ├── OpportunityVisualizer.tsx   # Interactive opportunity mapping
    │   ├── CampaignManager.tsx         # Automated recruitment campaigns
    │   └── LeadCapture.tsx             # Business card scanning and lead management
    ├── automation/
    │   ├── campaign-engine.ts          # Automated marketing campaigns
    │   ├── lead-scoring.ts             # Lead qualification algorithms
    │   └── follow-up-sequences.ts      # Automated nurture sequences
    └── analytics/
        ├── conversion-tracking.ts      # Recruitment funnel analytics
        └── source-attribution.ts       # Campaign performance measurement

# Database Schema Extensions
database/
├── schema.prisma                       # Extended with green building entities
└── migrations/
    ├── add-opportunities.sql           # Green building opportunity tables
    ├── add-green-programs.sql          # Energy efficiency program tables
    ├── add-impact-tracking.sql         # Environmental and economic impact
    ├── add-certifications.sql          # Green building certifications
    └── add-sponsor-analytics.sql       # Sponsor reporting and analytics
```

### Green Building Domain Context
```typescript
// CRITICAL: Green Building Business Rules
// Project Types: Electrification, Retrofits, New Construction, Commercial Performance
// Certifications: TECH Clean CA, BPI, LEED, ENERGY STAR, OSHA, Lead RRP
// Funding Sources: PG&E, City programs, State rebates, Federal IRA tax credits
// Compliance: CPUC diversity requirements, Federal grant equity mandates
// Impact Metrics: kWh saved, CO2 reduced, jobs created, community investment
// Geographic Focus: Northern California with county-specific programs
// Contractor Capacity: Crew size, certifications, equipment, bonding capacity
// Project Lifecycle: Discovery → Qualification → Bidding → Execution → Impact Tracking

// Energy Efficiency Programs Integration
interface EnergyProgram {
  id: string;
  name: string; // "PG&E Zonal Electrification", "TECH Clean CA"
  type: 'utility' | 'state' | 'federal' | 'local';
  fundingAvailable: number;
  eligibilityCriteria: string[];
  applicationDeadline: Date;
  requiredCertifications: string[];
  geographicBounds: GeoJSON;
  maxIncentive: number;
  programStatus: 'active' | 'closed' | 'pending';
}

// Green Building Opportunity Types
interface GreenOpportunity {
  id: string;
  title: string;
  type: 'residential_electrification' | 'commercial_retrofit' | 'new_construction' | 'weatherization';
  address: string;
  estimatedValue: number;
  requiredCertifications: string[];
  projectScope: string[];
  fundingSources: string[];
  applicationDeadline: Date;
  contactInfo: ContactInfo;
  environmentalGoals: {
    energySavingsKwh: number;
    co2ReductionTons: number;
    expectedCompletion: Date;
  };
}

// Impact Measurement Framework
interface ProjectImpact {
  projectId: string;
  environmentalImpact: {
    energySavedKwh: number;
    co2ReducedTons: number;
    renewableEnergyGenerated: number;
    wasteReduced: number;
  };
  economicImpact: {
    localJobsCreated: number;
    totalProjectValue: number;
    contractorRevenue: number;
    communityInvestment: number;
    prevailingWagePaid: boolean;
  };
  socialImpact: {
    householdsServed: number;
    healthImprovements: string[];
    workforceDevelopmentHours: number;
    minorityContractorParticipation: number;
  };
}
```

### Tech Stack Constraints & Extensions
```typescript
// Current Tech Stack - DO NOT upgrade during implementation
// Next.js: 15.3.5 (App Router) - Use for server-side rendering and API routes
// React: 18.2.0 - Component library with TypeScript strict mode
// TypeScript: 5.7.2 - Interfaces for all green building data structures
// Tailwind CSS: 3.4.1 - Mobile-first responsive design
// Prisma: 6.1.0 - Database ORM with PostgreSQL
// Mapbox GL JS: For geospatial opportunity mapping
// React Hook Form + Zod: Complex forms with validation
// Zustand: Global state management for user preferences
// Axios: API integration with energy program APIs

// NEW: Green Building Specific Libraries
// @xenova/transformers: AI-powered contract analysis and project matching
// react-pdf: Contract and specification document processing
// chartjs: Impact metrics visualization and sponsor dashboards
// date-fns: Complex date calculations for program deadlines
// fuse.js: Fuzzy search for opportunity matching
// geojson: Geographic boundary processing for programs
// stripe: Payment processing for membership and transaction fees

// Database Schema Extensions
model GreenOpportunity {
  id                    String   @id @default(cuid())
  title                 String
  description           String?
  opportunityType       OpportunityType
  projectValue          Decimal
  address               String
  latitude              Float?
  longitude             Float?
  city                  String
  county                String
  zipCode               String
  requiredCertifications String[]
  fundingSources        String[]
  applicationDeadline   DateTime?
  projectStartDate      DateTime?
  projectEndDate        DateTime?
  contactEmail          String
  contactPhone          String?
  status                OpportunityStatus @default(ACTIVE)
  
  // Environmental Goals
  energySavingsTarget   Float?
  co2ReductionTarget    Float?
  
  // Relationships
  applications          OpportunityApplication[]
  sponsorProgram        EnergyProgram? @relation(fields: [programId], references: [id])
  programId             String?
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  @@map("green_opportunities")
}

model EnergyProgram {
  id                   String   @id @default(cuid())
  name                 String
  sponsorOrganization  String   // "PG&E", "City of Oakland", "TECH Clean CA"
  programType          ProgramType
  description          String?
  fundingAvailable     Decimal
  maxIncentiveAmount   Decimal?
  eligibilityCriteria  String[]
  requiredCertifications String[]
  applicationProcess   String?
  programUrl           String?
  contactInfo          Json
  
  // Geographic Coverage
  serviceArea          Json     // GeoJSON polygon
  counties             String[]
  cities               String[]
  zipCodes             String[]
  
  // Program Status
  status               ProgramStatus @default(ACTIVE)
  applicationDeadline  DateTime?
  programStartDate     DateTime?
  programEndDate       DateTime?
  
  // Relationships
  opportunities        GreenOpportunity[]
  applications         OpportunityApplication[]
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@map("energy_programs")
}

model ContractorCertification {
  id              String   @id @default(cuid())
  userId          String
  certificationType String  // "TECH_CLEAN_CA", "BPI_CERTIFIED", "LEED_AP", "OSHA_30"
  certificationNumber String?
  issuingOrganization String
  issueDate       DateTime
  expirationDate  DateTime?
  verificationUrl String?
  status          CertificationStatus @default(ACTIVE)
  
  // Relationships
  user            User     @relation(fields: [userId], references: [id])
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([userId, certificationType])
  @@map("contractor_certifications")
}

model ProjectImpactTracking {
  id                    String   @id @default(cuid())
  opportunityId         String
  contractorId          String
  projectCompletionDate DateTime?
  
  // Environmental Impact
  energySavedKwh        Float?
  co2ReducedTons        Float?
  renewableEnergyKwh    Float?
  
  // Economic Impact  
  totalProjectValue     Decimal
  contractorRevenue     Decimal
  localJobsCreated      Int?
  prevailingWagePaid    Boolean @default(false)
  
  // Social Impact
  householdsServed      Int?
  healthImprovements    String[]
  communityBenefit      String?
  
  // Verification
  impactVerified        Boolean @default(false)
  verificationDate      DateTime?
  verificationNotes     String?
  
  // Relationships
  opportunity           GreenOpportunity @relation(fields: [opportunityId], references: [id])
  contractor            User @relation(fields: [contractorId], references: [id])
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  @@map("project_impact_tracking")
}

enum OpportunityType {
  RESIDENTIAL_ELECTRIFICATION
  COMMERCIAL_RETROFIT
  NEW_CONSTRUCTION
  WEATHERIZATION
  SOLAR_INSTALLATION
  EV_CHARGING
  LEAD_REMEDIATION
  SEISMIC_RETROFIT
  ENERGY_AUDIT
}

enum OpportunityStatus {
  ACTIVE
  CLOSED
  AWARDED
  CANCELLED
}

enum ProgramType {
  UTILITY
  STATE
  FEDERAL
  LOCAL
  NONPROFIT
}

enum ProgramStatus {
  ACTIVE
  CLOSED
  PENDING
  SUSPENDED
}

enum CertificationStatus {
  ACTIVE
  EXPIRED
  SUSPENDED
  PENDING_RENEWAL
}
```

## Implementation Blueprint

### Phase 1: Foundation & Green Building Data Model (Weeks 1-2)
```typescript
// 1. Database Schema Implementation
// Add green building entities to existing Prisma schema
// Focus on opportunities, programs, certifications, and impact tracking

// 2. Core API Routes for Green Building Data
// app/api/opportunities/route.ts - CRUD operations for green opportunities
// app/api/programs/route.ts - Energy program management
// app/api/certifications/route.ts - Contractor certification tracking
// app/api/impact/route.ts - Environmental and economic impact measurement

// 3. Basic Green Building Components
// components/opportunities/OpportunityCard.tsx - Display green projects
// components/programs/ProgramCard.tsx - Show energy efficiency programs
// components/shared/ImpactMetrics.tsx - Environmental impact visualization
```

### Phase 2: Opportunity Matching System (Weeks 3-4)
```typescript
// 1. Smart Matching Algorithm
// utils/matching-engine.ts - AI-powered contractor-opportunity matching
// Consider: certifications, location, capacity, equipment, past performance

// 2. Address-Based Opportunity Finder
// components/opportunities/AddressOpportunityFinder.tsx
// Integration with multiple energy program APIs for real-time data

// 3. Geospatial Mapping Integration  
// components/opportunities/OpportunityMap.tsx
// Mapbox integration for visual opportunity discovery
// PostGIS integration for geographic queries

// Migration command to run:
// npm run db:migrate
```

### Phase 3: AI Assistant & Business Intelligence (Weeks 5-6)
```typescript
// 1. AI Project Assistant
// components/ai/ProjectAssistant.tsx - Natural language interface
// Training on building codes, permit requirements, green standards

// 2. Contract Analysis Engine
// utils/ai/contract-analyzer.ts - AI-powered document processing
// Extract project requirements, deadlines, and qualifications

// 3. Impact Analytics Dashboard
// components/analytics/ImpactDashboard.tsx - Real-time metrics
// Environmental, economic, and social impact visualization
```

### Phase 4: Financial Tools & Integration (Weeks 7-8)
```typescript
// 1. Financial Assistance Hub
// components/financial/FundingOpportunityFinder.tsx
// Integration with capital providers and equipment financing

// 2. Project ROI Calculator
// utils/calculators/project-roi.ts - Financial modeling tools
// Cash flow analysis, tax credit optimization, prevailing wage calculations

// 3. Sponsor Command Center
// components/sponsors/SponsorDashboard.tsx - Real-time impact tracking
// Automated compliance reporting for CPUC and federal requirements
```

### Phase 5: Recruitment Engine & Automation (Weeks 9-10)
```typescript
// 1. Smart Landing Pages
// components/recruitment/SmartLandingPage.tsx - Dynamic content
// Visitor source detection and targeted messaging

// 2. Automated Campaign System
// utils/campaigns/campaign-engine.ts - Marketing automation
// Lead scoring, nurture sequences, and conversion tracking

// 3. Business Card Scanner
// components/recruitment/BusinessCardScanner.tsx - OCR integration
// Automated lead capture and follow-up sequences
```

## Validation Loops

### Level 1: TypeScript & Green Building Domain Validation
```bash
# Core validation - run before any feature development
npm run type-check                  # TypeScript compilation
npm run lint                       # ESLint with green building rules
npm run lint:fix                   # Auto-fix linting issues

# Green Building Specific Validation
# Validate energy program data structures
# Verify opportunity matching algorithm types
# Check impact measurement calculations
# Expected: No TypeScript errors, proper green building interfaces
```

### Level 2: Green Building Component Testing
```typescript
// Create comprehensive test suite for green building features
// __tests__/opportunities/OpportunityCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OpportunityCard } from '../OpportunityCard';
import { mockGreenOpportunity } from '../../__mocks__/greenBuilding';

describe('OpportunityCard', () => {
  it('displays green building opportunity correctly', () => {
    render(<OpportunityCard opportunity={mockGreenOpportunity} />);
    expect(screen.getByText('Heat Pump Retrofit')).toBeInTheDocument();
    expect(screen.getByText('$50,000 incentive available')).toBeInTheDocument();
  });
  
  it('shows required certifications', () => {
    render(<OpportunityCard opportunity={mockGreenOpportunity} />);
    expect(screen.getByText('TECH Clean CA Required')).toBeInTheDocument();
  });
  
  it('calculates environmental impact correctly', () => {
    render(<OpportunityCard opportunity={mockGreenOpportunity} />);
    expect(screen.getByText('5.2 tons CO2 reduction')).toBeInTheDocument();
  });
  
  it('handles application submission', async () => {
    const user = userEvent.setup();
    render(<OpportunityCard opportunity={mockGreenOpportunity} />);
    
    await user.click(screen.getByRole('button', { name: 'Apply for Project' }));
    await waitFor(() => {
      expect(screen.getByText('Application submitted')).toBeInTheDocument();
    });
  });
  
  it('meets accessibility requirements for contractors', () => {
    render(<OpportunityCard opportunity={mockGreenOpportunity} />);
    // Test keyboard navigation for field workers
    // Verify screen reader support for opportunity details
  });
});

// __tests__/ai/ProjectAssistant.test.tsx - AI assistant functionality
// __tests__/matching/OpportunityMatching.test.tsx - Matching algorithm tests
// __tests__/impact/ImpactTracking.test.tsx - Environmental impact calculations
```

```bash
# Run green building specific tests
npm test -- --testPathPattern=opportunities
npm test -- --testPathPattern=green-programs
npm test -- --testPathPattern=impact-tracking
# Expected: All tests pass, good coverage for business logic
```

### Level 3: Green Building API Integration Testing
```bash
# Test energy program API integrations
curl -X GET http://localhost:3000/api/opportunities \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -G -d "type=residential_electrification" \
  -d "county=alameda" \
  -d "funding_available=true"

# Test opportunity matching API
curl -X POST http://localhost:3000/api/matching/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -d '{
    "contractorId": "contractor-123",
    "location": {
      "latitude": 37.8044,
      "longitude": -122.2711
    },
    "certifications": ["TECH_CLEAN_CA", "BPI_CERTIFIED"],
    "maxRadius": 25
  }'

# Test impact tracking API
curl -X POST http://localhost:3000/api/impact/track \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -d '{
    "projectId": "project-456",
    "energySavedKwh": 5200,
    "co2ReducedTons": 2.8,
    "localJobsCreated": 3
  }'

# Expected: Proper JSON responses with green building data
```

### Level 4: Green Building Database Migration & Seed
```bash
# Apply green building schema migrations
npm run db:generate                # Generate Prisma client with new models
npm run db:migrate                 # Apply green building migrations
npm run db:seed                    # Seed energy programs and opportunities

# Verify database schema
npx prisma studio                  # Visual database inspection
# Expected: All green building tables created, relationships working
```

### Level 5: Energy Program Integration Testing
```bash
# Test external API integrations
# PG&E program data synchronization
npm run sync:pge-programs

# TECH Clean CA certification verification
npm run verify:tech-certifications

# DOE Building Performance Database integration
npm run test:doe-api

# California Energy Commission data updates
npm run sync:ca-energy-data

# Expected: Successful data synchronization, no API errors
```

### Level 6: Green Building Impact Validation
```bash
# Environmental impact calculations
npm run test:impact-calculations

# Economic impact modeling
npm run test:economic-modeling

# Geographic opportunity coverage
npm run test:geo-coverage

# Contractor matching accuracy
npm run test:matching-algorithm

# Expected: Accurate calculations, comprehensive coverage
```

### Level 7: Mobile Field Worker Testing
```bash
# Start development server
npm run dev

# Test complete green building workflows:
# 1. Contractor discovers opportunities on mobile device
# 2. Uses address tool to find local programs
# 3. AI assistant helps with permit requirements
# 4. Submits application through mobile interface
# 5. Tracks project impact through completion
# 6. Sponsor views real-time analytics dashboard

# Mobile-specific testing:
# - Test touch targets (44px minimum)
# - Verify offline functionality for field work
# - Test GPS integration for opportunity discovery
# - Validate fast loading on mobile networks

# Expected: Seamless mobile experience for field contractors
```

### Level 8: Green Building Accessibility Validation
```bash
# Accessibility testing for government compliance
npm run a11y-check                 # Automated WCAG 2.1 AA testing

# Manual accessibility checks:
# - Screen reader testing with NVDA/JAWS
# - Keyboard navigation for all green building features
# - Color contrast verification (4.5:1 minimum)
# - Focus indicators for opportunity cards
# - Alternative text for impact charts and maps

# Government compliance verification:
# - Section 508 compliance for federal contracts
# - WCAG 2.1 AA for state and local government requirements

# Expected: Full accessibility compliance for government contracts
```

## Final Validation Checklist
- [ ] All green building TypeScript compiles: `npm run type-check`
- [ ] No linting issues: `npm run lint`
- [ ] All business logic tests pass: `npm test`
- [ ] Energy program API integrations working
- [ ] Opportunity matching algorithm validated
- [ ] Impact tracking calculations accurate
- [ ] Mobile responsiveness for field workers
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Geospatial mapping performance optimized
- [ ] AI assistant trained on green building knowledge
- [ ] Financial calculators provide accurate modeling
- [ ] Sponsor dashboards show real-time metrics
- [ ] Automated campaign system functional
- [ ] Business card scanner accuracy > 95%
- [ ] Database migrations successful
- [ ] Security audit passed (no sensitive data exposure)
- [ ] Performance benchmarks met (Lighthouse > 90)
- [ ] Cross-browser compatibility verified
- [ ] Government compliance requirements met

---

## Green Building Anti-Patterns to Avoid

### Energy Program Integration
- ❌ Don't hardcode program deadlines (they change frequently)
- ❌ Don't ignore geographic program boundaries
- ❌ Don't skip certification verification
- ❌ Don't cache opportunity data too long (programs update)

### Impact Measurement
- ❌ Don't trust contractor-reported impact without verification
- ❌ Don't ignore baseline energy usage for calculations
- ❌ Don't skip environmental justice considerations
- ❌ Don't forget to track social impact alongside environmental

### Contractor Experience
- ❌ Don't overwhelm with technical jargon
- ❌ Don't require multiple app logins for field work
- ❌ Don't ignore mobile data constraints
- ❌ Don't skip offline functionality for remote job sites

### Government Compliance
- ❌ Don't ignore prevailing wage requirements
- ❌ Don't skip DEI reporting for sponsors
- ❌ Don't forget audit trails for compliance
- ❌ Don't ignore accessibility requirements

### Financial Integration
- ❌ Don't expose sensitive financial data
- ❌ Don't ignore tax implications of incentives
- ❌ Don't skip due diligence on funding sources
- ❌ Don't forget to track cash flow timing

---

## Task Implementation Order

### Sprint 1: Green Building Foundation (Week 1-2)
1. **Database Schema Extension**: Add green building entities to Prisma schema
2. **Core API Routes**: Implement opportunity, program, and certification APIs
3. **Basic Components**: OpportunityCard, ProgramCard, and ImpactMetrics components
4. **Authentication Extension**: Add green building roles and permissions

### Sprint 2: Opportunity Discovery (Week 3-4) 
5. **Address Opportunity Finder**: Build address-based program lookup
6. **Geospatial Mapping**: Integrate Mapbox for opportunity visualization  
7. **Smart Matching Engine**: Implement AI-powered contractor matching
8. **Mobile Optimization**: Ensure field worker mobile experience

### Sprint 3: AI Intelligence & Analytics (Week 5-6)
9. **AI Project Assistant**: Natural language interface for green building guidance
10. **Contract Analyzer**: AI-powered document processing
11. **Impact Dashboard**: Real-time environmental and economic metrics
12. **Predictive Analytics**: Opportunity success prediction modeling

### Sprint 4: Financial Integration (Week 7-8)
13. **Financial Tools Hub**: Capital access and funding tools
14. **ROI Calculators**: Project financial modeling
15. **Tax Credit Optimizer**: IRA tax credit maximization
16. **Payment Processing**: Membership and transaction fee handling

### Sprint 5: Sponsor & Recruitment Systems (Week 9-10)
17. **Sponsor Command Center**: Real-time impact tracking for utilities
18. **Automated Campaigns**: Recruitment engine with lead scoring
19. **Business Card Scanner**: OCR-powered lead capture
20. **Compliance Reporting**: Automated government reporting

Each sprint should be completed with full testing, accessibility validation, and mobile optimization before proceeding to the next phase.

---

## Success Metrics & Impact Measurement

### Technical Performance
- **Page Load Speed**: < 3 seconds on mobile networks
- **API Response Time**: < 500ms for opportunity matching
- **Uptime**: 99.9% availability for critical features
- **Accessibility Score**: WCAG 2.1 AA compliance verification
- **Mobile Performance**: Lighthouse score > 90

### Business Impact
- **Contractor Recruitment**: 750 new certified contractors annually
- **Project Facilitation**: $50M in green building projects
- **Job Creation**: 1,500 local jobs with wage tracking
- **Environmental Impact**: 25,000 tons CO2e reduced
- **Sponsor Retention**: 90% retention through impact demonstration

### User Experience
- **Contractor Engagement**: 70% monthly active user rate
- **Opportunity Application Rate**: 40% of discovered opportunities applied for
- **Mobile Usage**: 80% of contractor interactions on mobile
- **AI Assistant Usage**: 60% of contractors using AI guidance
- **Financial Tool Adoption**: 30% using integrated financial services

This comprehensive PRP provides the complete context, technical patterns, and business logic needed for an AI agent to successfully implement the NAMC NorCal Integrated Business Platform as a one-pass implementation achieving all technical and business objectives.