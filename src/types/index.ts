// Core types based on Prisma schema
export type MemberType = 'REGULAR' | 'admin'

export type ProjectStatus = 
  | 'DRAFT' 
  | 'PUBLISHED' 
  | 'BIDDING_OPEN' 
  | 'BIDDING_CLOSED' 
  | 'AWARDED' 
  | 'COMPLETED' 
  | 'CANCELLED'

export type ProjectCategory = 
  | 'RESIDENTIAL' 
  | 'COMMERCIAL' 
  | 'INFRASTRUCTURE' 
  | 'RENOVATION' 
  | 'NEW_CONSTRUCTION' 
  | 'MAINTENANCE' 
  | 'SPECIALTY'

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type ProjectVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'INVITE_ONLY' | 'PRIVATE'

export type EventStatus = 
  | 'DRAFT' 
  | 'PUBLISHED' 
  | 'REGISTRATION_OPEN' 
  | 'REGISTRATION_CLOSED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED'

export type EventType = 
  | 'NETWORKING' 
  | 'TRAINING' 
  | 'CONFERENCE' 
  | 'WORKSHOP' 
  | 'MEETING' 
  | 'AWARDS' 
  | 'FUNDRAISER'

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'ARCHIVED'

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

export type PaymentType = 'MEMBERSHIP' | 'EVENT_REGISTRATION' | 'SPONSORSHIP' | 'DONATION' | 'TRAINING'

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type CourseEnrollmentStatus = 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED'

export type AdminActionType = 
  | 'USER_CREATED' 
  | 'USER_UPDATED' 
  | 'USER_DELETED' 
  | 'PROJECT_CREATED' 
  | 'PROJECT_UPDATED' 
  | 'PROJECT_DELETED' 
  | 'EVENT_CREATED' 
  | 'EVENT_UPDATED' 
  | 'EVENT_DELETED' 
  | 'PAYMENT_PROCESSED' 
  | 'MEMBERSHIP_RENEWED' 
  | 'SYSTEM_CONFIG_CHANGED'

// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  title?: string
  phone?: string
  address?: any
  city?: string
  state?: string
  zipCode?: string
  coordinates?: any
  memberType: MemberType
  memberSince: Date
  membershipExpiresAt?: Date
  isActive: boolean
  isVerified: boolean
  profileImage?: string
  bio?: string
  website?: string
  linkedin?: string
  twitter?: string
  skills: string[]
  certifications?: any
  languages: string[]
  failedLoginAttempts: number
  lockedUntil?: Date
  lastFailedLogin?: Date
  lastSuccessfulLogin?: Date
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  notificationPreferences?: any
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  createdById?: string
  updatedById?: string
}

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
  title?: string
  phone?: string
  memberType?: MemberType
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  company?: string
  title?: string
  phone?: string
  bio?: string
  website?: string
  linkedin?: string
  twitter?: string
  skills?: string[]
  certifications?: any
  languages?: string[]
  notificationPreferences?: any
}

// Project types
export interface Project {
  id: string
  externalId?: string
  source: string
  title: string
  description: string
  category: ProjectCategory
  subcategory?: string
  sector: string[]
  budgetMin?: number
  budgetMax?: number
  estimatedValue?: number
  fundingSource?: string
  location?: string
  coordinates?: any
  serviceArea?: any
  address?: any
  startDate?: Date
  endDate?: Date
  deadlineDate?: Date
  estimatedDuration?: number
  requirements: string[]
  skillsRequired: string[]
  certificationsRequired?: any
  experienceRequired: number
  bondingRequired: boolean
  insuranceRequired?: any
  status: ProjectStatus
  priority: ProjectPriority
  visibility: ProjectVisibility
  maxApplications?: number
  applicationCount: number
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  organization?: string
  keywords: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  closedAt?: Date
  deletedAt?: Date
  createdById: string
  updatedById?: string
}

export interface CreateProjectData {
  title: string
  description: string
  category: ProjectCategory
  subcategory?: string
  sector?: string[]
  budgetMin?: number
  budgetMax?: number
  estimatedValue?: number
  fundingSource?: string
  location?: string
  coordinates?: any
  serviceArea?: any
  address?: any
  startDate?: Date
  endDate?: Date
  deadlineDate?: Date
  estimatedDuration?: number
  requirements?: string[]
  skillsRequired?: string[]
  certificationsRequired?: any
  experienceRequired?: number
  bondingRequired?: boolean
  insuranceRequired?: any
  priority?: ProjectPriority
  visibility?: ProjectVisibility
  maxApplications?: number
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  organization?: string
  keywords?: string[]
}

// Event types
export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  status: EventStatus
  startDate: Date
  endDate: Date
  registrationDeadline?: Date
  maxCapacity?: number
  currentCapacity: number
  location?: string
  address?: any
  coordinates?: any
  isVirtual: boolean
  virtualUrl?: string
  price: number
  memberPrice?: number
  earlyBirdPrice?: number
  earlyBirdDeadline?: Date
  agenda?: any
  speakers?: any
  sponsors?: any
  materials?: any
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  deletedAt?: Date
  createdById: string
  updatedById?: string
}

export interface CreateEventData {
  title: string
  description: string
  type: EventType
  startDate: Date
  endDate: Date
  registrationDeadline?: Date
  maxCapacity?: number
  location?: string
  address?: any
  coordinates?: any
  isVirtual?: boolean
  virtualUrl?: string
  price?: number
  memberPrice?: number
  earlyBirdPrice?: number
  earlyBirdDeadline?: Date
  agenda?: any
  speakers?: any
  sponsors?: any
  materials?: any
}

// Message types
export interface Message {
  id: string
  senderId: string
  receiverId: string
  subject?: string
  content: string
  status: MessageStatus
  readAt?: Date
  sentAt: Date
}

export interface CreateMessageData {
  receiverId: string
  subject?: string
  content: string
}

// Payment types
export interface Payment {
  id: string
  userId: string
  type: PaymentType
  status: PaymentStatus
  amount: number
  currency: string
  description?: string
  referenceId?: string
  stripePaymentId?: string
  stripeCustomerId?: string
  createdAt: Date
  processedAt?: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  company?: string
  title?: string
  phone?: string
  acceptTerms: boolean
}

// Dashboard types
export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalProjects: number
  activeProjects: number
  totalEvents: number
  upcomingEvents: number
  totalRevenue: number
  monthlyRevenue: number
}

export interface UserDashboardData {
  user: User
  stats: {
    projectsApplied: number
    eventsAttended: number
    coursesEnrolled: number
    messagesUnread: number
  }
  recentProjects: Project[]
  upcomingEvents: Event[]
  recentMessages: Message[]
}

// Search and filter types
export interface ProjectFilters {
  category?: ProjectCategory
  status?: ProjectStatus
  budgetMin?: number
  budgetMax?: number
  location?: string
  skills?: string[]
  search?: string
}

export interface UserFilters {
  memberType?: MemberType
  company?: string
  skills?: string[]
  location?: string
  search?: string
}

// Notification types
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  data?: any
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  memberType: MemberType
  isActive: boolean
  isVerified: boolean
}

export interface Session {
  user: AuthUser
  expires: string
}

// File upload types
export interface FileUpload {
  id: string
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  uploadedAt: Date
  uploadedBy: string
}

// Analytics types
export interface AnalyticsData {
  period: string
  metrics: {
    [key: string]: number
  }
  trends: {
    [key: string]: {
      current: number
      previous: number
      change: number
    }
  }
} 