# NAMC NorCal Member Portal - Unified Product Requirements Document

*Comprehensive specification synthesized from all project documentation*

## 📋 Document Control
- **Document Version**: 1.0
- **Last Updated**: January 2025
- **Status**: Approved for Development
- **Source Documents**: 
  - `namc-context-complete.md` (1,472 lines)
  - `FEATURE_SPECIFICATION.md` (2,181+ lines) 
  - `NAMC_BUILD_REQUIREMENTS.md` (264 lines)

---

## 🎯 Executive Summary

### Project Vision
Create the comprehensive digital operating system for minority contractor success - a platform that removes barriers, accelerates growth, and connects NAMC NorCal members with $100M+ in annual project opportunities through AI-powered matching and business tools.

### Key Success Metrics
- **Growth**: 2,500 active members by Year 3
- **Revenue**: $3M annual platform revenue
- **Impact**: 15% project win rate (vs 10% industry average)
- **Efficiency**: 50% reduction in administrative overhead
- **Retention**: 90% sponsor retention rate

---

## 🏢 Organization Profile

### NAMC NorCal Chapter Details
- **Full Name**: Northern California National Association of Minority Contractors
- **Service Area**: Northern California (San Francisco Bay Area + Central Valley)
- **Current Members**: ~500 active members (growing to 2,500)
- **Member Types**: General contractors, subcontractors, suppliers, professional services
- **Business Sizes**: Solo practitioners to 200+ employee companies

### Organizational Structure
- **Leadership Roles**: President, Vice President, Secretary, Treasurer
- **Committee Structure**: Events, Education, Government Relations, Membership
- **Administrative Staff**: Executive Director + Operations Manager
- **Special Permissions**: Board members, committee chairs, staff admins

---

## 👥 User Personas & Requirements

### Primary Users

#### 1. Maria - Growing Residential Contractor
- **Profile**: 42 years old, 8-person company, 15 years construction experience
- **Tech Level**: Moderate (smartphone, basic software)
- **Goals**: Win larger multifamily projects, get green building certified
- **Pain Points**: Manual project searching, complex bid requirements, cash flow
- **Platform Usage**: Daily mobile checks, bid templates, virtual training

#### 2. James - Commercial Specialist  
- **Profile**: 38 years old, 25-person firm, institutional project focus
- **Tech Level**: High (project management software user)
- **Goals**: More public sector projects, DBE compliance, scale to $10M+
- **Pain Points**: Complex compliance, bonding capacity, subcontractor sourcing
- **Platform Usage**: Advanced search, joint ventures, compliance tracking, API integration

#### 3. Sarah - New Entrepreneur
- **Profile**: 29 years old, 2-person startup, digital native
- **Tech Level**: Very high
- **Goals**: First contracts, reputation building, business skills, mentorship
- **Pain Points**: No track record, limited capital, overwhelming requirements
- **Platform Usage**: Complete training, community forums, AI assistant, mentorship

### Sponsor Personas

#### 4. Tech Corp - Diversity Champion
- **Profile**: Fortune 500, $2M annual construction spend, 25% diverse supplier goal
- **Needs**: Find qualified contractors, track spending, generate reports, show impact
- **Platform Usage**: Monthly dashboards, project posting, training sponsorship

#### 5. Transit Agency - Compliance Focus
- **Profile**: Regional authority, $500M capital program, 25% DBE requirement
- **Needs**: Verify certifications, track participation, meet federal requirements
- **Platform Usage**: Daily compliance monitoring, automated reporting, capacity building

### Admin Personas

#### 6. NAMC Staff - Operations Manager
- **Profile**: 5 years NAMC experience, member services focus
- **Goals**: Quick application processing, member success support, reduce manual work
- **Platform Usage**: Daily application review, member communication, analytics

---

## 🏗️ Technical Architecture

### Technology Stack

#### Frontend Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.1 + shadcn/ui
- **State Management**: Zustand 4.5.0
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: React Query (TanStack Query)
- **Maps**: Mapbox GL JS
- **Charts**: Recharts
- **AI Integration**: @xenova/transformers for client-side AI

#### Backend Technologies
- **Runtime**: Node.js 20 LTS with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15 with PostGIS and Prisma 6.1.0 ORM
- **Caching**: Redis 7 for sessions and rate limiting
- **Queue**: Bull (Redis-based) for job processing
- **Search**: Elasticsearch 8 for project matching
- **Authentication**: JWT with refresh token rotation
- **File Storage**: AWS S3 (local filesystem for development)
- **Email**: SendGrid for transactional emails
- **SMS**: Twilio for notifications
- **Payments**: Stripe for subscription and one-time payments

#### AI/ML Stack
- **LLM**: OpenAI GPT-4 API for bid assistance
- **Embeddings**: OpenAI Ada for project similarity
- **Vector Database**: Pinecone for semantic search
- **ML Platform**: AWS SageMaker for custom models
- **Model Management**: MLflow for versioning

#### Infrastructure
- **Cloud Provider**: AWS (primary), GCP (disaster recovery)
- **Containers**: Docker + Kubernetes (EKS)
- **CI/CD**: GitHub Actions
- **Monitoring**: Datadog + Sentry
- **CDN**: CloudFront
- **Load Balancer**: AWS ALB

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CloudFront CDN                         │
├─────────────────────────────────────────────────────────┤
│                   Load Balancer (ALB)                    │
├──────────────────┬──────────────────────────────────────┤
│   Web App        │         API Gateway                  │
│  (Next.js)       │    (Rate Limiting, Auth)            │
├──────────────────┴──────────────────────────────────────┤
│                  Microservices Layer                     │
├────────┬────────┬────────┬────────┬────────┬───────────┤
│  User  │Project │Finance │  AI    │Sponsor │Analytics  │
│Service │Service │Service │Service │Service │Service    │
├────────┴────────┴────────┴────────┴────────┴───────────┤
│                    Data Layer                            │
├────────┬────────┬────────┬────────┬────────┬───────────┤
│Postgres│ Redis  │   S3   │Elastic │Pinecone│TimeSeries│
│  (RDS) │(Cache) │ (Files)│(Search)│(Vector)│(Metrics) │
└────────┴────────┴────────┴────────┴────────┴───────────┘
```

---

## 🗄️ Database Design

### Core Schema Overview

#### User Management Tables
- **users**: Extended profile with security fields, preferences, membership tiers
- **roles**: RBAC system with granular permissions
- **permissions**: Resource-action based permission system
- **user_roles**: Many-to-many user-role assignments
- **role_permissions**: Permission assignments to roles

#### Business Logic Tables
- **projects**: Construction opportunities with requirements and matching data
- **project_applications**: Member applications with workflow status
- **events**: NAMC events with registration and payment handling
- **event_registrations**: Member event signups with payment tracking
- **messages**: Direct member-to-member communication
- **announcements**: Admin broadcasts with targeting options

#### Learning Management System
- **courses**: Training content with certification tracking
- **course_modules**: Structured learning paths
- **lessons**: Individual learning units with multimedia
- **assessments**: Auto-graded quizzes and evaluations
- **course_enrollments**: Member progress tracking
- **certificates**: Issued certifications with verification codes

#### Financial System
- **payments**: Stripe integration with subscription support
- **invoices**: Detailed billing with line items
- **membership_tiers**: Flexible membership levels with benefits
- **membership_renewals**: Upgrade/renewal tracking
- **commission_rules**: Referral program configuration
- **commission_payouts**: Automated commission processing

#### AI and Analytics
- **ai_feedback**: User feedback on AI recommendations
- **ai_models**: Model versioning and performance tracking
- **member_feedback**: Platform feedback and support system
- **audit_logs**: Comprehensive activity logging
- **notifications**: Multi-channel notification system

### Key Database Features
- **PostGIS Integration**: Geographic queries for project proximity
- **JSONB Fields**: Flexible metadata storage
- **Audit Trail**: Immutable logging for compliance
- **Soft Deletes**: Data retention with logical deletion
- **Performance Indexes**: Optimized for common query patterns

---

## 🚀 Feature Specification

### Phase 0: Foundation (MVP - Month 1)

#### Authentication & Security
- **Multi-factor Authentication**: TOTP-based 2FA with QR setup
- **Role-Based Access Control**: Granular permissions system
- **Session Management**: JWT with 15-min access + 7-day refresh tokens
- **Security Features**: Account lockout, rate limiting, audit logging
- **Password Security**: bcrypt with 12 rounds, strength requirements

#### Member Management
- **Registration Flow**: Email verification, referral code support
- **Profile Management**: Company details, certifications, portfolio
- **Membership Tiers**: Regular, Premium, Corporate with benefits
- **Admin Tools**: Application review, member suspension/activation

#### Payment Processing
- **Stripe Integration**: Subscription and one-time payments
- **Membership Billing**: Automated renewals with grace periods
- **Invoice Generation**: PDF invoices with tax calculations
- **Refund Processing**: Admin-initiated refunds with audit trail

### Phase 1: Core Platform (Months 2-3)

#### Project Management System
- **Project Listing**: Rich project descriptions with requirements
- **Application Workflow**: Member applications with status tracking
- **Admin Review**: Project approval and member selection tools
- **Notification System**: Automated alerts for applications and decisions

#### Event Management
- **Event Creation**: Flexible event types (meetings, training, networking)
- **Registration System**: Capacity limits, waitlists, payment collection
- **Communication**: Event reminders, updates, post-event surveys
- **Virtual Events**: Integration with video conferencing platforms

#### Communication System
- **Direct Messaging**: Member-to-member communication
- **Announcements**: Admin broadcasts with targeting options
- **Content Moderation**: Automated and manual review systems
- **File Sharing**: Secure document exchange with virus scanning

### Phase 2: Intelligence (Months 4-6)

#### AI-Powered Project Matching
- **Matching Algorithm**: Multi-factor scoring (skills, location, budget, availability)
- **Semantic Search**: Natural language project discovery
- **Recommendation Engine**: Personalized project suggestions
- **Success Prediction**: Historical performance analysis

#### AI Bid Assistant
- **RFP Analysis**: Automated requirement extraction
- **Proposal Generation**: Template-based bid assistance
- **Pricing Suggestions**: Historical data-driven recommendations
- **Compliance Check**: Automated requirement verification

#### Analytics & Insights
- **Member Analytics**: Performance tracking, win rates, growth metrics
- **Project Analytics**: Success patterns, market trends, opportunity analysis
- **Sponsor Dashboards**: Impact metrics, DEI compliance reporting
- **Predictive Analytics**: Market forecasting, member success prediction

### Phase 3: Advanced Features (Months 7-9)

#### Learning Management System
- **Course Catalog**: Comprehensive training library
- **Progress Tracking**: Individual learning paths with milestones
- **Assessment Engine**: Auto-graded quizzes with detailed feedback
- **Certification System**: Industry-recognized certificates with verification
- **Live Training**: Virtual classroom integration

#### Mobile Applications
- **iOS Application**: Native app with offline capability
- **Android Application**: Feature parity with iOS
- **Push Notifications**: Real-time alerts for opportunities and events
- **Camera Integration**: Document scanning and photo uploads

#### Advanced Business Tools
- **Financial Dashboard**: Cash flow analysis, project profitability
- **Team Collaboration**: Multi-user project management
- **Document Management**: Version control, e-signature integration
- **CRM Integration**: Contact management and relationship tracking

### Phase 4: Scale & Optimize (Months 10-12)

#### API Platform
- **Public API**: Third-party integrations with rate limiting
- **Webhook System**: Real-time event notifications
- **Partner Portal**: Integration management and documentation
- **White Label**: Custom branding for partner organizations

#### Advanced AI Features
- **Predictive Analytics**: Market trend forecasting
- **Natural Language Processing**: Advanced document analysis
- **Computer Vision**: Automated document processing
- **Chatbot Support**: 24/7 member assistance

---

## 🔐 Security & Compliance

### Security Framework
- **Data Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: OAuth 2.0 + JWT with MFA support
- **API Security**: Rate limiting, API keys, request validation
- **Infrastructure Security**: VPC, WAF, DDoS protection
- **Secrets Management**: AWS Secrets Manager integration

### Compliance Requirements
- **SOC 2 Type II**: Annual compliance audit
- **GDPR**: EU data protection compliance
- **CCPA**: California consumer privacy compliance
- **WCAG 2.1 AA**: Accessibility compliance for government contracts
- **Data Retention**: 7-year retention for financial records

### Audit & Monitoring
- **Comprehensive Logging**: All user actions and system events
- **Real-time Monitoring**: Performance and security alerts
- **Vulnerability Scanning**: Automated security assessments
- **Penetration Testing**: Quarterly security evaluations
- **Incident Response**: Documented procedures and escalation

---

## 📊 Performance Requirements

### Performance Targets
- **Page Load Time**: < 2 seconds (95th percentile)
- **API Response Time**: < 200ms (median)
- **System Uptime**: 99.9% SLA with monitoring
- **Concurrent Users**: Support for 10,000+ simultaneous users
- **Database Performance**: < 100ms for 95% of queries

### Scalability Strategy
- **Horizontal Scaling**: Kubernetes auto-scaling based on load
- **Database Optimization**: Read replicas, connection pooling
- **Caching Strategy**: Multi-tier caching (CDN, Redis, application)
- **Asset Optimization**: Image compression, lazy loading
- **Code Splitting**: Dynamic imports for optimal bundle sizes

---

## 🔗 Integration Requirements

### Government Data Sources
- **SAM.gov**: Federal contracting opportunities
- **Caltrans**: California state transportation projects
- **CSLB**: Contractor license verification
- **City/County Portals**: Local government opportunities

### Business Intelligence
- **ArcGIS Business Analyst**: Market analysis and demographics
- **ProspectNow**: Property and development data
- **Shovels AI**: Construction intelligence and insights
- **D&B**: Credit verification and business intelligence

### Third-Party Services
- **Stripe**: Payment processing and subscription management
- **SendGrid**: Transactional email delivery
- **Twilio**: SMS notifications and communication
- **DocuSign**: Digital document signing
- **Zoom/Teams**: Video conferencing integration

---

## 📋 Development & Deployment

### Development Workflow
- **Version Control**: Git with GitHub, feature branch workflow
- **Code Reviews**: Required PR reviews with automated testing
- **Testing Strategy**: Unit, integration, and E2E testing
- **Quality Gates**: Code coverage >80%, security scanning
- **Documentation**: Automated API docs, code comments

### Deployment Strategy
- **Environments**: Development, staging, production
- **CI/CD Pipeline**: Automated testing and deployment
- **Database Migrations**: Versioned, rollback-capable migrations
- **Feature Flags**: Gradual rollout of new features
- **Monitoring**: Real-time application and infrastructure monitoring

### Support & Maintenance
- **24/7 Monitoring**: Automated alerting and incident response
- **Regular Updates**: Security patches, feature updates
- **User Support**: Help desk, documentation, training materials
- **Performance Optimization**: Ongoing monitoring and tuning
- **Disaster Recovery**: Automated backups, cross-region replication

---

## 💰 Business Model & Pricing

### Revenue Streams
- **Membership Fees**: Tiered pricing ($50-200/month)
- **Transaction Fees**: Commission on successful project matches
- **Training Courses**: Premium educational content
- **Sponsor Programs**: Corporate partnership fees
- **API Access**: Enterprise integration licensing

### Financial Projections
- **Year 1**: $250K revenue, 500 members
- **Year 2**: $1.2M revenue, 1,250 members
- **Year 3**: $3M revenue, 2,500 members
- **Break-even**: Month 18
- **Operating Margin**: 40% by Year 3

---

## 🎯 Success Metrics & KPIs

### Member Success Metrics
- **Activation Rate**: 70% complete profile within 7 days
- **Engagement Rate**: 40% DAU/MAU ratio
- **Project Win Rate**: 15% (vs 10% industry average)
- **Retention Rate**: 85% annual renewal rate
- **Referral Rate**: 25% of new members from referrals

### Business Metrics
- **Revenue Growth**: 300% year-over-year
- **Customer Acquisition Cost**: <$50 per member
- **Lifetime Value**: >$2,000 per member
- **Churn Rate**: <15% annually
- **Net Promoter Score**: >50

### Impact Metrics
- **Projects Facilitated**: $100M+ in opportunities
- **Jobs Created**: 1,000+ direct jobs
- **Economic Impact**: $500M+ in economic activity
- **Diversity Impact**: 25% increase in minority contractor participation

---

## 📅 Implementation Timeline

### Development Phases

| Phase | Duration | Key Deliverables | Success Criteria |
|-------|----------|------------------|-----------------|
| **Phase 0** | Month 1 | MVP with core auth, profiles, basic admin | 50 beta users onboarded |
| **Phase 1** | Months 2-3 | Project system, events, messaging | 200 active members, 5 sponsors |
| **Phase 2** | Months 4-6 | AI matching, analytics, LMS | 15% project win rate |
| **Phase 3** | Months 7-9 | Mobile apps, advanced features | 750 members, $100K MRR |
| **Phase 4** | Months 10-12 | API platform, optimization | Series A ready |

### Release Schedule
- **Production Releases**: Bi-weekly (Thursday evenings)
- **Beta Features**: Weekly to beta user group
- **Mobile Updates**: Monthly app store releases
- **Hotfixes**: Emergency releases as needed

---

## 🔍 Risk Management

### Technical Risks
- **Scalability**: Mitigation through cloud architecture and performance testing
- **Security**: Comprehensive security framework and regular audits
- **Data Privacy**: GDPR/CCPA compliance and privacy-by-design
- **Third-party Dependencies**: Vendor diversification and SLA monitoring

### Business Risks
- **Market Competition**: Differentiation through AI and industry focus
- **Regulatory Changes**: Compliance monitoring and legal consultation
- **Economic Downturns**: Diversified revenue streams and flexible pricing
- **User Adoption**: Extensive user research and feedback integration

### Operational Risks
- **Team Scaling**: Comprehensive documentation and knowledge transfer
- **Quality Assurance**: Automated testing and manual QA processes
- **Customer Support**: Scalable support systems and self-service options
- **Infrastructure**: Multi-region deployment and disaster recovery

---

## 📚 Appendices

### A. Technical Specifications
- Database schema with detailed field specifications
- API endpoint documentation with request/response examples
- Security audit checklist with compliance requirements
- Performance testing scenarios and benchmarks

### B. User Experience Design
- User journey maps for each persona
- Wireframes and mockups for key interfaces
- Accessibility guidelines and testing procedures
- Mobile app design specifications

### C. Business Documentation
- Financial models and projections
- Market analysis and competitive landscape
- Partnership agreements and integration contracts
- Legal and compliance documentation

---

*This unified PRD synthesizes all available NAMC documentation and provides a comprehensive foundation for the development of the NAMC NorCal Member Portal. Regular updates will be made as requirements evolve and new information becomes available.*

**Document Authority**: NAMC NorCal Development Team  
**Review Cycle**: Monthly updates with stakeholder approval  
**Version Control**: Maintained in project repository with full change history