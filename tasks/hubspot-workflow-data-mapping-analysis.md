# HubSpot Workflow Data Requirements Analysis
## Systematic Data Mapping for 12 NAMC HubSpot Workflows

*Complete data requirements, field mappings, and integration specifications for HubSpot automation workflows*

---

## 📊 Executive Summary

This document provides comprehensive data mapping analysis for the 12 HubSpot workflows defined in the automation strategy. Each workflow has been analyzed to identify:

- **Required HubSpot Properties**: Contact, Deal, and Company properties needed
- **Portal Database Mappings**: How existing schema fields map to HubSpot
- **Calculated Fields**: Properties that need computation or aggregation
- **Integration Touchpoints**: Real-time sync requirements and webhook triggers
- **Data Quality Requirements**: Validation rules and completeness standards

---

## 🔄 Workflow-by-Workflow Data Requirements

### **Workflow 1: New Member Onboarding Sequence**

#### **HubSpot Contact Properties Required**
```yaml
Core Properties:
  - email: String (Required)
  - firstname: String (Required)
  - lastname: String (Required)
  - company: String (Required)
  - phone: String
  - jobtitle: String

Custom Properties:
  - member_tier: String (Basic/Premium/Corporate)
  - onboarding_status: String (profile_setup/company_info/benefits_exploration/completed)
  - onboarding_progress_percentage: Number (0-100)
  - member_priority_level: String (new_member/standard/high_value)
  - assigned_staff_member: String
  - trade_specialties: Multi-select (General Contracting/Electrical/Plumbing/HVAC/etc.)
  - member_risk_level: String (low_risk/medium_risk/high_risk/at_risk_intervention)
  - member_engagement_score: Number (0-100)
```

#### **Portal Database Field Mappings**
```yaml
users.email → email
users.firstName → firstname
users.lastName → lastname
users.company → company
users.phone → phone
users.title → jobtitle
users.memberType → member_tier
users.skills (JSON array) → trade_specialties (multi-select)
users.createdAt → member_since
users.membershipExpiresAt → membership_expires_at
```

#### **Calculated Fields & Automation Logic**
```yaml
onboarding_progress_percentage:
  - Calculation: Profile completion score
  - Factors: Basic info (20%), Company details (20%), Skills (20%), Profile image (15%), Bio (15%), Contact preferences (10%)
  - Update trigger: Any profile field change

member_engagement_score:
  - Calculation: Portal activity score
  - Factors: Login frequency (30%), Event attendance (25%), Message activity (20%), Profile completeness (15%), Course enrollment (10%)
  - Update frequency: Daily

assigned_staff_member:
  - Logic: Auto-assign based on trade_specialties
  - Mapping: General → Staff A, Electrical → Staff B, etc.
  - Fallback: Round-robin assignment
```

#### **Timeline Triggers & Data Flow**
```yaml
Day 0 (Immediate):
  - Portal trigger: User.create event
  - HubSpot action: Create contact record
  - Data sync: Basic profile information
  - Task creation: Welcome call task

Day 1-30:
  - Portal monitoring: Profile completion tracking
  - HubSpot updates: onboarding_progress_percentage
  - Branch logic: Based on completion percentage
  - Email triggers: Progress-based communications
```

#### **Integration Requirements**
```yaml
Real-time webhooks:
  - User registration → Create HubSpot contact
  - Profile updates → Update HubSpot properties
  - Login events → Update last_activity_date
  - Skill updates → Update trade_specialties

Data validation:
  - Email format validation
  - Phone number formatting
  - Required field completeness
  - Duplicate prevention logic
```

---

### **Workflow 2: Member Engagement Monitoring**

#### **HubSpot Contact Properties Required**
```yaml
Engagement Tracking:
  - last_portal_login: DateTime
  - portal_login_frequency: Number (logins per month)
  - events_attended_this_year: Number
  - last_event_attendance: DateTime
  - service_utilization_count: Number
  - committee_participation: Multi-select
  - member_engagement_score: Number (0-100)
  - member_risk_level: String
  - at_risk_intervention_date: DateTime
```

#### **Portal Database Field Mappings**
```yaml
users.lastSuccessfulLogin → last_portal_login
eventRegistrations.count(status='ATTENDED') → events_attended_this_year
eventRegistrations.max(event.startDate) → last_event_attendance
projectApplications.count() → service_utilization_count
userRoles.where(role.name LIKE '%committee%') → committee_participation
```

#### **Calculated Engagement Score Algorithm**
```yaml
member_engagement_score:
  formula: |
    login_score = (login_frequency / 4) * 30  // Target: 1x/week
    event_score = (events_attended / 4) * 25  // Target: 1x/quarter
    service_score = (services_used / 2) * 20   // Target: 2x/year
    committee_score = committee_active ? 15 : 0
    profile_score = profile_completeness * 10
    
    total = min(100, login_score + event_score + service_score + committee_score + profile_score)
  
  risk_levels:
    - score >= 70: low_risk
    - score 40-69: medium_risk
    - score 20-39: high_risk
    - score < 20: at_risk_intervention
```

#### **Monitoring & Alert Triggers**
```yaml
Daily checks:
  - Query: users.lastSuccessfulLogin < NOW() - INTERVAL '30 days'
  - Action: Set member_risk_level = 'medium_risk'
  - HubSpot: Create re-engagement task

Weekly assessments:
  - Recalculate engagement scores for all active members
  - Identify score decreases > 20 points
  - Auto-assign intervention tasks for high-risk members

Real-time updates:
  - Portal login → Update last_portal_login
  - Event registration → Update service_utilization_count
  - Committee assignment → Update committee_participation
```

---

### **Workflow 3: Member Renewal Management**

#### **HubSpot Contact & Deal Properties Required**
```yaml
Contact Properties:
  - renewal_date: DateTime
  - membership_tier: String
  - total_member_savings: Currency
  - renewal_status: String (upcoming/contacted/negotiating/renewed/lapsed)
  - payment_history_value: Currency
  - years_as_member: Number
  - lifetime_value: Currency

Deal Properties (Renewal Opportunities):
  - dealname: String ("2024 Membership Renewal - {Company}")
  - dealstage: String (Early Renewal/Discussion/Final Notice/Closed Won/Closed Lost)
  - amount: Currency (membership fee)
  - closedate: DateTime (renewal_date)
  - renewal_risk_score: Number (0-100)
```

#### **Portal Database Field Mappings**
```yaml
users.membershipExpiresAt → renewal_date
users.memberSince → calculate years_as_member
payments.where(type='MEMBERSHIP').sum(amount) → payment_history_value
payments.where(status='COMPLETED').sum(amount) → lifetime_value
membershipTiers.price → deal.amount
```

#### **Member Value Calculation**
```yaml
total_member_savings:
  calculation: |
    project_savings = project_matches * avg_bid_advantage * 0.3  // 30% success rate
    event_savings = (regular_price - member_price) * events_attended
    training_savings = (regular_price - member_price) * courses_taken
    networking_value = connections_made * estimated_value_per_connection
    
    total = project_savings + event_savings + training_savings + networking_value

renewal_risk_score:
  factors:
    - engagement_score (40% weight)
    - payment_history (25% weight)
    - support_ticket_satisfaction (20% weight)
    - value_realization (15% weight)
  
  high_risk_indicators:
    - engagement_score < 40
    - no_event_attendance_6_months
    - multiple_support_complaints
    - low_portal_utilization
```

#### **Timeline-Based Automation**
```yaml
90_days_before:
  - Create renewal deal in HubSpot
  - Set dealstage = "Early Renewal"
  - Generate member value report
  - Schedule staff follow-up task

60_days_before:
  - Send personalized value report
  - Include year-in-review metrics
  - Offer early renewal discount
  - Update dealstage = "Discussion"

30_days_before:
  - Personal outreach from assigned staff
  - Schedule renewal discussion call
  - Send case studies and testimonials
  - Update renewal_status = "negotiating"

15_days_before:
  - Urgent renewal notice if not renewed
  - Create high-priority task
  - Offer payment plan options
  - Set renewal_risk_score = 90

7_days_before:
  - Final renewal notice
  - Executive team involvement
  - Last-chance offers
  - Update dealstage = "Final Notice"

After_renewal_date:
  - If renewed: dealstage = "Closed Won"
  - If not renewed: dealstage = "Closed Lost"
  - Send exit survey for lapsed members
  - Update member status in portal
```

---

### **Workflow 4: Project Opportunity Matching**

#### **HubSpot Deal Properties Required**
```yaml
Project Deal Properties:
  - dealname: String (project title)
  - dealstage: String (New/Matching/Notified/Bidding/Awarded/Closed)
  - amount: Currency (project budget)
  - closedate: DateTime (bid deadline)
  - required_specialties: Multi-select
  - project_location: String
  - service_area_radius: Number (miles)
  - current_capacity_filter: Multi-select (available/limited/full)
  - interest_count: Number
  - qualified_members_count: Number
  - notification_sent_count: Number
```

#### **Portal Database Field Mappings**
```yaml
projects.title → dealname
projects.budgetMin/Max → amount (use average or range)
projects.deadlineDate → closedate
projects.skillsRequired → required_specialties
projects.location → project_location
projects.status → map to dealstage
projectApplications.count() → interest_count
```

#### **Member Matching Algorithm**
```yaml
matching_criteria:
  primary_filters:
    - trade_specialties INTERSECTS required_specialties
    - service_area OVERLAPS project_location (within radius)
    - current_capacity IN ['available', 'limited']
    - member_status = 'active'
  
  scoring_factors:
    - specialty_match_percentage: 40%
    - geographic_proximity: 25%
    - capacity_availability: 20%
    - past_performance: 10%
    - member_tier: 5%
  
  notification_logic:
    - Score >= 80%: Immediate notification
    - Score 60-79%: Include in daily digest
    - Score 40-59%: Weekly opportunity summary
    - Score < 40%: No notification
```

#### **Real-time Integration Flow**
```yaml
project_created_trigger:
  1. Portal webhook → HubSpot deal creation
  2. Run member matching algorithm
  3. Generate qualified_members list
  4. Create notification tasks for staff
  5. Send opportunity emails to matched members
  6. Track opens, clicks, and interest responses

member_interest_expressed:
  1. Portal application submitted
  2. Update interest_count in HubSpot deal
  3. Create follow-up task for staff
  4. Send RFP documents to interested member
  5. Log engagement in member contact record

bid_deadline_management:
  7_days_before:
    - Send reminder to interested members
    - Create status check task
    - Update dealstage = "Bidding"
  
  day_after_deadline:
    - Collect bid outcomes
    - Update dealstage = "Awarded" or "Closed"
    - Follow up on project results
    - Update member performance metrics
```

---

### **Workflow 5: Project Budget Tracking**

#### **HubSpot Deal Properties Required**
```yaml
Budget Tracking Properties:
  - estimated_budget: Currency
  - actual_costs: Currency
  - cost_variance_percentage: Number (-100 to +100)
  - budget_status: String (on_track/over_budget/critical)
  - last_budget_update: DateTime
  - budget_alerts_sent: Number
  - project_profitability: Currency
  - margin_percentage: Number
```

#### **Portal Database Field Mappings**
```yaml
projects.estimatedValue → estimated_budget
projects.budgetMin → minimum_budget
projects.budgetMax → maximum_budget
Custom expense tracking table → actual_costs
Calculate variance → cost_variance_percentage
```

#### **Budget Variance Monitoring**
```yaml
variance_calculation:
  cost_variance_percentage = ((actual_costs - estimated_budget) / estimated_budget) * 100
  
  alert_triggers:
    - variance > 10%: Yellow alert, notify deal owner
    - variance > 20%: Red alert, escalate to management
    - variance > 30%: Critical alert, executive involvement
  
  profitability_tracking:
    project_profitability = estimated_revenue - actual_costs
    margin_percentage = (project_profitability / estimated_revenue) * 100

automated_reporting:
  weekly:
    - Budget status report to stakeholders
    - Variance trend analysis
    - Upcoming budget deadlines
  
  monthly:
    - Financial performance summary
    - Project portfolio health check
    - Cost center analysis
  
  quarterly:
    - Profitability analysis by project type
    - Budget accuracy assessment
    - Process improvement recommendations
```

---

### **Workflow 6: Donor Cultivation Sequence**

#### **HubSpot Contact Properties Required**
```yaml
Donor Properties:
  - donor_level: String (non_donor/bronze/silver/gold/platinum)
  - total_donations: Currency
  - first_donation_date: DateTime
  - last_donation_date: DateTime
  - donation_frequency: String (one_time/quarterly/annual/monthly)
  - preferred_donation_method: String
  - donation_interests: Multi-select (scholarships/events/facilities/programs)
  - stewardship_preference: String (public/private/anonymous)
  - recognition_level: String
```

#### **Portal Database Field Mappings**
```yaml
payments.where(type='DONATION').sum(amount) → total_donations
payments.where(type='DONATION').min(createdAt) → first_donation_date
payments.where(type='DONATION').max(createdAt) → last_donation_date
Calculate from payment history → donation_frequency
Custom donor preferences → stewardship_preference
```

#### **Donor Tier Management**
```yaml
tier_thresholds:
  bronze: $100 - $499
  silver: $500 - $1,999
  gold: $2,000 - $4,999
  platinum: $5,000+

upgrade_opportunity_logic:
  check_conditions:
    - total_donations within 20% of next tier
    - positive engagement in last 6 months
    - no recent upgrade request
  
  trigger_actions:
    - Send upgrade invitation email
    - Create staff task for personal outreach
    - Offer recognition benefits for higher tier
    - Track upgrade success rates

lapse_prevention:
  risk_indicators:
    - no_donation > 18_months
    - decreased_engagement_score
    - no_event_participation
    - unsubscribed_from_communications
  
  intervention_sequence:
    - Re-engagement email series (3 emails over 2 weeks)
    - Personal phone call from development staff
    - Smaller gift opportunity ($25-$50)
    - Survey to understand barriers
```

---

### **Workflow 7: Committee Management**

#### **HubSpot Contact Properties Required**
```yaml
Committee Properties:
  - committee_memberships: Multi-select (Events/Membership/Government Relations/Education)
  - committee_role: String (member/chair/vice_chair/secretary)
  - committee_join_date: DateTime
  - meeting_attendance_rate: Number (0-100%)
  - action_item_completion_rate: Number (0-100%)
  - committee_contribution_score: Number (0-100)
  - leadership_potential: String (low/medium/high)
  - committee_engagement_level: String (inactive/active/highly_engaged)
```

#### **Portal Database Field Mappings**
```yaml
userRoles.where(role.name LIKE '%committee%') → committee_memberships
userRoles.assignedAt → committee_join_date
Custom meeting attendance tracking → meeting_attendance_rate
Custom action item tracking → action_item_completion_rate
```

#### **Committee Engagement Tracking**
```yaml
attendance_calculation:
  meeting_attendance_rate = (meetings_attended / meetings_eligible) * 100
  
  tracking_requirements:
    - Meeting RSVPs in portal
    - Check-in/check-out timestamps
    - Virtual meeting participation logs
    - Make-up session attendance

contribution_scoring:
  factors:
    - meeting_attendance (40%)
    - action_item_completion (30%)
    - initiative_leadership (20%)
    - peer_collaboration (10%)
  
  leadership_potential_indicators:
    - consistent_high_attendance (>80%)
    - proactive_action_item_completion
    - suggests_new_initiatives
    - mentors_new_committee_members
    - receives_positive_peer_feedback

meeting_automation:
  7_days_before:
    - Send agenda and materials
    - Confirm attendance
    - Prepare meeting packets
  
  1_day_before:
    - Send reminder with logistics
    - Share virtual meeting links
    - Confirm catering/setup needs
  
  day_after_meeting:
    - Distribute action items
    - Share meeting minutes
    - Update attendance records
  
  1_week_after:
    - Send action item reminders
    - Check progress on assignments
    - Schedule follow-up meetings if needed
```

---

### **Workflow 8: Fundraising Campaign Automation**

#### **HubSpot Deal Properties Required**
```yaml
Campaign Deal Properties:
  - dealname: String (campaign name)
  - dealstage: String (Planning/Launch/25%/50%/75%/Success/Closed)
  - amount: Currency (fundraising goal)
  - campaign_type: String (annual/capital/special_project/emergency)
  - current_raised: Currency
  - progress_percentage: Number (0-100%)
  - donor_count: Number
  - average_gift_size: Currency
  - campaign_end_date: DateTime
  - days_remaining: Number
```

#### **Portal Database Field Mappings**
```yaml
Custom campaign table → dealname, amount, campaign_end_date
payments.where(campaign_id).sum(amount) → current_raised
payments.where(campaign_id).count(distinct user_id) → donor_count
current_raised / donor_count → average_gift_size
(current_raised / amount) * 100 → progress_percentage
```

#### **Campaign Progress Automation**
```yaml
milestone_triggers:
  25%_milestone:
    - Update dealstage = "25%"
    - Send celebration email to supporters
    - Post social media updates
    - Create momentum-building content
  
  50%_milestone:
    - Update dealstage = "50%"
    - Mid-campaign testimonial push
    - Reach out to major donor prospects
    - Analyze donor demographics
  
  75%_milestone:
    - Update dealstage = "75%"
    - Final push messaging
    - Urgency-based communications
    - Board member personal outreach
  
  100%_milestone:
    - Update dealstage = "Success"
    - Success celebration emails
    - Thank you social media campaign
    - Plan appreciation events

deadline_management:
  30_days_remaining:
    - Intensify email frequency
    - Launch peer-to-peer fundraising
    - Execute media outreach plan
  
  14_days_remaining:
    - Daily progress updates
    - Personal calls to major prospects
    - Urgent appeal to all supporters
  
  7_days_remaining:
    - Final week countdown
    - Last-chance messaging
    - Staff/board all-hands outreach
  
  campaign_end:
    - Final results announcement
    - Comprehensive thank you campaign
    - Impact story development
    - Lessons learned documentation
```

---

### **Workflow 9: Staff Task Management**

#### **HubSpot Task Properties Required**
```yaml
Task Properties:
  - task_type: String (welcome_call/follow_up/renewal/intervention/orientation)
  - priority_level: String (low/medium/high/urgent)
  - assigned_staff_member: String
  - due_date: DateTime
  - completion_status: String (pending/in_progress/completed/overdue)
  - time_to_complete: Number (hours)
  - task_category: String (member_management/project_support/event_planning)
  - related_member_id: String
  - automation_generated: Boolean
```

#### **Portal Database Integration**
```yaml
task_creation_triggers:
  member_risk_level_change:
    - high_risk → urgent follow_up task (due: 24 hours)
    - at_risk_intervention → emergency outreach (due: 4 hours)
  
  member_lifecycle_events:
    - new_member_created → welcome_call (due: 48 hours)
    - renewal_approaching → renewal_discussion (due: varies by timeline)
    - committee_assignment → orientation_scheduling (due: 1 week)
  
  time_based_triggers:
    - no_staff_contact_60_days → check_in task
    - quarterly_review_due → member_portfolio_review
    - annual_assessment → comprehensive_member_evaluation

task_automation_rules:
  risk_based_tasks:
    if member_risk_level == 'high_risk':
      create urgent_follow_up_task
      assign_to: member.assigned_staff_member
      due_date: now() + 24_hours
      priority: urgent
  
  activity_based_tasks:
    if large_donation_received:
      create stewardship_thank_you_call
      assign_to: development_staff
      due_date: now() + 48_hours
      priority: high
  
  workflow_integration:
    - Tasks auto-created by other workflows
    - Task completion triggers next workflow steps
    - Staff performance metrics tracking
    - Workload balancing algorithms
```

---

### **Workflow 10: Administrative Reporting**

#### **HubSpot Reporting Properties & Dashboards Required**
```yaml
Weekly Staff Reports:
  new_members_summary:
    - new_contacts_created (last 7 days)
    - onboarding_completion_rate
    - assigned_staff_workload
  
  at_risk_member_alerts:
    - contacts where member_risk_level IN ['high_risk', 'at_risk_intervention']
    - engagement_score_declines (>20 point drops)
    - overdue_tasks by staff member
  
  committee_activity:
    - meeting_attendance_rates by committee
    - new_committee_assignments
    - action_item_completion_status
  
  fundraising_progress:
    - active_campaigns progress
    - donation_totals by week
    - donor_acquisition_metrics

Monthly Board Reports:
  membership_metrics:
    - total_active_members
    - new_member_acquisition
    - member_retention_rate
    - member_satisfaction_scores
  
  financial_performance:
    - membership_revenue
    - event_revenue
    - donation_totals
    - expense_tracking
  
  engagement_statistics:
    - event_attendance_rates
    - portal_usage_metrics
    - committee_participation
    - course_completion_rates

Quarterly Analytics:
  member_satisfaction:
    - survey_response_rates
    - net_promoter_scores
    - satisfaction_trend_analysis
    - feedback_category_breakdown
  
  program_utilization:
    - service_usage_by_category
    - popular_event_types
    - course_enrollment_trends
    - resource_download_statistics
  
  competitive_analysis:
    - member_retention vs industry
    - pricing_competitiveness
    - service_offering_gaps
    - market_opportunity_assessment
```

---

### **Workflow 11: Service Request Management**

#### **HubSpot Ticket Properties Required**
```yaml
Service Request Properties:
  - ticket_subject: String
  - ticket_content: Text
  - request_type: String (technical_support/business_consulting/legal_advice/networking)
  - priority_level: String (low/medium/high/urgent)
  - status: String (new/assigned/in_progress/resolved/closed)
  - assigned_staff: String
  - requester_contact_id: String
  - created_date: DateTime
  - first_response_time: Number (hours)
  - resolution_time: Number (hours)
  - satisfaction_score: Number (1-5)
  - estimated_member_savings: Currency
```

#### **Portal Database Field Mappings**
```yaml
Custom service_requests table:
  - id → ticket_id
  - user_id → requester_contact_id
  - title → ticket_subject
  - description → ticket_content
  - type → request_type
  - status → status
  - created_at → created_date
  - assigned_to → assigned_staff
```

#### **Service Request Automation**
```yaml
intake_process:
  immediate_actions:
    - Create HubSpot ticket
    - Send acknowledgment email to member
    - Auto-assign based on request_type routing rules
    - Create tracking task with SLA deadline
    - Send intake form if additional info needed
  
  sla_management:
    - technical_support: 4 hours first response, 24 hours resolution
    - business_consulting: 24 hours first response, 5 days resolution
    - legal_advice: 48 hours first response, 10 days resolution
    - networking: 4 hours first response, 2 days resolution

progress_tracking:
  automated_updates:
    - 48_hour_intervals: Progress update to member
    - milestone_completion: Notification with next steps
    - document_sharing: Automated delivery system
    - stakeholder_communication: CC relevant parties
  
  completion_workflow:
    - service_completed → satisfaction survey deployment
    - calculate_member_savings → update total_member_savings
    - generate_success_story → marketing content pipeline
    - schedule_30_day_followup → long-term impact assessment

value_calculation:
  member_savings_formula:
    estimated_savings = service_hours * consultant_rate * discount_factor
    where discount_factor = member_tier_discount (0.5 to 0.8)
  
  success_story_criteria:
    - satisfaction_score >= 4
    - estimated_savings > $1000
    - member_permission for marketing use
    - quantifiable business impact
```

---

### **Workflow 12: Training & Certification Tracking**

#### **HubSpot Contact Properties Required**
```yaml
Learning Properties:
  - courses_completed: Multi-select
  - courses_in_progress: Multi-select
  - learning_path_status: String (not_started/in_progress/completed)
  - total_learning_hours: Number
  - certifications_earned: Multi-select
  - certification_expiration_dates: Text (JSON format)
  - learning_preferences: Multi-select (online/in_person/self_paced/instructor_led)
  - skill_development_goals: Text
  - next_recommended_course: String
  - learning_engagement_score: Number (0-100)
```

#### **Portal Database Field Mappings**
```yaml
courseEnrollments.where(status='COMPLETED') → courses_completed
courseEnrollments.where(status='IN_PROGRESS') → courses_in_progress
courseEnrollments.sum(course.duration) → total_learning_hours (convert to hours)
users.certifications (JSON) → certifications_earned
users.skills → map to relevant certifications
```

#### **Learning Path Automation**
```yaml
course_completion_workflow:
  immediate_actions:
    - Send congratulations email with certificate
    - Update total_learning_hours
    - Assess progress toward certification goals
    - Recommend next course in learning path
    - Update member_engagement_score (+10 points)
  
  certification_achievement:
    - Generate certificate with unique ID
    - Offer LinkedIn badge integration
    - Newsletter and social media recognition
    - Update trade_specialties if applicable
    - Create opportunity_leverage task for staff

learning_recommendation_engine:
  factors:
    - current_skill_gaps (based on trade_specialties)
    - industry_trends (popular courses in member's sector)
    - career_advancement_path (based on title/goals)
    - peer_recommendations (similar member completions)
  
  personalization:
    - learning_style_preferences
    - available_time_commitment
    - budget_considerations
    - prerequisite_completion

continued_learning_automation:
  monthly_communications:
    - New course announcements
    - Industry trend reports
    - Skill gap analysis
    - Group learning opportunities
  
  certification_maintenance:
    - expiration_date_reminders (90, 60, 30 days)
    - renewal_course_recommendations
    - continuing_education_credit_tracking
    - professional_development_planning

engagement_scoring:
  learning_engagement_formula:
    base_score = (courses_completed / member_tenure_years) * 40
    progress_bonus = courses_in_progress * 15
    certification_bonus = certifications_earned * 20
    recency_factor = recent_activity_multiplier (0.5 to 1.5)
    
    final_score = min(100, (base_score + progress_bonus + certification_bonus) * recency_factor)
```

---

## 🔄 Data Flow Analysis

### **Input Data Sources**

#### **Portal Activity Triggers**
```yaml
Real-time Events:
  - User registration/profile updates
  - Portal login/logout events
  - Project applications submitted
  - Event registrations/attendance
  - Course enrollments/completions
  - Payment processing events
  - Message sending/receiving
  - Committee assignments
  - Support request submissions

Batch Processing Events:
  - Daily engagement score calculations
  - Weekly risk level assessments
  - Monthly financial reporting
  - Quarterly satisfaction surveys
```

#### **External Integration Sources**
```yaml
Payment Processors:
  - Stripe webhook events
  - Payment status updates
  - Refund notifications
  - Subscription changes

Email Marketing:
  - Email open/click tracking
  - Unsubscribe events
  - Bounce notifications
  - Campaign performance metrics

Calendar Systems:
  - Meeting attendance tracking
  - Event participation logs
  - Committee meeting records
  - Training session completions
```

### **Data Transformations & Calculations**

#### **Aggregation Requirements**
```yaml
Member Engagement Score:
  - Input: Login frequency, event attendance, portal usage
  - Process: Weighted calculation with time decay
  - Output: 0-100 score updated daily
  - Storage: HubSpot contact property + portal cache

Financial Metrics:
  - Input: Payment records, service usage, event attendance
  - Process: Lifetime value calculation, ROI analysis
  - Output: total_member_savings, lifetime_value
  - Storage: HubSpot contact properties

Project Matching:
  - Input: Member skills, project requirements, geographic data
  - Process: Multi-factor scoring algorithm
  - Output: Ranked list of qualified members
  - Storage: HubSpot deal properties + portal matching cache
```

#### **Real-time vs Batch Processing**
```yaml
Real-time Processing (< 1 minute):
  - User profile updates → HubSpot contact sync
  - Payment confirmations → Deal/contact updates
  - Event registrations → Registration tracking
  - Login events → Last activity updates
  - Support requests → Ticket creation

Near-real-time (5-15 minutes):
  - Engagement score updates (triggered by activity)
  - Risk level assessments (triggered by inactivity)
  - Project matching (triggered by new projects)
  - Committee assignments (triggered by role changes)

Batch Processing (Daily/Weekly/Monthly):
  - Comprehensive engagement score recalculation
  - Financial reporting aggregations
  - Member retention analysis
  - Campaign performance metrics
  - Administrative reporting
```

---

## 🏗️ Custom Property Requirements

### **HubSpot Contact Custom Properties**
```yaml
Member Management:
  - member_tier: Dropdown (Basic/Premium/Corporate)
  - member_since: Date
  - member_priority_level: Dropdown (new_member/standard/high_value)
  - assigned_staff_member: Dropdown (Staff names)
  - member_risk_level: Dropdown (low/medium/high/at_risk_intervention)
  - member_engagement_score: Number (0-100)
  - last_portal_login: DateTime
  - portal_login_frequency: Number
  - total_member_savings: Currency

Professional Information:
  - trade_specialties: Multi-checkbox
  - certifications_earned: Multi-checkbox
  - years_experience: Number
  - license_numbers: Text
  - bonding_capacity: Currency
  - insurance_coverage: Text

Engagement Tracking:
  - events_attended_this_year: Number
  - courses_completed: Multi-checkbox
  - committee_memberships: Multi-checkbox
  - committee_role: Dropdown
  - service_requests_count: Number
  - satisfaction_scores: Text (JSON array)

Renewal Management:
  - renewal_date: Date
  - renewal_status: Dropdown
  - renewal_risk_score: Number (0-100)
  - payment_history_value: Currency
  - lifetime_value: Currency

Communication Preferences:
  - preferred_communication_method: Dropdown
  - notification_preferences: Multi-checkbox
  - marketing_consent: Boolean
  - event_notifications: Boolean
```

### **HubSpot Deal Custom Properties**
```yaml
Project Opportunities:
  - required_specialties: Multi-checkbox
  - project_location: Text
  - service_area_radius: Number
  - interest_count: Number
  - qualified_members_count: Number
  - bid_deadline: Date
  - project_category: Dropdown

Budget Tracking:
  - estimated_budget: Currency
  - actual_costs: Currency
  - cost_variance_percentage: Number
  - budget_status: Dropdown (on_track/over_budget/critical)
  - project_profitability: Currency

Fundraising Campaigns:
  - campaign_type: Dropdown
  - fundraising_goal: Currency
  - current_raised: Currency
  - progress_percentage: Number
  - donor_count: Number
  - campaign_end_date: Date
  - days_remaining: Number

Membership Renewals:
  - renewal_year: Text
  - previous_tier: Dropdown
  - proposed_tier: Dropdown
  - discount_offered: Currency
  - renewal_risk_factors: Multi-checkbox
```

### **HubSpot Company Custom Properties**
```yaml
Organization Details:
  - company_size: Dropdown (1-10/11-50/51-200/200+)
  - primary_industry: Dropdown
  - service_territories: Multi-checkbox
  - licensing_jurisdictions: Multi-checkbox
  - annual_revenue_range: Dropdown

Member Company Analytics:
  - total_employees_as_members: Number
  - company_engagement_score: Number
  - corporate_membership_level: Dropdown
  - group_discount_eligibility: Boolean
  - multi_member_discount: Percentage
```

---

## 🔗 Integration Touchpoints & Webhooks

### **Portal → HubSpot Webhooks**
```yaml
User Management:
  - user.created → Create HubSpot contact
  - user.updated → Update contact properties
  - user.login → Update last_portal_login
  - user.profile_completed → Update onboarding_progress_percentage

Project Management:
  - project.created → Create HubSpot deal (opportunity)
  - project.application_submitted → Update interest_count
  - project.deadline_approaching → Trigger reminder workflow

Event Management:
  - event.registration → Update event attendance tracking
  - event.attendance_confirmed → Update events_attended_this_year
  - event.payment_completed → Update payment history

Financial Transactions:
  - payment.completed → Update lifetime_value, total_donations
  - membership.renewed → Update renewal_date, member_tier
  - donation.received → Update donor_level, last_donation_date

Learning & Development:
  - course.enrolled → Update courses_in_progress
  - course.completed → Update courses_completed, total_learning_hours
  - certification.earned → Update certifications_earned

Communication:
  - message.sent → Update communication_activity
  - support_request.created → Create HubSpot ticket
  - feedback.submitted → Update satisfaction tracking
```

### **HubSpot → Portal Webhooks**
```yaml
Task Management:
  - task.created → Create portal task/reminder
  - task.completed → Update member interaction log
  - workflow.completed → Trigger portal notifications

Email Marketing:
  - email.opened → Update engagement tracking
  - email.clicked → Update member interest indicators
  - email.bounced → Update email deliverability status
  - unsubscribe.event → Update communication preferences

Deal Management:
  - deal.stage_changed → Update project/campaign status in portal
  - deal.closed_won → Trigger success workflows
  - deal.closed_lost → Trigger follow-up sequences

Contact Updates:
  - contact.property_changed → Sync critical updates to portal
  - contact.lifecycle_stage_changed → Update member status
  - contact.list_membership_changed → Update segmentation
```

---

## 📊 Data Quality & Validation

### **Required Validation Rules**

#### **Contact Data Validation**
```yaml
Email Validation:
  - Format: RFC 5322 compliant
  - Deliverability: Real-time validation via API
  - Uniqueness: No duplicate contacts
  - Bounce handling: Automatic cleanup of invalid emails

Phone Number Validation:
  - Format: E.164 international format preferred
  - US numbers: (XXX) XXX-XXXX format
  - Mobile detection: SMS capability identification
  - Do-not-call compliance: Honor opt-out requests

Professional Information:
  - Trade specialties: Must match predefined taxonomy
  - License numbers: Format validation by state
  - Experience years: Reasonable range (0-50 years)
  - Certification dates: Not expired beyond reasonable period
```

#### **Financial Data Validation**
```yaml
Payment Information:
  - Amount validation: Positive numbers only
  - Currency consistency: USD default with conversion rates
  - Payment method validation: Stripe/PayPal compliance
  - Refund processing: Audit trail maintenance

Budget Tracking:
  - Estimate reasonableness: Within industry ranges
  - Variance calculations: Mathematical accuracy
  - Currency precision: 2 decimal places for USD
  - Historical comparison: Trend validation
```

### **Data Completeness Requirements**

#### **Minimum Data for Workflow Activation**
```yaml
New Member Onboarding:
  required_fields:
    - email (validated)
    - first_name
    - last_name
    - company
    - member_tier
  optional_but_recommended:
    - phone
    - trade_specialties
    - years_experience

Project Opportunity Matching:
  required_fields:
    - member.trade_specialties
    - member.service_area
    - member.current_capacity
    - project.required_specialties
    - project.location
  data_quality_threshold: 80% field completion

Renewal Management:
  required_fields:
    - member_since
    - membership_expires_at
    - payment_history (minimum 1 record)
    - engagement_score
  calculated_fields:
    - years_as_member
    - lifetime_value
    - renewal_risk_score
```

### **Error Handling & Fallback Scenarios**

#### **Data Sync Failures**
```yaml
Webhook Failure Handling:
  - Retry logic: Exponential backoff (1, 2, 4, 8 minutes)
  - Maximum retries: 5 attempts
  - Dead letter queue: Manual review after max retries
  - Alert system: Notify technical team of persistent failures

Data Inconsistency Resolution:
  - Conflict detection: Compare timestamps and user actions
  - Master system priority: Portal is source of truth for core data
  - HubSpot priority: Marketing and sales workflow data
  - Manual resolution: Dashboard for data conflicts

Missing Data Handling:
  - Default values: Reasonable defaults for non-critical fields
  - Workflow pausing: Stop automation if critical data missing
  - Data enrichment: Attempt to gather missing information
  - User prompting: Request completion of critical fields
```

### **Data Retention & Archival**

#### **Retention Policies**
```yaml
Active Member Data:
  - Contact information: Retain indefinitely while active
  - Engagement history: 7 years rolling window
  - Financial records: 7 years for tax/audit compliance
  - Communication logs: 3 years for reference

Inactive/Former Member Data:
  - Contact information: 2 years after membership lapse
  - Financial history: 7 years minimum (legal requirement)
  - Marketing data: 1 year after unsubscribe
  - Support tickets: 5 years for pattern analysis

Automated Archival:
  - Monthly process: Archive records based on retention policy
  - Data export: Provide member data export upon request
  - Deletion process: Secure deletion of PII after retention period
  - Compliance reporting: Document data handling for audits
```

---

## 🚀 Implementation Recommendations

### **Phase 1: Foundation (Weeks 1-2)**
1. **Property Creation**: Set up all custom properties in HubSpot
2. **Data Migration**: Import existing member data with mapping
3. **Basic Webhooks**: Implement core user/payment sync
4. **Workflow 1, 2, 9**: New member onboarding and task management

### **Phase 2: Core Workflows (Weeks 3-4)**
1. **Workflows 3, 6**: Renewal management and donor cultivation
2. **Advanced Properties**: Calculated fields and engagement scoring
3. **Email Templates**: Create all required email templates
4. **Reporting Setup**: Basic dashboards and reports

### **Phase 3: Advanced Features (Weeks 5-6)**
1. **Workflows 4, 5**: Project matching and budget tracking
2. **Committee Management**: Workflow 7 implementation
3. **Advanced Reporting**: Comprehensive analytics setup
4. **Integration Testing**: End-to-end workflow validation

### **Phase 4: Full Automation (Weeks 7-8)**
1. **Workflows 8, 11, 12**: Fundraising, service requests, training
2. **Workflow 10**: Administrative reporting automation
3. **Performance Optimization**: Query optimization and caching
4. **Staff Training**: Comprehensive user training program

### **Success Metrics & KPIs**
```yaml
Technical Metrics:
  - Data sync accuracy: >99.5%
  - Webhook success rate: >99%
  - Workflow completion rate: >95%
  - API response time: <2 seconds

Business Metrics:
  - Member onboarding time: <7 days average
  - Engagement score improvement: >20% in first quarter
  - Renewal rate improvement: >10% year-over-year
  - Staff efficiency: >30% reduction in manual tasks
  - Member satisfaction: >4.5/5 average rating
```

This comprehensive data mapping analysis provides the foundation for implementing all 12 HubSpot workflows with proper data architecture, validation, and integration patterns. The systematic approach ensures data quality, workflow reliability, and measurable business outcomes.