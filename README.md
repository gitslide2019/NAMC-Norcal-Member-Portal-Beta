# NAMC NorCal Member Portal

A comprehensive digital platform for minority contractors in Northern California. Connect, grow, and succeed with project opportunities, networking, training, and business tools.

## 🚀 Features

### Core Functionality
- **Project Management**: Access $100M+ in construction opportunities with AI-powered matching
- **Member Directory**: Connect with fellow contractors and industry professionals
- **Event Management**: Register for workshops, conferences, and networking events
- **Learning Management**: Access training courses and certification programs
- **Communication Hub**: Direct messaging and announcement system
- **Business Analytics**: Track performance and growth metrics

### Technical Features
- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma
- **Authentication**: JWT-based auth with role-based access control
- **Database**: PostgreSQL with comprehensive schema for all business needs
- **Real-time Features**: Live notifications and messaging
- **Mobile Responsive**: Optimized for all devices
- **Accessibility**: WCAG 2.1 AA compliant
- **Security**: Government contractor compliance standards

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis (for caching and sessions)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/namc-norcal-portal.git
   cd namc-norcal-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### PostgreSQL Requirements
- PostgreSQL 15.4 or higher
- PostGIS extension (for location-based features)
- Proper indexing for performance

### Database Schema
The application uses a comprehensive schema with the following main entities:

- **Users**: Member profiles, authentication, preferences
- **Projects**: Construction opportunities with requirements
- **Events**: Training, networking, and professional development
- **Messages**: Direct communication between members
- **Courses**: Learning management system
- **Payments**: Financial tracking and Stripe integration
- **Admin Actions**: Complete audit trail for compliance

See `DATABASE_SCHEMA_NAMC_PORTAL.md` for detailed schema documentation.

## 🔧 Configuration

### Environment Variables

#### Required
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `NEXTAUTH_URL`: Application URL

#### Optional (for full functionality)
- `SENDGRID_API_KEY`: Email notifications
- `STRIPE_SECRET_KEY`: Payment processing
- `AWS_*`: File storage
- `OPENAI_API_KEY`: AI features
- `REDIS_URL`: Caching and sessions

### Feature Flags
- `NEXT_PUBLIC_ENABLE_AI_FEATURES`: Enable AI-powered features
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Enable analytics tracking
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS`: Enable push notifications

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── admin/             # Admin panel routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Database client
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── styles/               # Global styles
└── utils/                # Utility functions
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
# Build the image
docker build -t namc-portal .

# Run the container
docker run -p 3000:3000 namc-portal
```

### Environment-Specific Configurations
- **Development**: `npm run dev`
- **Staging**: Use staging environment variables
- **Production**: Use production environment variables

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring & Analytics

### Built-in Monitoring
- Error tracking with Sentry
- Performance monitoring with Datadog
- Database query optimization
- User analytics and engagement tracking

### Health Checks
- Database connectivity
- External service status
- Application performance metrics

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Account lockout protection
- Two-factor authentication support

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Compliance
- WCAG 2.1 AA accessibility
- Government contractor requirements
- Data privacy regulations
- Audit trail maintenance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Follow accessibility guidelines
- Document API changes

## 📚 Documentation

- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Database Design](DATABASE_SCHEMA_NAMC_PORTAL.md)
- [API Documentation](docs/api.md)
- [Component Library](docs/components.md)
- [Deployment Guide](DEPLOYMENT_LAUNCH_CHECKLIST.md)

## 🆘 Support

### Getting Help
- Check the [documentation](docs/)
- Search [existing issues](https://github.com/your-org/namc-norcal-portal/issues)
- Create a [new issue](https://github.com/your-org/namc-norcal-portal/issues/new)

### Contact
- **Technical Support**: tech-support@namc-norcal.org
- **Business Inquiries**: info@namc-norcal.org
- **Emergency**: emergency@namc-norcal.org

## 📄 License

This project is proprietary software owned by NAMC NorCal. All rights reserved.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**NAMC NorCal Member Portal** - Empowering minority contractors to succeed in Northern California's construction industry.