# NAMC Portal Implementation Guide

## 📋 Overview

This comprehensive implementation guide provides step-by-step instructions for building the NAMC NorCal Member Portal, including development setup, deployment strategies, testing protocols, and maintenance procedures.

## 🚀 Quick Start Guide

### Prerequisites

**System Requirements:**
- Node.js 18.0.0 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher
- Git 2.30 or higher
- Docker and Docker Compose (for development)

**Development Tools:**
- VS Code with recommended extensions:
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### Initial Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/namc-norcal/member-portal.git
cd member-portal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database and API keys

# 4. Start development services
docker-compose up -d  # PostgreSQL, Redis

# 5. Initialize database
npm run db:generate
npm run db:migrate
npm run db:seed

# 6. Start development server
npm run dev
```

**Verification:**
- Open http://localhost:3000
- Login with demo credentials: admin@namc-norcal.org / admin123
- Verify all features load correctly

## 🏗️ Development Environment Setup

### 1. Database Configuration

**PostgreSQL Setup:**
```bash
# Using Docker (recommended for development)
docker run --name namc-postgres \
  -e POSTGRES_DB=namc_portal \
  -e POSTGRES_USER=namc_user \
  -e POSTGRES_PASSWORD=secure_password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Enable PostGIS extension
docker exec -it namc-postgres psql -U namc_user -d namc_portal
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**Environment Configuration:**
```env
# .env.local
DATABASE_URL="postgresql://namc_user:secure_password@localhost:5432/namc_portal"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secure-jwt-secret-key-here"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# External Services
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
SENDGRID_API_KEY="SG...."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."

# File Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-west-2"
AWS_S3_BUCKET="namc-portal-files"
```

### 2. Development Workflow

**Code Organization:**
```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected member area
│   ├── admin/             # Admin interface
│   ├── api/               # API endpoints
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── lib/                   # Utility libraries
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
└── design-system/         # Design tokens and utilities
```

**Git Workflow:**
```bash
# Feature development workflow
git checkout -b feature/user-registration
# Make changes
git add .
git commit -m "feat: implement user registration with email verification"
git push origin feature/user-registration
# Create pull request

# Commit message format
# type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore
```

### 3. Code Quality Standards

**ESLint Configuration (.eslintrc.json):**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

**TypeScript Configuration (tsconfig.json):**
```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🔧 Feature Implementation Guide

### 1. Authentication System Implementation

**JWT Service Implementation:**
```typescript
// src/lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET!
  private static JWT_EXPIRES_IN = '7d'
  
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }
  
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
  
  static generateToken(payload: any): string {
    return jwt.sign(payload, this.JWT_SECRET, { 
      expiresIn: this.JWT_EXPIRES_IN 
    })
  }
  
  static verifyToken(token: string): any {
    return jwt.verify(token, this.JWT_SECRET)
  }
  
  static async authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { userRoles: { include: { role: true } } }
    })
    
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials')
    }
    
    // Check for account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account is temporarily locked')
    }
    
    const isValid = await this.comparePassword(password, user.password)
    
    if (!isValid) {
      // Increment failed attempts
      await this.handleFailedLogin(user.id)
      throw new Error('Invalid credentials')
    }
    
    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastSuccessfulLogin: new Date()
      }
    })
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      memberType: user.memberType,
      roles: user.userRoles.map(ur => ur.role.name)
    }
  }
  
  private static async handleFailedLogin(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true }
    })
    
    const attempts = (user?.failedLoginAttempts || 0) + 1
    const lockUntil = attempts >= 5 ? 
      new Date(Date.now() + 15 * 60 * 1000) : // 15 minutes
      null
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: lockUntil,
        lastFailedLogin: new Date()
      }
    })
  }
}
```

**API Route Implementation:**
```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)
    
    const user = await AuthService.authenticateUser(email, password)
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      memberType: user.memberType
    })
    
    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      data: { user, token },
      message: 'Login successful'
    })
    
    response.cookies.set('namc-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: error instanceof Error ? error.message : 'Login failed'
      }
    }, { status: 401 })
  }
}
```

### 2. Database Integration Patterns

**Prisma Service Layer:**
```typescript
// src/lib/services/user.service.ts
import { prisma } from '@/lib/prisma'
import { Prisma, User } from '@prisma/client'

export class UserService {
  static async createUser(userData: Prisma.UserCreateInput): Promise<User> {
    return prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: userData
      })
      
      // Assign default role
      const defaultRole = await tx.role.findUnique({
        where: { name: 'MEMBER' }
      })
      
      if (defaultRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id
          }
        })
      }
      
      // Log admin action
      await tx.adminAction.create({
        data: {
          action: 'USER_CREATED',
          userId: userData.createdById || 'system',
          targetUserId: user.id,
          details: `User ${user.email} created`
        }
      })
      
      return user
    })
  }
  
  static async getUsersWithPagination(params: {
    page: number
    limit: number
    search?: string
    memberType?: string
  }) {
    const { page, limit, search, memberType } = params
    const skip = (page - 1) * limit
    
    const where: Prisma.UserWhereInput = {
      AND: [
        { isActive: true },
        memberType ? { memberType: memberType as any } : {},
        search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } }
          ]
        } : {}
      ]
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userRoles: {
            include: { role: true }
          },
          _count: {
            select: {
              projectApplications: true,
              eventRegistrations: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  }
}
```

### 3. Real-time Features Implementation

**WebSocket Setup:**
```typescript
// src/lib/websocket.ts
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { AuthService } from './auth'

export function initializeWebSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST']
    }
  })
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      const user = AuthService.verifyToken(token)
      socket.userId = user.userId
      socket.userEmail = user.email
      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })
  
  io.on('connection', (socket) => {
    console.log(`User ${socket.userEmail} connected`)
    
    // Join user-specific room
    socket.join(`user:${socket.userId}`)
    
    // Handle message sending
    socket.on('send_message', async (data) => {
      try {
        const message = await createMessage({
          senderId: socket.userId,
          receiverId: data.receiverId,
          content: data.content,
          subject: data.subject
        })
        
        // Send to recipient
        socket.to(`user:${data.receiverId}`).emit('new_message', message)
        
        // Confirm to sender
        socket.emit('message_sent', { messageId: message.id })
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' })
      }
    })
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userEmail} disconnected`)
    })
  })
  
  return io
}

// Notification service
export class NotificationService {
  private static io: SocketIOServer
  
  static setIO(io: SocketIOServer) {
    this.io = io
  }
  
  static async notifyUser(userId: string, notification: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification', notification)
    }
  }
  
  static async broadcastAnnouncement(announcement: any) {
    if (this.io) {
      this.io.emit('announcement', announcement)
    }
  }
}
```

## 🧪 Testing Strategy

### 1. Unit Testing Setup

**Jest Configuration (jest.config.js):**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Test Utilities:**
```typescript
// src/__tests__/utils/test-utils.tsx
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/auth'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: any
}

export function renderWithProviders(
  ui: React.ReactElement,
  { user, ...renderOptions }: CustomRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    )
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  memberType: 'REGULAR',
  isActive: true,
  ...overrides
})

export const createMockProject = (overrides = {}) => ({
  id: 'proj_123',
  title: 'Test Project',
  description: 'Test project description',
  category: 'COMMERCIAL',
  status: 'PUBLISHED',
  budgetMin: 100000,
  budgetMax: 200000,
  ...overrides
})
```

**Component Testing Example:**
```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('shows loading state', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('applies correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600')
  })
})
```

### 2. Integration Testing

**API Route Testing:**
```typescript
// src/app/api/auth/login/__tests__/route.test.ts
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { AuthService } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma')

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('returns user data on successful login', async () => {
    const mockUser = {
      id: 'user_123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      memberType: 'REGULAR'
    }
    
    ;(AuthService.authenticateUser as jest.Mock).mockResolvedValue(mockUser)
    ;(AuthService.generateToken as jest.Mock).mockReturnValue('mock_token')
    
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.user).toEqual(mockUser)
    expect(data.data.token).toBe('mock_token')
  })
  
  it('returns error on invalid credentials', async () => {
    ;(AuthService.authenticateUser as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    )
    
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong_password'
      })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('AUTHENTICATION_FAILED')
  })
})
```

### 3. End-to-End Testing

**Playwright Configuration:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**E2E Test Example:**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.fill('[data-testid=email-input]', 'admin@namc-norcal.org')
    await page.fill('[data-testid=password-input]', 'admin123')
    await page.click('[data-testid=login-button]')
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid=user-menu]')).toBeVisible()
  })
  
  test('displays error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid=email-input]', 'test@example.com')
    await page.fill('[data-testid=password-input]', 'wrongpassword')
    await page.click('[data-testid=login-button]')
    
    await expect(page.locator('[data-testid=error-message]')).toBeVisible()
    await expect(page.locator('[data-testid=error-message]')).toContainText('Invalid credentials')
  })
})

test.describe('Member Registration', () => {
  test('new user can register successfully', async ({ page }) => {
    await page.goto('/register')
    
    // Fill registration form
    await page.fill('[data-testid=first-name-input]', 'John')
    await page.fill('[data-testid=last-name-input]', 'Doe')
    await page.fill('[data-testid=email-input]', 'john.doe@example.com')
    await page.fill('[data-testid=phone-input]', '(555) 123-4567')
    await page.fill('[data-testid=company-input]', 'ABC Construction')
    await page.fill('[data-testid=password-input]', 'SecurePass123!')
    await page.fill('[data-testid=confirm-password-input]', 'SecurePass123!')
    await page.check('[data-testid=terms-checkbox]')
    
    await page.click('[data-testid=register-button]')
    
    // Verify success message
    await expect(page.locator('[data-testid=success-message]')).toBeVisible()
    await expect(page.locator('[data-testid=success-message]')).toContainText('Registration successful')
  })
})
```

## 🚀 Deployment Guide

### 1. Production Environment Setup

**Docker Configuration:**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Docker Compose for Production:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-extensions.sql:/docker-entrypoint-initdb.d/init-extensions.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 2. CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run type check
        run: npm run type-check
        
      - name: Run linting
        run: npm run lint
        
      - name: Generate Prisma client
        run: npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run unit tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run E2E tests
        run: npx playwright test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          # e.g., deploy to Vercel, AWS, or your preferred platform
          echo "Deploying to production..."
```

### 3. Environment-Specific Configurations

**Production Environment Variables:**
```env
# Production .env
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:secure_pass@prod-db:5432/namc_portal"
REDIS_URL="redis://prod-redis:6379"
JWT_SECRET="ultra-secure-production-jwt-secret"

# External Services
STRIPE_SECRET_KEY="sk_live_..."
SENDGRID_API_KEY="SG.live..."
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="namc-portal-production"

# Security
CORS_ORIGIN="https://portal.namc-norcal.org"
ALLOWED_HOSTS="portal.namc-norcal.org,api.namc-norcal.org"

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
LOG_LEVEL="warn"
```

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

**Health Check Endpoint:**
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks = await Promise.allSettled([
    // Database connectivity
    prisma.$queryRaw`SELECT 1`,
    
    // Redis connectivity
    // redis.ping(),
    
    // External service checks
    fetch('https://api.stripe.com/v1/charges', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    }),
  ])
  
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      redis: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      stripe: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    },
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  }
  
  const isHealthy = Object.values(healthStatus.checks).every(status => status === 'healthy')
  
  return NextResponse.json(healthStatus, {
    status: isHealthy ? 200 : 503
  })
}
```

### 2. Performance Monitoring

**Metrics Collection:**
```typescript
// src/lib/metrics.ts
import { prisma } from './prisma'

export class MetricsCollector {
  static async recordMetric(
    metric: string, 
    value: number, 
    metadata?: Record<string, any>
  ) {
    await prisma.systemMetric.create({
      data: {
        metric,
        value,
        metadata,
        recordedAt: new Date()
      }
    })
  }
  
  static async trackPageView(page: string, userId?: string) {
    await this.recordMetric('page_view', 1, {
      page,
      userId,
      timestamp: Date.now()
    })
  }
  
  static async trackUserAction(action: string, userId: string, metadata?: any) {
    await this.recordMetric('user_action', 1, {
      action,
      userId,
      ...metadata
    })
  }
  
  static async getMetrics(metric: string, since: Date) {
    return prisma.systemMetric.findMany({
      where: {
        metric,
        recordedAt: { gte: since }
      },
      orderBy: { recordedAt: 'desc' }
    })
  }
}
```

### 3. Error Handling & Logging

**Global Error Handler:**
```typescript
// src/lib/error-handler.ts
import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public metadata?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      error: {
        code: error.code || 'APPLICATION_ERROR',
        message: error.message,
        metadata: error.metadata
      }
    }, { status: error.statusCode })
  }
  
  if (error instanceof Error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'An internal error occurred' 
          : error.message
      }
    }, { status: 500 })
  }
  
  return NextResponse.json({
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred'
    }
  }, { status: 500 })
}
```

## 📋 Final Implementation Checklist

### Development Checklist
- [ ] **Environment Setup**: Local development environment configured
- [ ] **Database**: PostgreSQL with PostGIS extensions installed
- [ ] **Authentication**: JWT-based auth system implemented
- [ ] **API Routes**: RESTful API endpoints created
- [ ] **Frontend Components**: UI components with design variants
- [ ] **Real-time Features**: WebSocket integration for live updates
- [ ] **File Upload**: AWS S3 integration for file storage
- [ ] **Payment Processing**: Stripe integration configured
- [ ] **Email System**: SendGrid/SES integration
- [ ] **Search**: Full-text search implementation

### Testing Checklist
- [ ] **Unit Tests**: 80%+ code coverage achieved
- [ ] **Integration Tests**: API endpoints tested
- [ ] **E2E Tests**: Critical user flows covered
- [ ] **Accessibility Tests**: WCAG 2.1 AA compliance verified
- [ ] **Performance Tests**: Load testing completed
- [ ] **Security Tests**: Vulnerability scanning performed

### Deployment Checklist
- [ ] **Production Environment**: Server infrastructure configured
- [ ] **Database Migration**: Production database setup
- [ ] **Environment Variables**: All secrets configured
- [ ] **SSL Certificates**: HTTPS enabled
- [ ] **Domain Configuration**: DNS records configured
- [ ] **Monitoring**: Health checks and alerts configured
- [ ] **Backup Strategy**: Automated backups enabled
- [ ] **CI/CD Pipeline**: Automated deployment configured

### Security Checklist
- [ ] **Authentication Security**: JWT tokens, password hashing
- [ ] **Authorization**: Role-based access control
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Rate Limiting**: API rate limiting implemented
- [ ] **CORS Policy**: Proper CORS configuration
- [ ] **Data Encryption**: Sensitive data encrypted
- [ ] **Audit Logging**: All admin actions logged
- [ ] **Security Headers**: Proper HTTP security headers

### Performance Checklist
- [ ] **Database Optimization**: Indexes and query optimization
- [ ] **Caching Strategy**: Multi-layer caching implemented
- [ ] **CDN Configuration**: Static assets served from CDN
- [ ] **Image Optimization**: Responsive images with Next.js
- [ ] **Bundle Optimization**: Code splitting and lazy loading
- [ ] **Monitoring**: Performance metrics collection

---

*This implementation guide provides comprehensive instructions for building, testing, and deploying the NAMC portal. Follow the checklist systematically to ensure a successful launch with high quality and security standards.*