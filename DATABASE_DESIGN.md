# NAMC NorCal Member Portal - Database Design Document

*Comprehensive database schema, relationships, and optimization strategies*

## 📊 Database Overview

### Design Philosophy
- **ACID Compliance**: Ensure data consistency and reliability
- **Normalization**: 3NF with strategic denormalization for performance
- **Scalability**: Designed for horizontal scaling and read replicas
- **Security**: Column-level encryption for sensitive data
- **Audit Trail**: Complete change tracking for compliance
- **Performance**: Optimized indexes and query patterns

### Technology Stack
- **Database Engine**: PostgreSQL 15.4 with PostGIS extension
- **ORM**: Prisma 6.1.0 for type-safe database access
- **Migration Tool**: Prisma Migrate for version control
- **Monitoring**: pgAnalyze for query performance analysis
- **Backup**: Continuous WAL-E with point-in-time recovery

---

## 🗄️ Core Database Schema

### 1. User Management & Security

#### Users Table
```sql
CREATE TABLE users (
  -- Primary identification
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  
  -- Personal information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  title TEXT,
  phone TEXT,
  
  -- Address with geocoding support
  address JSONB DEFAULT '{}',
  city TEXT,
  state TEXT,
  zip_code TEXT,
  coordinates GEOGRAPHY(POINT, 4326),
  
  -- Membership details
  member_type member_type_enum DEFAULT 'REGULAR',
  member_since TIMESTAMP DEFAULT NOW(),
  membership_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Profile enhancements
  profile_image TEXT,
  bio TEXT,
  website TEXT,
  linkedin TEXT,
  twitter TEXT,
  skills TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]',
  languages TEXT[] DEFAULT '{"English"}',
  
  -- Security fields
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_failed_login TIMESTAMP,
  last_successful_login TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  
  -- Communication preferences
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": false,
    "push": true,
    "marketing": true,
    "project_alerts": true,
    "event_reminders": true
  }',
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  deleted_at TIMESTAMP
);

-- Essential indexes for performance
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_member_type ON users(member_type) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_users_expires ON users(membership_expires_at) WHERE membership_expires_at IS NOT NULL;
CREATE INDEX idx_users_company ON users(company) WHERE company IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_users_location ON users USING GIST (coordinates) WHERE coordinates IS NOT NULL;
CREATE INDEX idx_users_skills ON users USING GIN (skills) WHERE array_length(skills, 1) > 0;
CREATE INDEX idx_users_active_members ON users(member_since, member_type) WHERE is_active = true AND deleted_at IS NULL;
```

#### Role-Based Access Control (RBAC)
```sql
-- Roles definition
CREATE TABLE roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  permissions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Granular permissions system
CREATE TABLE permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  is_system_permission BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User role assignments
CREATE TABLE user_roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by TEXT REFERENCES users(id),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Role permission mappings
CREATE TABLE role_permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by TEXT REFERENCES users(id),
  UNIQUE(role_id, permission_id)
);

-- Indexes for RBAC performance
CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE is_active = true;
CREATE INDEX idx_user_roles_role ON user_roles(role_id) WHERE is_active = true;
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
```

### 2. Project Management System

#### Projects Table
```sql
CREATE TABLE projects (
  -- Primary identification
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT, -- For imported projects (SAM.gov, Caltrans, etc.)
  source TEXT DEFAULT 'MANUAL',
  
  -- Project details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category project_category_enum NOT NULL,
  subcategory TEXT,
  sector TEXT[] DEFAULT '{}',
  
  -- Financial information
  budget_min DECIMAL(15,2),
  budget_max DECIMAL(15,2),
  estimated_value DECIMAL(15,2),
  funding_source TEXT,
  
  -- Location and geography
  location TEXT,
  coordinates GEOGRAPHY(POINT, 4326),
  service_area GEOGRAPHY(POLYGON, 4326),
  address JSONB DEFAULT '{}',
  
  -- Timeline
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  deadline_date TIMESTAMP,
  estimated_duration INTEGER, -- in days
  
  -- Requirements and qualifications
  requirements TEXT[] NOT NULL DEFAULT '{}',
  skills_required TEXT[] NOT NULL DEFAULT '{}',
  certifications_required TEXT[] DEFAULT '{}',
  experience_required INTEGER DEFAULT 0, -- years
  bonding_required BOOLEAN DEFAULT false,
  insurance_required JSONB DEFAULT '{}',
  
  -- Project status and metadata
  status project_status_enum DEFAULT 'DRAFT',
  priority project_priority_enum DEFAULT 'MEDIUM',
  visibility project_visibility_enum DEFAULT 'PUBLIC',
  max_applications INTEGER,
  application_count INTEGER DEFAULT 0,
  
  -- Contact information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  organization TEXT,
  
  -- Search and matching optimization
  keywords TEXT[] DEFAULT '{}',
  search_vector TSVECTOR,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES users(id),
  updated_by TEXT,
  published_at TIMESTAMP,
  closed_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Project search and performance indexes
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_category ON projects(category, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_budget ON projects(budget_min, budget_max) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_deadline ON projects(deadline_date) WHERE deadline_date > NOW();
CREATE INDEX idx_projects_location ON projects USING GIST (coordinates) WHERE coordinates IS NOT NULL;
CREATE INDEX idx_projects_skills ON projects USING GIN (skills_required);
CREATE INDEX idx_projects_search ON projects USING GIN (search_vector);
CREATE INDEX idx_projects_created ON projects(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_external ON projects(external_id, source) WHERE external_id IS NOT NULL;

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION update_project_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.keywords, ' '), '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.organization, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_search_vector
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_project_search_vector();
```

#### Project Applications
```sql
CREATE TABLE project_applications (
  -- Primary identification
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Application content
  proposal TEXT NOT NULL,
  experience_description TEXT NOT NULL,
  timeline_description TEXT NOT NULL,
  budget_proposal DECIMAL(15,2),
  
  -- Additional information
  team_members JSONB DEFAULT '[]',
  portfolio_items JSONB DEFAULT '[]',
  references JSONB DEFAULT '[]',
  certifications_provided TEXT[] DEFAULT '{}',
  
  -- Application workflow
  status application_status_enum DEFAULT 'PENDING',
  priority INTEGER DEFAULT 0,
  match_score DECIMAL(5,2), -- AI-calculated match score
  
  -- Review process
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by TEXT REFERENCES users(id),
  review_notes TEXT,
  feedback TEXT,
  
  -- Decision tracking
  decision application_decision_enum,
  decision_at TIMESTAMP,
  decision_by TEXT REFERENCES users(id),
  decision_reason TEXT,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

-- Application performance indexes
CREATE INDEX idx_applications_project ON project_applications(project_id, status);
CREATE INDEX idx_applications_user ON project_applications(user_id, status);
CREATE INDEX idx_applications_status ON project_applications(status, submitted_at DESC);
CREATE INDEX idx_applications_match_score ON project_applications(match_score DESC) WHERE match_score IS NOT NULL;
CREATE INDEX idx_applications_pending_review ON project_applications(submitted_at) WHERE status = 'PENDING';
```

### 3. Learning Management System

#### Courses and Content Structure
```sql
-- Course catalog
CREATE TABLE courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  instructor_image TEXT,
  
  -- Course metadata
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  level course_level_enum DEFAULT 'BEGINNER',
  language TEXT DEFAULT 'English',
  
  -- Content details
  total_duration INTEGER NOT NULL, -- in minutes
  module_count INTEGER DEFAULT 0,
  lesson_count INTEGER DEFAULT 0,
  assessment_count INTEGER DEFAULT 0,
  
  -- Pricing and access
  price DECIMAL(8,2) DEFAULT 0,
  is_free BOOLEAN GENERATED ALWAYS AS (price = 0) STORED,
  access_duration INTEGER, -- days of access after enrollment
  
  -- Media and resources
  thumbnail_url TEXT,
  preview_video_url TEXT,
  downloadable_resources TEXT[] DEFAULT '{}',
  
  -- Learning objectives and outcomes
  learning_objectives TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  target_audience TEXT[] DEFAULT '{}',
  
  -- Publication and visibility
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  publication_date TIMESTAMP,
  
  -- Performance tracking
  enrollment_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES users(id),
  deleted_at TIMESTAMP
);

-- Course modules
CREATE TABLE course_modules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  learning_objectives TEXT[] DEFAULT '{}',
  
  -- Structure
  order_index INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  lesson_count INTEGER DEFAULT 0,
  
  -- Publication
  is_published BOOLEAN DEFAULT false,
  is_preview BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual lessons
CREATE TABLE lessons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Content
  content TEXT NOT NULL,
  type lesson_type_enum DEFAULT 'TEXT',
  video_url TEXT,
  video_duration INTEGER, -- in seconds
  
  -- Structure
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER, -- in minutes
  
  -- Resources
  downloadable_files TEXT[] DEFAULT '{}',
  external_links JSONB DEFAULT '[]',
  
  -- Publication
  is_published BOOLEAN DEFAULT false,
  is_preview BOOLEAN DEFAULT false,
  
  -- Completion tracking
  completion_criteria JSONB DEFAULT '{"type": "viewed"}',
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Course performance indexes
CREATE INDEX idx_courses_published ON courses(is_published, category) WHERE deleted_at IS NULL;
CREATE INDEX idx_courses_featured ON courses(is_featured, created_at DESC) WHERE is_featured = true;
CREATE INDEX idx_courses_instructor ON courses(instructor_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_courses_price ON courses(price, level) WHERE is_published = true;
CREATE INDEX idx_course_modules_course ON course_modules(course_id, order_index);
CREATE INDEX idx_lessons_module ON lessons(module_id, order_index);
```

#### Assessment and Progress Tracking
```sql
-- Assessment system
CREATE TABLE assessments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES course_modules(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Assessment configuration
  type assessment_type_enum DEFAULT 'QUIZ',
  question_count INTEGER DEFAULT 0,
  passing_score DECIMAL(5,2) DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  time_limit INTEGER, -- in minutes
  
  -- Questions and answers (JSONB for flexibility)
  questions JSONB NOT NULL DEFAULT '[]',
  
  -- Grading
  auto_grade BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true,
  show_results_immediately BOOLEAN DEFAULT true,
  
  -- Publication
  is_published BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment submissions
CREATE TABLE assessment_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  
  -- Submission data
  answers JSONB NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  
  -- Timing
  started_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  time_taken INTEGER, -- in seconds
  
  -- Attempt tracking
  attempt_number INTEGER NOT NULL,
  
  -- Grading details
  auto_graded BOOLEAN DEFAULT true,
  graded_by TEXT REFERENCES users(id),
  graded_at TIMESTAMP,
  feedback TEXT
);

-- Course enrollments and progress
CREATE TABLE course_enrollments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Enrollment details
  enrolled_at TIMESTAMP DEFAULT NOW(),
  access_expires_at TIMESTAMP,
  
  -- Progress tracking
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  
  -- Status
  status enrollment_status_enum DEFAULT 'ACTIVE',
  
  -- Payment tracking
  payment_id TEXT REFERENCES payments(id),
  amount_paid DECIMAL(8,2) DEFAULT 0,
  
  UNIQUE(user_id, course_id)
);

-- Detailed lesson progress
CREATE TABLE lesson_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  
  -- Progress tracking
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0, -- in seconds
  
  -- Video progress (for video lessons)
  video_progress INTEGER DEFAULT 0, -- seconds watched
  video_completed BOOLEAN DEFAULT false,
  
  -- Notes and bookmarks
  notes TEXT,
  bookmarks JSONB DEFAULT '[]',
  
  UNIQUE(user_id, lesson_id)
);

-- Certificate management
CREATE TABLE certificates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Certificate details
  certificate_number TEXT UNIQUE NOT NULL,
  verification_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  -- Certificate file
  certificate_url TEXT NOT NULL,
  certificate_hash TEXT, -- for integrity verification
  
  -- Metadata
  final_score DECIMAL(5,2),
  completion_time INTEGER, -- total time in minutes
  
  UNIQUE(user_id, course_id)
);
```

### 4. Financial Management System

#### Payment Processing
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT NOT NULL,
  
  -- Payment method and processing
  payment_method payment_method_enum NOT NULL,
  status payment_status_enum DEFAULT 'PENDING',
  
  -- Stripe integration
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  stripe_charge_id TEXT,
  
  -- Payment categorization
  type payment_type_enum NOT NULL,
  category TEXT,
  
  -- Related records
  membership_tier_id TEXT REFERENCES membership_tiers(id),
  course_id TEXT REFERENCES courses(id),
  event_id TEXT REFERENCES events(id),
  
  -- Metadata and tracking
  metadata JSONB DEFAULT '{}',
  receipt_url TEXT,
  invoice_id TEXT,
  
  -- Processing timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  failed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  
  -- Audit fields
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT
);

-- Subscription management
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  membership_tier_id TEXT NOT NULL REFERENCES membership_tiers(id),
  
  -- Stripe subscription details
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  
  -- Subscription lifecycle
  status subscription_status_enum DEFAULT 'ACTIVE',
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Billing details
  billing_cycle_anchor TIMESTAMP,
  days_until_due INTEGER DEFAULT 0,
  
  -- Trial period
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  
  -- Pricing
  unit_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membership tiers configuration
CREATE TABLE membership_tiers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Pricing
  price_monthly DECIMAL(8,2) NOT NULL,
  price_yearly DECIMAL(8,2),
  setup_fee DECIMAL(8,2) DEFAULT 0,
  
  -- Features and benefits
  benefits TEXT[] NOT NULL DEFAULT '{}',
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  
  -- Access controls
  permissions TEXT[] DEFAULT '{}',
  priority_level INTEGER DEFAULT 0,
  
  -- Stripe integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice generation and management
CREATE TABLE invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Invoice identification
  invoice_number TEXT UNIQUE NOT NULL,
  
  -- Financial details
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Invoice status and dates
  status invoice_status_enum DEFAULT 'DRAFT',
  issue_date TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP NOT NULL,
  paid_date TIMESTAMP,
  
  -- Line items (JSONB for flexibility)
  line_items JSONB NOT NULL DEFAULT '[]',
  
  -- Payment tracking
  payment_id TEXT REFERENCES payments(id),
  stripe_invoice_id TEXT,
  
  -- File storage
  pdf_url TEXT,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial performance indexes
CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status, created_at DESC);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_invoices_user ON invoices(user_id, issue_date DESC);
CREATE INDEX idx_invoices_status ON invoices(status, due_date);
```

### 5. Communication & Engagement

#### Messaging System
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Message content
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type message_type_enum DEFAULT 'DIRECT',
  
  -- Status and tracking
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  priority message_priority_enum DEFAULT 'NORMAL',
  
  -- Threading and organization
  thread_id TEXT,
  reply_to_id TEXT REFERENCES messages(id),
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  moderated_by TEXT REFERENCES users(id),
  moderated_at TIMESTAMP,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Message performance indexes
CREATE INDEX idx_messages_receiver ON messages(receiver_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE NOT is_read AND deleted_at IS NULL;
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at) WHERE thread_id IS NOT NULL;
```

#### Event Management
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic event information
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  
  -- Event scheduling
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  timezone TEXT DEFAULT 'America/Los_Angeles',
  
  -- Location details
  location_type event_location_type_enum DEFAULT 'IN_PERSON',
  venue_name TEXT,
  venue_address JSONB,
  venue_coordinates GEOGRAPHY(POINT, 4326),
  
  -- Virtual event details
  meeting_platform TEXT,
  meeting_url TEXT,
  meeting_id TEXT,
  meeting_password TEXT,
  
  -- Registration and capacity
  max_attendees INTEGER,
  registration_deadline TIMESTAMP,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Pricing
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(8,2) DEFAULT 0,
  early_bird_price DECIMAL(8,2),
  early_bird_deadline TIMESTAMP,
  
  -- Event categorization
  category event_category_enum DEFAULT 'GENERAL',
  tags TEXT[] DEFAULT '{}',
  target_audience TEXT[] DEFAULT '{}',
  
  -- Content and media
  featured_image TEXT,
  agenda JSONB DEFAULT '[]',
  speakers JSONB DEFAULT '[]',
  sponsors JSONB DEFAULT '[]',
  
  -- Status and visibility
  status event_status_enum DEFAULT 'DRAFT',
  visibility event_visibility_enum DEFAULT 'PUBLIC',
  is_featured BOOLEAN DEFAULT false,
  
  -- Registration tracking
  registration_count INTEGER DEFAULT 0,
  attendee_count INTEGER DEFAULT 0,
  waitlist_count INTEGER DEFAULT 0,
  
  -- Communication
  reminder_sent BOOLEAN DEFAULT false,
  follow_up_sent BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT NOT NULL REFERENCES users(id),
  deleted_at TIMESTAMP
);

-- Event registrations
CREATE TABLE event_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Registration details
  registration_date TIMESTAMP DEFAULT NOW(),
  status registration_status_enum DEFAULT 'REGISTERED',
  
  -- Payment tracking
  payment_id TEXT REFERENCES payments(id),
  amount_paid DECIMAL(8,2) DEFAULT 0,
  
  -- Attendance tracking
  checked_in BOOLEAN DEFAULT false,
  check_in_time TIMESTAMP,
  attended BOOLEAN DEFAULT false,
  
  -- Additional information
  dietary_restrictions TEXT,
  accessibility_needs TEXT,
  emergency_contact JSONB,
  custom_fields JSONB DEFAULT '{}',
  
  -- Communication preferences
  wants_reminders BOOLEAN DEFAULT true,
  wants_follow_up BOOLEAN DEFAULT true,
  
  UNIQUE(event_id, user_id)
);

-- Event performance indexes
CREATE INDEX idx_events_dates ON events(start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_category ON events(category, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_featured ON events(is_featured, start_date) WHERE is_featured = true;
CREATE INDEX idx_events_location ON events USING GIST (venue_coordinates) WHERE venue_coordinates IS NOT NULL;
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id, registration_date DESC);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id, registration_date DESC);
```

### 6. AI and Analytics

#### AI Feedback and Model Management
```sql
CREATE TABLE ai_feedback (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  
  -- AI interaction details
  feature TEXT NOT NULL,
  model_version TEXT,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  
  -- User feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  is_accurate BOOLEAN,
  is_helpful BOOLEAN,
  
  -- Context and metadata
  session_id TEXT,
  request_id TEXT,
  response_time_ms INTEGER,
  
  -- Processing details
  confidence_score DECIMAL(5,4),
  model_parameters JSONB,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP DEFAULT NOW()
);

-- AI model configuration and performance tracking
CREATE TABLE ai_models (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  model_type ai_model_type_enum NOT NULL,
  
  -- Performance metrics
  accuracy DECIMAL(7,6),
  precision_score DECIMAL(7,6),
  recall_score DECIMAL(7,6),
  f1_score DECIMAL(7,6),
  
  -- Configuration
  config JSONB NOT NULL,
  training_data_version TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT false,
  is_production BOOLEAN DEFAULT false,
  
  -- Usage tracking
  request_count INTEGER DEFAULT 0,
  average_response_time DECIMAL(8,2),
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES users(id)
);

-- AI performance indexes
CREATE INDEX idx_ai_feedback_feature ON ai_feedback(feature, created_at DESC);
CREATE INDEX idx_ai_feedback_user ON ai_feedback(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_ai_feedback_rating ON ai_feedback(rating, feature) WHERE rating IS NOT NULL;
CREATE INDEX idx_ai_models_active ON ai_models(is_active, model_type) WHERE is_active = true;
```

### 7. Audit and Notification Systems

#### Comprehensive Audit Trail
```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identification
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  action TEXT NOT NULL,
  
  -- User context
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_role TEXT,
  impersonated_by TEXT REFERENCES users(id),
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  session_id TEXT,
  
  -- Data changes
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  
  -- Event details
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  additional_info JSONB DEFAULT '{}',
  
  -- Severity and classification
  severity audit_severity_enum DEFAULT 'INFO',
  category TEXT,
  compliance_relevant BOOLEAN DEFAULT false,
  
  -- Timestamp (immutable)
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Partition audit logs by month for performance
CREATE TABLE audit_logs_y2025m01 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Audit performance indexes
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id, timestamp DESC);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity, timestamp DESC) WHERE severity IN ('ERROR', 'CRITICAL');
CREATE INDEX idx_audit_logs_compliance ON audit_logs(compliance_relevant, timestamp DESC) WHERE compliance_relevant = true;
```

#### Multi-Channel Notification System
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification content
  type notification_type_enum NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Delivery channels
  channels notification_channel_enum[] DEFAULT '{IN_APP}',
  
  -- Status tracking
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  delivery_status JSONB DEFAULT '{}',
  
  -- Scheduling
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Priority and categorization
  priority notification_priority_enum DEFAULT 'NORMAL',
  category TEXT,
  
  -- Metadata and actions
  data JSONB DEFAULT '{}',
  action_url TEXT,
  action_text TEXT,
  
  -- Template information
  template_id TEXT REFERENCES notification_templates(id),
  template_variables JSONB,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification templates for consistency
CREATE TABLE notification_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Template content
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  html_template TEXT,
  
  -- Template configuration
  type notification_type_enum NOT NULL,
  channels notification_channel_enum[] DEFAULT '{IN_APP}',
  variables TEXT[] DEFAULT '{}',
  
  -- Localization
  locale TEXT DEFAULT 'en-US',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES users(id)
);

-- Notification performance indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_notifications_type ON notifications(type, created_at DESC);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL AND sent_at IS NULL;
```

---

## 🔧 Database Optimization Strategies

### 1. Indexing Strategy

#### Composite Indexes for Common Queries
```sql
-- User lookup optimization
CREATE INDEX idx_users_login ON users(email, password_hash) WHERE is_active = true AND deleted_at IS NULL;

-- Project search optimization
CREATE INDEX idx_projects_search_complex ON projects(status, category, budget_min, budget_max, deadline_date) 
  WHERE deleted_at IS NULL AND status = 'PUBLISHED';

-- Application workflow optimization
CREATE INDEX idx_applications_workflow ON project_applications(status, submitted_at, project_id);

-- Course enrollment optimization
CREATE INDEX idx_enrollments_progress ON course_enrollments(user_id, status, progress_percentage);

-- Payment processing optimization
CREATE INDEX idx_payments_processing ON payments(status, payment_method, created_at DESC);
```

#### Partial Indexes for Efficiency
```sql
-- Active users only
CREATE INDEX idx_users_active_lookup ON users(member_type, member_since) 
  WHERE is_active = true AND deleted_at IS NULL;

-- Published content only
CREATE INDEX idx_courses_published_catalog ON courses(category, level, price) 
  WHERE is_published = true AND deleted_at IS NULL;

-- Pending workflows only
CREATE INDEX idx_pending_applications ON project_applications(project_id, submitted_at) 
  WHERE status = 'PENDING';
```

### 2. Performance Optimization

#### Query Performance Guidelines
```sql
-- Use EXPLAIN ANALYZE for query optimization
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT p.*, pa.match_score
FROM projects p
LEFT JOIN project_applications pa ON p.id = pa.project_id AND pa.user_id = $1
WHERE p.status = 'PUBLISHED'
  AND p.deadline_date > NOW()
  AND p.skills_required && $2
ORDER BY pa.match_score DESC NULLS LAST, p.created_at DESC
LIMIT 20;

-- Optimize with proper indexes and statistics
ANALYZE projects;
ANALYZE project_applications;
```

#### Connection Pooling Configuration
```typescript
const databaseConfig = {
  // Connection pool settings
  pool: {
    min: 2,
    max: 20,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  
  // Performance settings
  statement_timeout: '30s',
  query_timeout: 30000,
  
  // Optimization flags
  ssl: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development'
};
```

### 3. Data Archival and Cleanup

#### Automated Data Lifecycle Management
```sql
-- Archive old audit logs (older than 2 years)
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Move to archive table
  WITH archived AS (
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '2 years'
    AND compliance_relevant = false
    RETURNING *
  )
  INSERT INTO audit_logs_archive SELECT * FROM archived;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly archival
SELECT cron.schedule('archive-audit-logs', '0 2 1 * *', 'SELECT archive_old_audit_logs();');
```

#### Cleanup Procedures
```sql
-- Clean up expired notifications
DELETE FROM notifications 
WHERE expires_at < NOW() - INTERVAL '30 days'
AND is_read = true;

-- Clean up expired sessions
DELETE FROM user_sessions 
WHERE expires_at < NOW();

-- Update statistics after cleanup
ANALYZE notifications;
ANALYZE user_sessions;
```

### 4. Backup and Recovery Strategy

#### Backup Configuration
```sql
-- Point-in-time recovery setup
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'wal-e wal-push %p';
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET wal_keep_segments = 32;

-- Continuous archiving
SELECT pg_start_backup('daily-backup');
-- File system backup occurs here
SELECT pg_stop_backup();
```

#### Recovery Procedures
```bash
# Point-in-time recovery example
wal-e backup-fetch /var/lib/postgresql/data LATEST
postgresql -D /var/lib/postgresql/data &
wal-e wal-fetch 000000010000000000000001 pg_xlog/000000010000000000000001
```

---

## 📊 Database Monitoring and Maintenance

### 1. Performance Monitoring Queries

#### Query Performance Analysis
```sql
-- Top slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Table size analysis
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS total_size,
  pg_size_pretty(pg_relation_size(tablename::regclass)) AS table_size,
  pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) AS index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

### 2. Automated Maintenance Tasks

#### Statistics Updates
```sql
-- Daily statistics update
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS VOID AS $$
BEGIN
  -- Analyze all tables
  ANALYZE;
  
  -- Update specific high-traffic tables more frequently
  ANALYZE users;
  ANALYZE projects;
  ANALYZE project_applications;
  ANALYZE payments;
  ANALYZE course_enrollments;
  
  -- Log maintenance activity
  INSERT INTO maintenance_log (activity, completed_at) 
  VALUES ('statistics_update', NOW());
END;
$$ LANGUAGE plpgsql;

-- Schedule daily at 2 AM
SELECT cron.schedule('update-statistics', '0 2 * * *', 'SELECT update_table_statistics();');
```

#### Index Maintenance
```sql
-- Rebuild indexes when needed
CREATE OR REPLACE FUNCTION reindex_large_tables()
RETURNS VOID AS $$
BEGIN
  -- Reindex tables over 1GB
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND pg_total_relation_size(tablename::regclass) > 1073741824
  LOOP
    EXECUTE format('REINDEX TABLE %I', table_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

This comprehensive database design provides a solid foundation for the NAMC NorCal Member Portal, with optimized performance, robust security, and scalable architecture patterns.