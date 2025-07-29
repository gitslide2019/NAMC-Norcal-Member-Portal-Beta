# Getting Started with NAMC NorCal Member Portal

This guide will help you set up the NAMC NorCal Member Portal for local development, including the HubSpot workflow integration system.

## 📋 Prerequisites

### Required Software
- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 15 or higher ([Download](https://postgresql.org/download/))
- **Redis** 7 or higher ([Download](https://redis.io/download))
- **Docker** & Docker Compose ([Download](https://docker.com/get-started))
- **Git** for version control

### Verification Commands
```bash
node --version    # Should be 18.0.0+
npm --version     # Should be 8.0.0+
psql --version    # Should be 15+
redis-cli --version  # Should be 7+
docker --version  # Latest stable
git --version     # Any recent version
```

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/namc-portal.git
cd namc-portal
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Verify installation
npm ls --depth=0
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit configuration
nano .env.local  # or your preferred editor
```

#### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://namc_user:your_password@localhost:5432/namc_portal"

# Security
JWT_SECRET="your-super-secure-jwt-secret-at-least-32-characters-long"
SESSION_SECRET="your-super-secure-session-secret-at-least-32-characters"

# HubSpot Integration
HUBSPOT_API_KEY="your-hubspot-api-key"
HUBSPOT_CLIENT_ID="your-hubspot-client-id"
HUBSPOT_CLIENT_SECRET="your-hubspot-client-secret"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@namcnorcal.org"
SMTP_PASS="your-email-password"
```

### 4. Start Required Services
```bash
# Option A: Using Docker (Recommended)
docker-compose up -d postgres redis

# Option B: Using local installations
# Start PostgreSQL and Redis services manually
```

### 5. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

### 6. Start Development Server
```bash
# Start the development server
npm run dev

# Server will start at http://localhost:3000
```

## 🔧 Development Workflow

### Daily Development
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Start services and dev server
docker-compose up -d postgres redis
npm run dev
```

### Database Operations
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npm run db:studio
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Check test coverage
npm run test:coverage
```

## 🏗️ Project Structure

```
namc-portal/
├── docs/                    # Documentation
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   ├── stores/              # Zustand state stores
│   ├── types/               # TypeScript definitions
│   └── utils/               # Helper functions
├── prisma/                  # Database schema and migrations
├── scripts/                 # Development and deployment scripts
├── public/                  # Static assets
├── tests/                   # Test files
└── docker/                  # Docker configuration
```

### Key Directories
- **`src/app/`** - Next.js 15 App Router pages and API routes
- **`src/components/`** - Reusable React components organized by feature
- **`src/lib/`** - Core utilities (API clients, auth, validation)
- **`src/stores/`** - Zustand stores for state management
- **`src/features/`** - Feature-specific code and components
- **`prisma/`** - Database schema, migrations, and seeding

## 🌐 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript type checking
```

### Database
```bash
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed development data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database (dev only)
```

### Testing
```bash
npm run test         # Run all tests
npm run test:unit    # Run unit tests
npm run test:integration  # Run integration tests
npm run test:e2e     # Run end-to-end tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Quality Assurance
```bash
npm run lint         # Check code style
npm run lint:fix     # Auto-fix linting issues
npm run type-check   # TypeScript validation
npm run test:ci      # Run tests for CI
npm run validate     # Run all quality checks
```

## 🔐 Authentication Setup

### Default Development Accounts
The seeded database includes these test accounts:

**Administrator Account:**
- Email: `admin@namcnorcal.org`
- Password: `admin123`
- Role: Administrator

**Regular Member Account:**
- Email: `john.doe@example.com`
- Password: `member123`
- Role: Regular Member

### Creating New Accounts
1. Visit `http://localhost:3000/register`
2. Fill out the registration form
3. Check console logs for email verification link (development mode)
4. Admin accounts require manual role assignment in database

## 🔌 HubSpot Integration Setup

### 1. HubSpot App Configuration
1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Create a new app or use existing app
3. Configure OAuth settings:
   - Redirect URL: `http://localhost:3000/api/hubspot/callback`
   - Scopes: `contacts`, `automation`, `timeline`

### 2. Environment Variables
Add to your `.env.local`:
```env
HUBSPOT_API_KEY="your-private-app-access-token"
HUBSPOT_CLIENT_ID="your-oauth-app-client-id"
HUBSPOT_CLIENT_SECRET="your-oauth-app-client-secret"
HUBSPOT_PORTAL_ID="your-portal-id"
```

### 3. Webhook Configuration
1. In HubSpot, go to Settings > Integrations > Webhooks
2. Create webhook endpoint: `http://localhost:3000/api/webhooks/hubspot`
3. Select events: Contact creation, Contact property changes, Workflow enrollment
4. Add webhook secret to environment variables

## 📊 Monitoring and Health Checks

### Health Check Endpoint
Visit `http://localhost:3000/api/health` to see application health status:
```json
{
  "status": "healthy",
  "checks": {
    "database": {"status": "pass"},
    "redis": {"status": "pass"},
    "hubspot": {"status": "pass"},
    "filesystem": {"status": "pass"}
  }
}
```

### Development Tools
- **Prisma Studio**: `http://localhost:5555` (when running)
- **Next.js Dev Tools**: Built into development server
- **React DevTools**: Browser extension for React debugging

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Verify connection settings
psql $DATABASE_URL
```

#### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis if needed
brew services start redis  # macOS
sudo systemctl start redis # Linux
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Node Version Issues
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Verify version
node --version
```

### Performance Issues
- **Slow Database**: Check PostgreSQL logs and query performance
- **High Memory Usage**: Monitor with `htop` or Activity Monitor
- **Build Errors**: Clear `.next` directory and `node_modules`, reinstall

### Getting Help
- Check [Troubleshooting Guide](./troubleshooting/README.md)
- Review error logs in `logs/` directory
- Check GitHub Issues for known problems
- Use `npm run validate` to check overall system health

## 🎯 Next Steps

After completing setup:

1. **Explore the Application**
   - Log in with default accounts
   - Create test events and messages
   - Test member registration flow

2. **Review Documentation**
   - [Architecture Overview](./architecture/README.md)
   - [API Documentation](./api/README.md)
   - [HubSpot Integration](./hubspot/README.md)

3. **Development Workflow**
   - [Development Guidelines](./development/README.md)
   - [Testing Strategy](./testing/README.md)
   - [Contributing Guide](./contributing.md)

4. **Production Deployment**
   - [Deployment Guide](./deployment/README.md)
   - [Security Best Practices](./security/README.md)
   - [Monitoring Setup](./monitoring/README.md)

---

**Need Help?** Check our [Troubleshooting Guide](./troubleshooting/README.md) or create an issue in the repository.