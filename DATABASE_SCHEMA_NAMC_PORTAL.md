# NAMC NorCal Member Portal - Database Schema & Data Model

*Comprehensive database design with Prisma schema, ERD, and data model documentation*

## 📊 Database Overview

### Design Philosophy
- **ACID Compliance**: Full transaction support for data integrity
- **Normalization**: 3NF with strategic denormalization for performance
- **Scalability**: Designed for horizontal scaling and read replicas
- **Security**: Column-level encryption for sensitive data
- **Audit Trail**: Complete change tracking for compliance
- **Performance**: Optimized indexes and query patterns

### Technology Stack
- **Database Engine**: PostgreSQL 15.4 with PostGIS extension
- **ORM**: Prisma 6.1.0 for type-safe database access
- **Migration Tool**: Prisma Migrate for version control
- **Search**: Full-text search with PostgreSQL tsvector
- **Geospatial**: PostGIS for location-based queries

---

## 🗄️ Prisma Schema Definition

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================================
// ENUMS
// ========================================

enum MemberType {
  REGULAR
  admin
}

enum ProjectStatus {
  DRAFT
  PUBLISHED
  BIDDING_OPEN
  BIDDING_CLOSED
  AWARDED
  COMPLETED
  CANCELLED
}

enum ProjectCategory {
  RESIDENTIAL
  COMMERCIAL
  INFRASTRUCTURE
  RENOVATION
  NEW_CONSTRUCTION
  MAINTENANCE
  SPECIALTY
}

enum ProjectPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ProjectVisibility {
  PUBLIC
  MEMBERS_ONLY
  INVITE_ONLY
  PRIVATE
}

enum EventStatus {
  DRAFT
  PUBLISHED
  REGISTRATION_OPEN
  REGISTRATION_CLOSED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum EventType {
  NETWORKING
  TRAINING
  CONFERENCE
  WORKSHOP
  MEETING
  AWARDS
  FUNDRAISER
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
  ARCHIVED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

enum PaymentType {
  MEMBERSHIP
  EVENT_REGISTRATION
  SPONSORSHIP
  DONATION
  TRAINING
}

enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum CourseEnrollmentStatus {
  ENROLLED
  IN_PROGRESS
  COMPLETED
  DROPPED
}

enum AdminActionType {
  USER_CREATED
  USER_UPDATED
  USER_DELETED
  PROJECT_CREATED
  PROJECT_UPDATED
  PROJECT_DELETED
  EVENT_CREATED
  EVENT_UPDATED
  EVENT_DELETED
  PAYMENT_PROCESSED
  MEMBERSHIP_RENEWED
  SYSTEM_CONFIG_CHANGED
}

// ========================================
// USER MANAGEMENT
// ========================================

model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  password              String
  firstName             String
  lastName              String
  company               String?
  title                 String?
  phone                 String?
  
  // Address and location
  address               Json?     // Structured address object
  city                  String?
  state                 String?
  zipCode               String?
  coordinates           Json?     // {lat: number, lng: number}
  
  // Membership details
  memberType            MemberType @default(REGULAR)
  memberSince           DateTime  @default(now())
  membershipExpiresAt   DateTime?
  isActive              Boolean   @default(true)
  isVerified            Boolean   @default(false)
  
  // Profile enhancements
  profileImage          String?
  bio                   String?
  website               String?
  linkedin              String?
  twitter               String?
  skills                String[]  @default([])
  certifications        Json?     // Array of certification objects
  languages             String[]  @default(["English"])
  
  // Security fields
  failedLoginAttempts   Int       @default(0)
  lockedUntil           DateTime?
  lastFailedLogin       DateTime?
  lastSuccessfulLogin   DateTime?
  twoFactorEnabled      Boolean   @default(false)
  twoFactorSecret       String?
  
  // Communication preferences
  notificationPreferences Json?   @default("{\"email\": true, \"sms\": false, \"push\": true}")
  
  // Timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?
  
  // Relations
  createdBy             User?     @relation("UserCreatedBy", fields: [createdById], references: [id])
  createdById           String?
  updatedBy             User?     @relation("UserUpdatedBy", fields: [updatedById], references: [id])
  updatedById           String?
  
  // One-to-many relations
  createdUsers          User[]    @relation("UserCreatedBy")
  updatedUsers          User[]    @relation("UserUpdatedBy")
  createdProjects       Project[]
  updatedProjects       Project[]
  createdEvents         Event[]
  updatedEvents         Event[]
  sentMessages          Message[] @relation("MessageSender")
  receivedMessages      Message[] @relation("MessageReceiver")
  sentAnnouncements     Announcement[]
  eventRegistrations    EventRegistration[]
  projectApplications   ProjectApplication[]
  courseEnrollments     CourseEnrollment[]
  payments              Payment[]
  adminActions          AdminAction[] @relation("AdminActionUser")
  targetAdminActions    AdminAction[] @relation("AdminActionTarget")
  
  // Many-to-many relations
  userRoles             UserRole[]
  userSkills            UserSkill[]
  
  @@map("users")
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  isSystemRole Boolean @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  userRoles   UserRole[]
  rolePermissions RolePermission[]
  
  @@map("roles")
}

model Permission {
  id                String   @id @default(cuid())
  name              String   @unique
  description       String
  resource          String
  action            String
  conditions        Json?
  isSystemPermission Boolean @default(false)
  createdAt         DateTime @default(now())
  
  // Relations
  rolePermissions   RolePermission[]
  
  @@map("permissions")
}

model UserRole {
  id         String   @id @default(cuid())
  userId     String
  roleId     String
  assignedAt DateTime @default(now())
  assignedBy String?
  expiresAt  DateTime?
  isActive   Boolean  @default(true)
  
  // Relations
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role       Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId])
  @@map("user_roles")
}

model RolePermission {
  id           String   @id @default(cuid())
  roleId       String
  permissionId String
  grantedAt    DateTime @default(now())
  grantedBy    String?
  
  // Relations
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

model UserSkill {
  id       String @id @default(cuid())
  userId   String
  skill    String
  level    String // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  verified Boolean @default(false)
  
  // Relations
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, skill])
  @@map("user_skills")
}

// ========================================
// PROJECT MANAGEMENT
// ========================================

model Project {
  id                    String           @id @default(cuid())
  externalId            String?          // For imported projects (SAM.gov, Caltrans, etc.)
  source                String           @default("MANUAL")
  
  // Project details
  title                 String
  description           String
  category              ProjectCategory
  subcategory           String?
  sector                String[]         @default([])
  
  // Financial information
  budgetMin             Decimal?
  budgetMax             Decimal?
  estimatedValue        Decimal?
  fundingSource         String?
  
  // Location and geography
  location              String?
  coordinates           Json?            // {lat: number, lng: number}
  serviceArea           Json?            // GeoJSON polygon
  address               Json?            // Structured address object
  
  // Timeline
  startDate             DateTime?
  endDate               DateTime?
  deadlineDate          DateTime?
  estimatedDuration     Int?             // in days
  
  // Requirements and qualifications
  requirements          String[]         @default([])
  skillsRequired        String[]         @default([])
  certificationsRequired Json?           // Array of certification requirements
  experienceRequired    Int              @default(0) // years
  bondingRequired       Boolean          @default(false)
  insuranceRequired     Json?            // Insurance requirements object
  
  // Project status and metadata
  status                ProjectStatus    @default(DRAFT)
  priority              ProjectPriority  @default(MEDIUM)
  visibility            ProjectVisibility @default(PUBLIC)
  maxApplications       Int?
  applicationCount      Int              @default(0)
  
  // Contact information
  contactName           String?
  contactEmail          String?
  contactPhone          String?
  organization          String?
  
  // Search and matching optimization
  keywords              String[]         @default([])
  searchVector          Unsupported("tsvector")?
  
  // Timestamps
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  publishedAt           DateTime?
  closedAt              DateTime?
  deletedAt             DateTime?
  
  // Relations
  createdBy             User             @relation(fields: [createdById], references: [id])
  createdById           String
  updatedBy             User?            @relation(fields: [updatedById], references: [id])
  updatedById           String?
  
  // One-to-many relations
  projectApplications   ProjectApplication[]
  projectFiles          ProjectFile[]
  
  @@map("projects")
}

model ProjectApplication {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  status      String   @default("PENDING") // PENDING, REVIEWING, APPROVED, REJECTED, WITHDRAWN
  coverLetter String?
  proposal    String?
  bidAmount   Decimal?
  submittedAt DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?
  notes       String?
  
  // Relations
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, userId])
  @@map("project_applications")
}

model ProjectFile {
  id        String   @id @default(cuid())
  projectId String
  fileName  String
  filePath  String
  fileType  String
  fileSize  Int
  uploadedAt DateTime @default(now())
  uploadedBy String
  
  // Relations
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@map("project_files")
}

// ========================================
// EVENT MANAGEMENT
// ========================================

model Event {
  id              String      @id @default(cuid())
  title           String
  description     String
  type            EventType
  status          EventStatus @default(DRAFT)
  
  // Event details
  startDate       DateTime
  endDate         DateTime
  registrationDeadline DateTime?
  maxCapacity     Int?
  currentCapacity Int         @default(0)
  
  // Location
  location        String?
  address         Json?
  coordinates     Json?
  isVirtual       Boolean     @default(false)
  virtualUrl      String?
  
  // Pricing
  price           Decimal     @default(0)
  memberPrice     Decimal?
  earlyBirdPrice  Decimal?
  earlyBirdDeadline DateTime?
  
  // Event content
  agenda          Json?
  speakers        Json?
  sponsors        Json?
  materials       Json?
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  publishedAt     DateTime?
  deletedAt       DateTime?
  
  // Relations
  createdBy       User        @relation(fields: [createdById], references: [id])
  createdById     String
  updatedBy       User?       @relation(fields: [updatedById], references: [id])
  updatedById     String?
  
  // One-to-many relations
  eventRegistrations EventRegistration[]
  eventFiles       EventFile[]
  
  @@map("events")
}

model EventRegistration {
  id        String   @id @default(cuid())
  eventId   String
  userId    String
  status    String   @default("REGISTERED") // REGISTERED, ATTENDED, NO_SHOW, CANCELLED
  paid      Boolean  @default(false)
  paidAt    DateTime?
  amount    Decimal?
  notes     String?
  registeredAt DateTime @default(now())
  
  // Relations
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, userId])
  @@map("event_registrations")
}

model EventFile {
  id        String   @id @default(cuid())
  eventId   String
  fileName  String
  filePath  String
  fileType  String
  fileSize  Int
  uploadedAt DateTime @default(now())
  uploadedBy String
  
  // Relations
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@map("event_files")
}

// ========================================
// COMMUNICATION SYSTEM
// ========================================

model Message {
  id        String        @id @default(cuid())
  senderId  String
  receiverId String
  subject   String?
  content   String
  status    MessageStatus @default(SENT)
  readAt    DateTime?
  sentAt    DateTime      @default(now())
  
  // Relations
  sender    User          @relation("MessageSender", fields: [senderId], references: [id], onDelete: Cascade)
  receiver  User          @relation("MessageReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  
  @@map("messages")
}

model Announcement {
  id          String   @id @default(cuid())
  title       String
  content     String
  senderId    String
  targetAudience String? // ALL, REGULAR, ADMIN, SPECIFIC_GROUPS
  targetGroups Json?    // Array of group IDs
  isUrgent    Boolean  @default(false)
  expiresAt   DateTime?
  sentAt      DateTime @default(now())
  
  // Relations
  sender      User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
  
  @@map("announcements")
}

// ========================================
// LEARNING MANAGEMENT SYSTEM
// ========================================

model Course {
  id          String       @id @default(cuid())
  title       String
  description String
  status      CourseStatus @default(DRAFT)
  
  // Course details
  duration    Int?         // in minutes
  difficulty  String?      // BEGINNER, INTERMEDIATE, ADVANCED
  category    String?
  tags        String[]     @default([])
  
  // Content
  modules     Json?        // Array of module objects
  requirements String[]    @default([])
  objectives  String[]     @default([])
  
  // Pricing
  price       Decimal      @default(0)
  memberPrice Decimal?
  
  // Timestamps
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  publishedAt DateTime?
  
  // One-to-many relations
  courseEnrollments CourseEnrollment[]
  courseModules     CourseModule[]
  
  @@map("courses")
}

model CourseModule {
  id          String   @id @default(cuid())
  courseId    String
  title       String
  description String?
  order       Int
  duration    Int?     // in minutes
  content     Json?    // Module content structure
  
  // Relations
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@map("course_modules")
}

model CourseEnrollment {
  id          String                 @id @default(cuid())
  courseId    String
  userId      String
  status      CourseEnrollmentStatus @default(ENROLLED)
  progress    Int                    @default(0) // percentage
  completedAt DateTime?
  enrolledAt  DateTime               @default(now())
  
  // Relations
  course      Course                 @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user        User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([courseId, userId])
  @@map("course_enrollments")
}

// ========================================
// FINANCIAL SYSTEM
// ========================================

model Payment {
  id          String        @id @default(cuid())
  userId      String
  type        PaymentType
  status      PaymentStatus @default(PENDING)
  
  // Payment details
  amount      Decimal
  currency    String        @default("USD")
  description String?
  referenceId String?       // External payment reference
  
  // Stripe integration
  stripePaymentId String?
  stripeCustomerId String?
  
  // Timestamps
  createdAt   DateTime      @default(now())
  processedAt DateTime?
  
  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("payments")
}

model MembershipTier {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  price       Decimal
  duration    Int      // in months
  benefits    Json?    // Array of benefit objects
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("membership_tiers")
}

// ========================================
// AUDIT & COMPLIANCE
// ========================================

model AdminAction {
  id          String         @id @default(cuid())
  action      AdminActionType
  userId      String         // User performing the action
  targetUserId String?       // User being acted upon
  details     String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime       @default(now())
  
  // Relations
  user        User           @relation("AdminActionUser", fields: [userId], references: [id], onDelete: Cascade)
  targetUser  User?          @relation("AdminActionTarget", fields: [targetUserId], references: [id], onDelete: SetNull)
  
  @@map("admin_actions")
}

// ========================================
// ANALYTICS & FEEDBACK
// ========================================

model MemberFeedback {
  id        String   @id @default(cuid())
  userId    String
  category  String   // GENERAL, FEATURE_REQUEST, BUG_REPORT, SUPPORT
  subject   String
  message   String
  priority  String   @default("MEDIUM") // LOW, MEDIUM, HIGH, URGENT
  status    String   @default("OPEN") // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  response  String?
  respondedAt DateTime?
  respondedBy String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("member_feedback")
}

model SystemMetric {
  id        String   @id @default(cuid())
  metric    String   // ACTIVE_USERS, PROJECT_VIEWS, EVENT_REGISTRATIONS, etc.
  value     Float
  metadata  Json?
  recordedAt DateTime @default(now())
  
  @@map("system_metrics")
}
```

---

## 🔗 Entity Relationship Diagram (ERD)

### Core Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAMC PORTAL ERD                          │
└─────────────────────────────────────────────────────────────────┘

USER MANAGEMENT
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │    Role     │    │ Permission  │
│             │    │             │    │             │
│ - id        │    │ - id        │    │ - id        │
│ - email     │    │ - name      │    │ - name      │
│ - firstName │    │ - desc      │    │ - resource  │
│ - lastName  │    │ - isActive  │    │ - action    │
│ - memberType│    └─────────────┘    └─────────────┘
│ - isActive  │            │                   │
│ - skills[]  │            │                   │
└─────────────┘            │                   │
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ UserRole    │    │ RolePerm    │    │ UserSkill   │
│             │    │             │    │             │
│ - userId    │    │ - roleId    │    │ - userId    │
│ - roleId    │    │ - permId    │    │ - skill     │
│ - assignedAt│    │ - grantedAt │    │ - level     │
│ - isActive  │    └─────────────┘    │ - verified  │
└─────────────┘                       └─────────────┘

PROJECT MANAGEMENT
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Project   │    │ ProjectApp  │    │ ProjectFile │
│             │    │             │    │             │
│ - id        │    │ - id        │    │ - id        │
│ - title     │    │ - projectId │    │ - projectId │
│ - category  │    │ - userId    │    │ - fileName  │
│ - status    │    │ - status    │    │ - filePath  │
│ - budget    │    │ - bidAmount │    │ - fileType  │
│ - location  │    │ - submitted │    │ - uploadedAt│
│ - skills[]  │    └─────────────┘    └─────────────┘
└─────────────┘            │
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│    User     │    │    User     │
│ (createdBy) │    │ (applicant) │
└─────────────┘    └─────────────┘

EVENT MANAGEMENT
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Event    │    │ EventReg    │    │ EventFile   │
│             │    │             │    │             │
│ - id        │    │ - id        │    │ - id        │
│ - title     │    │ - eventId   │    │ - eventId   │
│ - type      │    │ - userId    │    │ - fileName  │
│ - status    │    │ - status    │    │ - filePath  │
│ - startDate │    │ - paid      │    │ - fileType  │
│ - endDate   │    │ - amount    │    │ - uploadedAt│
│ - location  │    │ - registered│    └─────────────┘
│ - price     │    └─────────────┘
└─────────────┘            │
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│    User     │    │    User     │
│ (createdBy) │    │ (attendee)  │
└─────────────┘    └─────────────┘

COMMUNICATION
┌─────────────┐    ┌─────────────┐
│   Message   │    │Announcement │
│             │    │             │
│ - id        │    │ - id        │
│ - senderId  │    │ - title     │
│ - receiverId│    │ - content   │
│ - subject   │    │ - senderId  │
│ - content   │    │ - audience  │
│ - status    │    │ - isUrgent  │
│ - sentAt    │    │ - sentAt    │
└─────────────┘    └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│    User     │    │    User     │
│ (sender)    │    │ (sender)    │
└─────────────┘    └─────────────┘

LEARNING MANAGEMENT
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Course    │    │ CourseEnroll│    │ CourseModule│
│             │    │             │    │             │
│ - id        │    │ - id        │    │ - id        │
│ - title     │    │ - courseId  │    │ - courseId  │
│ - status    │    │ - userId    │    │ - title     │
│ - duration  │    │ - status    │    │ - order     │
│ - price     │    │ - progress  │    │ - content   │
│ - modules[] │    │ - enrolledAt│    └─────────────┘
└─────────────┘    └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│    User     │    │    User     │
│ (createdBy) │    │ (student)   │
└─────────────┘    └─────────────┘

FINANCIAL SYSTEM
┌─────────────┐    ┌─────────────┐
│   Payment   │    │MembershipTier│
│             │    │             │
│ - id        │    │ - id        │
│ - userId    │    │ - name      │
│ - type      │    │ - price     │
│ - status    │    │ - duration  │
│ - amount    │    │ - benefits  │
│ - currency  │    │ - isActive  │
│ - stripeId  │    └─────────────┘
└─────────────┘
       │
       │
       ▼
┌─────────────┐
│    User     │
│ (payer)     │
└─────────────┘

AUDIT & COMPLIANCE
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ AdminAction │    │MemberFeedback│    │SystemMetric │
│             │    │             │    │             │
│ - id        │    │ - id        │    │ - id        │
│ - action    │    │ - userId    │    │ - metric    │
│ - userId    │    │ - category  │    │ - value     │
│ - targetId  │    │ - subject   │    │ - metadata  │
│ - details   │    │ - message   │    │ - recordedAt│
│ - metadata  │    │ - status    │    └─────────────┘
│ - createdAt │    │ - createdAt │
└─────────────┘    └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│    User     │    │    User     │
│ (actor)     │    │ (reporter)  │
└─────────────┘    └─────────────┘
```

---

## 📊 Data Model Description

### 1. User Management System

#### Core User Entity
The `User` table serves as the central entity for all member portal interactions. It stores comprehensive member information including:

- **Identity**: Basic contact information (name, email, phone)
- **Business Profile**: Company details, title, skills, certifications
- **Location**: Address with geospatial coordinates for location-based features
- **Membership**: Type (REGULAR/admin), status, expiration dates
- **Security**: Password hashing, login tracking, 2FA support
- **Preferences**: Notification settings, communication preferences

#### Role-Based Access Control (RBAC)
A flexible permission system supporting:
- **Roles**: Predefined and custom roles (admin, member, committee chair)
- **Permissions**: Granular resource-action permissions
- **User-Role Assignments**: Many-to-many relationships with expiration dates
- **Audit Trail**: Complete tracking of permission changes

### 2. Project Management System

#### Project Entity
Comprehensive project tracking with:
- **Project Details**: Title, description, category, sector classification
- **Financial Information**: Budget ranges, estimated values, funding sources
- **Location Data**: Address, coordinates, service area polygons
- **Timeline**: Start/end dates, deadlines, estimated duration
- **Requirements**: Skills, certifications, experience, bonding/insurance needs
- **Status Management**: Draft → Published → Bidding → Awarded → Completed
- **Search Optimization**: Full-text search vectors, keywords, tags

#### Project Applications
Member application tracking with:
- **Application Status**: Pending → Reviewing → Approved/Rejected
- **Submission Details**: Cover letters, proposals, bid amounts
- **Review Process**: Admin review tracking with notes and decisions

### 3. Event Management System

#### Event Entity
Complete event lifecycle management:
- **Event Information**: Title, description, type, status
- **Scheduling**: Start/end dates, registration deadlines
- **Location**: Physical/virtual locations with coordinates
- **Pricing**: Multiple pricing tiers (regular, member, early bird)
- **Capacity Management**: Maximum capacity, current registrations
- **Content**: Agendas, speakers, sponsors, materials

#### Event Registrations
Attendee management with:
- **Registration Status**: Registered → Attended/No-show
- **Payment Tracking**: Payment status, amounts, processing
- **Attendance Tracking**: Check-in/check-out timestamps

### 4. Communication System

#### Messaging System
Direct member-to-member communication:
- **Message Tracking**: Sent → Delivered → Read status
- **Content Management**: Subject lines, rich text content
- **Privacy Controls**: Sender/receiver relationships

#### Announcements
Admin broadcast system:
- **Targeting**: Audience selection (all, specific groups, member types)
- **Urgency Levels**: Priority flagging for important announcements
- **Expiration**: Time-based announcement lifecycle

### 5. Learning Management System

#### Course Management
Comprehensive training platform:
- **Course Structure**: Modules, lessons, assessments
- **Content Types**: Video, text, interactive elements
- **Progress Tracking**: Enrollment status, completion percentages
- **Certification**: Automated certificate generation

#### Enrollment System
Student progress tracking:
- **Enrollment Status**: Enrolled → In Progress → Completed
- **Progress Monitoring**: Percentage completion, time tracking
- **Assessment Results**: Quiz scores, certification status

### 6. Financial System

#### Payment Processing
Integrated payment management:
- **Payment Types**: Membership, events, training, sponsorships
- **Status Tracking**: Pending → Processing → Completed/Failed
- **Stripe Integration**: External payment processor integration
- **Audit Trail**: Complete payment history

#### Membership Tiers
Flexible membership structure:
- **Tier Definition**: Name, price, duration, benefits
- **Benefit Management**: JSON-structured benefit descriptions
- **Active/Inactive**: Tier lifecycle management

### 7. Audit & Compliance System

#### Admin Actions
Complete audit trail for:
- **User Management**: Creation, updates, deletions
- **Content Management**: Project/event creation and modifications
- **System Changes**: Configuration updates, permission changes
- **Compliance**: Government contractor audit requirements

#### Feedback System
Member support and improvement tracking:
- **Feedback Categories**: General, feature requests, bug reports, support
- **Priority Management**: Urgency levels and response tracking
- **Resolution Tracking**: Status updates and admin responses

### 8. Analytics & Metrics

#### System Metrics
Performance and usage tracking:
- **Usage Metrics**: Active users, feature utilization
- **Performance Data**: Response times, error rates
- **Business Metrics**: Project views, application rates, event attendance

---

## 🔧 Database Optimization

### Indexing Strategy

#### Performance Indexes
```sql
-- User search and filtering
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_member_type ON users(member_type) WHERE is_active = true;
CREATE INDEX idx_users_company ON users(company) WHERE company IS NOT NULL;
CREATE INDEX idx_users_skills ON users USING GIN (skills);

-- Project search and matching
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_category ON projects(category, status);
CREATE INDEX idx_projects_budget ON projects(budget_min, budget_max);
CREATE INDEX idx_projects_deadline ON projects(deadline_date) WHERE deadline_date > NOW();
CREATE INDEX idx_projects_search ON projects USING GIN (search_vector);

-- Event management
CREATE INDEX idx_events_status ON events(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_date ON events(start_date, end_date);
CREATE INDEX idx_events_type ON events(type, status);

-- Communication
CREATE INDEX idx_messages_sender ON messages(sender_id, sent_at DESC);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, status, sent_at DESC);

-- Financial tracking
CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status, type);

-- Audit trail
CREATE INDEX idx_admin_actions_user ON admin_actions(user_id, created_at DESC);
CREATE INDEX idx_admin_actions_type ON admin_actions(action, created_at DESC);
```

### Query Optimization

#### Common Query Patterns
1. **Member Search**: Optimized for company, skills, location filtering
2. **Project Matching**: Full-text search with category and budget filtering
3. **Event Registration**: Capacity checking with payment status
4. **Communication**: Message threading and status tracking
5. **Analytics**: Aggregated metrics for dashboard reporting

### Data Integrity

#### Constraints and Validation
- **Foreign Key Constraints**: All relationships properly constrained
- **Check Constraints**: Enum values, date ranges, numeric limits
- **Unique Constraints**: Email addresses, business rules
- **Trigger Functions**: Search vector updates, audit trail maintenance

---

## 🚀 Migration Strategy

### Phase 1: Core User Management
1. User authentication and profiles
2. Role-based access control
3. Basic member directory

### Phase 2: Project Management
1. Project creation and management
2. Application system
3. Search and matching

### Phase 3: Event Management
1. Event creation and registration
2. Payment processing
3. Attendance tracking

### Phase 4: Communication & Learning
1. Messaging system
2. Announcements
3. Course management

### Phase 5: Analytics & Optimization
1. System metrics
2. Performance optimization
3. Advanced analytics

This database schema provides a solid foundation for the NAMC NorCal Member Portal, supporting all core business requirements while maintaining flexibility for future enhancements and scalability. 