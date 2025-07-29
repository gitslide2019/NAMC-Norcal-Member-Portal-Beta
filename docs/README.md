# NAMC NorCal Member Portal - Documentation

Welcome to the comprehensive documentation for the Northern California chapter of the National Association of Minority Contractors (NAMC) member portal with HubSpot workflow integration.

## 🚀 Quick Start

- [**Getting Started**](./getting-started.md) - Setup and installation guide
- [**API Reference**](./api/README.md) - Complete API documentation
- [**HubSpot Integration**](./hubspot/README.md) - Workflow integration guide
- [**Deployment Guide**](./deployment/README.md) - Multi-environment deployment
- [**Development**](./development/README.md) - Developer guidelines and workflows

## 📚 Documentation Structure

### Core Documentation
- [`getting-started.md`](./getting-started.md) - Project setup and local development
- [`architecture.md`](./architecture/README.md) - System architecture and design decisions
- [`database.md`](./database/README.md) - Database schema and migrations
- [`security.md`](./security/README.md) - Security implementation and best practices

### Feature Documentation
- [`hubspot/`](./hubspot/) - HubSpot workflow integration
- [`workflow-management/`](./workflow-management/) - Workflow system features
- [`member-management/`](./member-management/) - Member portal features
- [`notifications/`](./notifications/) - Notification system

### Development Guides
- [`development/`](./development/) - Developer guidelines and workflows
- [`testing/`](./testing/) - Testing strategies and implementation
- [`deployment/`](./deployment/) - Deployment and DevOps procedures
- [`troubleshooting/`](./troubleshooting/) - Common issues and solutions

### API Documentation
- [`api/`](./api/) - Complete REST API reference
- [`api/auth.md`](./api/auth.md) - Authentication and authorization
- [`api/webhooks.md`](./api/webhooks.md) - Webhook endpoints and integration
- [`api/workflows.md`](./api/workflows.md) - Workflow management endpoints

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: Zustand 4.5.0
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL 15 with Prisma 6.1.0 ORM
- **Caching**: Redis 7
- **Authentication**: JWT with bcrypt
- **File Storage**: Local filesystem with configurable paths

### Integrations
- **HubSpot**: Workflow automation and CRM integration
- **Email**: SMTP with configurable providers
- **Maps**: Google Maps API for location services
- **Testing**: Jest, React Testing Library, Playwright

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana, Loki
- **Reverse Proxy**: Traefik with Let's Encrypt

## 🎯 Key Features

### Member Portal
- **User Management**: Registration, profiles, role-based access
- **Event Management**: Create, manage, and register for events
- **Messaging**: Direct messaging between members
- **Resource Sharing**: File uploads and document management
- **Announcements**: Admin broadcasts and notifications

### HubSpot Integration
- **Workflow Automation**: Automated member onboarding and engagement
- **Contact Synchronization**: Bi-directional contact management
- **Event Tracking**: Automated event participation tracking
- **Lead Management**: Prospect conversion workflows
- **Analytics**: Integration with HubSpot reporting

### Administration
- **Admin Dashboard**: Member management and system oversight
- **Audit Logging**: Comprehensive action tracking
- **Configuration**: Environment-specific settings
- **Monitoring**: Health checks and performance metrics
- **Backup**: Automated database and file backups

## 📋 Prerequisites

### Development Environment
- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 15 or higher
- **Redis**: 7 or higher
- **Docker**: Latest stable version
- **Git**: Version control

### External Services
- **HubSpot Account**: With API access and workflow capabilities
- **SMTP Provider**: For email notifications
- **Domain**: For production deployment
- **SSL Certificate**: For HTTPS in production

## 🚀 Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/namc-portal.git
   cd namc-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start services**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Setup database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the application.

## 📖 Learning Path

### For Developers
1. Read [Getting Started](./getting-started.md)
2. Review [Architecture Overview](./architecture/README.md)
3. Explore [Development Guidelines](./development/README.md)
4. Study [API Documentation](./api/README.md)
5. Practice with [Testing Guide](./testing/README.md)

### For Administrators
1. Review [Deployment Guide](./deployment/README.md)
2. Study [Security Documentation](./security/README.md)
3. Learn [Monitoring Setup](./monitoring/README.md)
4. Practice [Troubleshooting](./troubleshooting/README.md)

### For Integrators
1. Study [HubSpot Integration](./hubspot/README.md)
2. Review [Webhook Documentation](./api/webhooks.md)
3. Explore [Workflow System](./workflow-management/README.md)
4. Practice [Testing Integration](./testing/integration.md)

## 🤝 Contributing

Please read our [Contributing Guidelines](./contributing.md) before submitting pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js rules
- **Formatting**: Prettier for consistent style
- **Testing**: Jest and Playwright for comprehensive coverage
- **Documentation**: JSDoc for all public APIs

## 📞 Support

- **Documentation**: Check relevant documentation sections
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Security**: Email security@namcnorcal.org for security issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔄 Updates

This documentation is maintained alongside the codebase. For the latest updates:
- Check the [CHANGELOG](../CHANGELOG.md)
- Review recent [releases](https://github.com/your-org/namc-portal/releases)
- Follow development in [GitHub Discussions](https://github.com/your-org/namc-portal/discussions)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainers**: NAMC NorCal Development Team