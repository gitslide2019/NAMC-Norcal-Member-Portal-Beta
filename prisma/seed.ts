import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create system roles
  console.log('Creating system roles...')
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System administrator with full access',
      isSystemRole: true,
    },
  })

  const memberRole = await prisma.role.upsert({
    where: { name: 'member' },
    update: {},
    create: {
      name: 'member',
      description: 'Regular NAMC member',
      isSystemRole: true,
    },
  })

  const committeeRole = await prisma.role.upsert({
    where: { name: 'committee' },
    update: {},
    create: {
      name: 'committee',
      description: 'Committee member with limited admin access',
      isSystemRole: true,
    },
  })

  // Create system permissions
  console.log('Creating system permissions...')
  const permissions = [
    // User management
    { name: 'user:read', description: 'Read user profiles', resource: 'user', action: 'read' },
    { name: 'user:create', description: 'Create new users', resource: 'user', action: 'create' },
    { name: 'user:update', description: 'Update user profiles', resource: 'user', action: 'update' },
    { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
    
    // Project management
    { name: 'project:read', description: 'Read projects', resource: 'project', action: 'read' },
    { name: 'project:create', description: 'Create projects', resource: 'project', action: 'create' },
    { name: 'project:update', description: 'Update projects', resource: 'project', action: 'update' },
    { name: 'project:delete', description: 'Delete projects', resource: 'project', action: 'delete' },
    { name: 'project:apply', description: 'Apply to projects', resource: 'project', action: 'apply' },
    
    // Event management
    { name: 'event:read', description: 'Read events', resource: 'event', action: 'read' },
    { name: 'event:create', description: 'Create events', resource: 'event', action: 'create' },
    { name: 'event:update', description: 'Update events', resource: 'event', action: 'update' },
    { name: 'event:delete', description: 'Delete events', resource: 'event', action: 'delete' },
    { name: 'event:register', description: 'Register for events', resource: 'event', action: 'register' },
    
    // Course management
    { name: 'course:read', description: 'Read courses', resource: 'course', action: 'read' },
    { name: 'course:create', description: 'Create courses', resource: 'course', action: 'create' },
    { name: 'course:update', description: 'Update courses', resource: 'course', action: 'update' },
    { name: 'course:delete', description: 'Delete courses', resource: 'course', action: 'delete' },
    { name: 'course:enroll', description: 'Enroll in courses', resource: 'course', action: 'enroll' },
    
    // Messaging
    { name: 'message:read', description: 'Read messages', resource: 'message', action: 'read' },
    { name: 'message:send', description: 'Send messages', resource: 'message', action: 'send' },
    
    // Announcements
    { name: 'announcement:read', description: 'Read announcements', resource: 'announcement', action: 'read' },
    { name: 'announcement:create', description: 'Create announcements', resource: 'announcement', action: 'create' },
    { name: 'announcement:update', description: 'Update announcements', resource: 'announcement', action: 'update' },
    { name: 'announcement:delete', description: 'Delete announcements', resource: 'announcement', action: 'delete' },
    
    // Admin actions
    { name: 'admin:read', description: 'Read admin actions', resource: 'admin', action: 'read' },
    { name: 'admin:create', description: 'Create admin actions', resource: 'admin', action: 'create' },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: {
        ...permission,
        isSystemPermission: true,
      },
    })
  }

  // Assign permissions to roles
  console.log('Assigning permissions to roles...')
  
  // Admin gets all permissions
  const allPermissions = await prisma.permission.findMany()
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Member gets basic permissions
  const memberPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'user:read',
          'project:read',
          'project:apply',
          'event:read',
          'event:register',
          'course:read',
          'course:enroll',
          'message:read',
          'message:send',
          'announcement:read',
        ],
      },
    },
  })

  for (const permission of memberPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: memberRole.id, permissionId: permission.id } },
      update: {},
      create: {
        roleId: memberRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Committee gets member permissions plus some admin
  const committeePermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: [
          'user:read',
          'project:read',
          'project:create',
          'project:update',
          'project:apply',
          'event:read',
          'event:create',
          'event:update',
          'event:register',
          'course:read',
          'course:enroll',
          'message:read',
          'message:send',
          'announcement:read',
          'announcement:create',
          'announcement:update',
          'admin:read',
        ],
      },
    },
  })

  for (const permission of committeePermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: committeeRole.id, permissionId: permission.id } },
      update: {},
      create: {
        roleId: committeeRole.id,
        permissionId: permission.id,
      },
    })
  }

  // Create sample users
  console.log('Creating sample users...')
  
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@namc-norcal.org' },
    update: {},
    create: {
      email: 'admin@namc-norcal.org',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      company: 'NAMC NorCal',
      title: 'System Administrator',
      phone: '+1-555-0123',
      memberType: 'admin',
      isActive: true,
      isVerified: true,
      skills: ['Project Management', 'System Administration', 'Business Development'],
      languages: ['English'],
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
        marketing: true,
        project_alerts: true,
        event_reminders: true,
      },
    },
  })

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
      assignedBy: adminUser.id,
    },
  })

  // Sample member users
  const sampleMembers = [
    {
      email: 'maria.johnson@example.com',
      firstName: 'Maria',
      lastName: 'Johnson',
      company: 'Johnson Construction',
      title: 'Owner',
      phone: '+1-555-0124',
      skills: ['Residential Construction', 'Project Management', 'Green Building'],
    },
    {
      email: 'carlos.santos@example.com',
      firstName: 'Carlos',
      lastName: 'Santos',
      company: 'Santos Builders',
      title: 'President',
      phone: '+1-555-0125',
      skills: ['Commercial Construction', 'Estimating', 'Safety Management'],
    },
    {
      email: 'lisa.washington@example.com',
      firstName: 'Lisa',
      lastName: 'Washington',
      company: 'Washington Contracting',
      title: 'CEO',
      phone: '+1-555-0126',
      skills: ['Infrastructure', 'Heavy Construction', 'Team Leadership'],
    },
  ]

  for (const memberData of sampleMembers) {
    const member = await prisma.user.upsert({
      where: { email: memberData.email },
      update: {},
      create: {
        ...memberData,
        password: hashedPassword,
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true,
        skills: memberData.skills,
        languages: ['English'],
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
          marketing: true,
          project_alerts: true,
          event_reminders: true,
        },
      },
    })

    // Assign member role
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: member.id, roleId: memberRole.id } },
      update: {},
      create: {
        userId: member.id,
        roleId: memberRole.id,
        assignedBy: adminUser.id,
      },
    })
  }

  // Create sample projects
  console.log('Creating sample projects...')
  const sampleProjects = [
    {
      title: 'Downtown Office Complex Renovation',
      description: 'Complete renovation of a 50,000 sq ft office complex in downtown San Francisco. Includes HVAC upgrades, electrical work, and interior finishes.',
      category: 'COMMERCIAL',
      subcategory: 'Office Renovation',
      sector: ['Commercial', 'Renovation'],
      budgetMin: 2500000,
      budgetMax: 3500000,
      location: 'San Francisco, CA',
      requirements: ['General Contractor License', 'Bonding Capacity', 'Safety Certification'],
      skillsRequired: ['Project Management', 'HVAC', 'Electrical', 'Interior Finishes'],
      experienceRequired: 5,
      bondingRequired: true,
      status: 'BIDDING_OPEN',
      priority: 'HIGH',
      visibility: 'PUBLIC',
      maxApplications: 10,
      deadlineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      title: 'Affordable Housing Development',
      description: 'Construction of 120-unit affordable housing complex in Oakland. Includes site preparation, foundation, framing, and all finishes.',
      category: 'RESIDENTIAL',
      subcategory: 'Multi-Family',
      sector: ['Residential', 'Affordable Housing'],
      budgetMin: 15000000,
      budgetMax: 20000000,
      location: 'Oakland, CA',
      requirements: ['General Contractor License', 'DBE Certification', 'Bonding Capacity'],
      skillsRequired: ['Multi-Family Construction', 'Site Development', 'Project Management'],
      experienceRequired: 8,
      bondingRequired: true,
      status: 'PUBLISHED',
      priority: 'URGENT',
      visibility: 'MEMBERS_ONLY',
      maxApplications: 15,
      deadlineDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
    {
      title: 'Highway Bridge Maintenance',
      description: 'Maintenance and repair work on major highway bridge. Includes structural repairs, painting, and safety improvements.',
      category: 'INFRASTRUCTURE',
      subcategory: 'Bridge Maintenance',
      sector: ['Infrastructure', 'Transportation'],
      budgetMin: 800000,
      budgetMax: 1200000,
      location: 'Sacramento, CA',
      requirements: ['Caltrans Prequalification', 'Bridge Safety Certification', 'Bonding Capacity'],
      skillsRequired: ['Bridge Construction', 'Structural Engineering', 'Safety Management'],
      experienceRequired: 10,
      bondingRequired: true,
      status: 'BIDDING_OPEN',
      priority: 'MEDIUM',
      visibility: 'PUBLIC',
      maxApplications: 8,
      deadlineDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    },
  ]

  for (const projectData of sampleProjects) {
    await prisma.project.upsert({
      where: { title: projectData.title },
      update: {},
      create: {
        ...projectData,
        createdById: adminUser.id,
        keywords: [
          projectData.category.toLowerCase(),
          projectData.subcategory?.toLowerCase(),
          ...projectData.sector.map(s => s.toLowerCase()),
          ...projectData.skillsRequired.map(s => s.toLowerCase()),
        ].filter(Boolean),
      },
    })
  }

  // Create sample events
  console.log('Creating sample events...')
  const sampleEvents = [
    {
      title: 'NAMC NorCal Annual Conference 2025',
      description: 'Join us for our biggest event of the year! Network with industry leaders, attend workshops, and discover new opportunities.',
      type: 'CONFERENCE',
      startDate: new Date('2025-03-15T09:00:00Z'),
      endDate: new Date('2025-03-16T17:00:00Z'),
      registrationDeadline: new Date('2025-03-10T23:59:59Z'),
      maxCapacity: 300,
      location: 'San Francisco Marriott Marquis',
      address: {
        street: '780 Mission St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
      },
      price: 299,
      memberPrice: 199,
      earlyBirdPrice: 149,
      earlyBirdDeadline: new Date('2025-02-15T23:59:59Z'),
      status: 'REGISTRATION_OPEN',
    },
    {
      title: 'Project Management Best Practices Workshop',
      description: 'Learn proven project management techniques for construction projects. Includes hands-on exercises and case studies.',
      type: 'WORKSHOP',
      startDate: new Date('2025-01-25T09:00:00Z'),
      endDate: new Date('2025-01-25T17:00:00Z'),
      registrationDeadline: new Date('2025-01-20T23:59:59Z'),
      maxCapacity: 50,
      location: 'NAMC NorCal Training Center',
      address: {
        street: '123 Business Ave',
        city: 'Oakland',
        state: 'CA',
        zip: '94601',
      },
      price: 150,
      memberPrice: 100,
      status: 'REGISTRATION_OPEN',
    },
    {
      title: 'Networking Mixer - East Bay',
      description: 'Connect with fellow contractors and industry professionals in the East Bay area. Light refreshments provided.',
      type: 'NETWORKING',
      startDate: new Date('2025-02-08T18:00:00Z'),
      endDate: new Date('2025-02-08T21:00:00Z'),
      registrationDeadline: new Date('2025-02-05T23:59:59Z'),
      maxCapacity: 100,
      location: 'Oakland Chamber of Commerce',
      address: {
        street: '475 14th St',
        city: 'Oakland',
        state: 'CA',
        zip: '94612',
      },
      price: 25,
      memberPrice: 15,
      status: 'REGISTRATION_OPEN',
    },
  ]

  for (const eventData of sampleEvents) {
    await prisma.event.upsert({
      where: { title: eventData.title },
      update: {},
      create: {
        ...eventData,
        createdById: adminUser.id,
      },
    })
  }

  // Create sample courses
  console.log('Creating sample courses...')
  const sampleCourses = [
    {
      title: 'Construction Safety Fundamentals',
      description: 'Essential safety training for construction professionals. Covers OSHA requirements, hazard identification, and safety protocols.',
      status: 'PUBLISHED',
      duration: 240, // 4 hours
      difficulty: 'BEGINNER',
      category: 'Safety',
      tags: ['Safety', 'OSHA', 'Training', 'Compliance'],
      price: 200,
      memberPrice: 150,
      requirements: ['None'],
      objectives: [
        'Understand OSHA safety requirements',
        'Identify common construction hazards',
        'Implement safety protocols',
        'Maintain safety documentation',
      ],
    },
    {
      title: 'Advanced Project Management',
      description: 'Advanced techniques for managing complex construction projects. Includes scheduling, budgeting, and team management.',
      status: 'PUBLISHED',
      duration: 480, // 8 hours
      difficulty: 'ADVANCED',
      category: 'Management',
      tags: ['Project Management', 'Leadership', 'Scheduling', 'Budgeting'],
      price: 400,
      memberPrice: 300,
      requirements: ['Basic project management experience'],
      objectives: [
        'Master advanced scheduling techniques',
        'Develop comprehensive budgets',
        'Lead project teams effectively',
        'Manage project risks',
      ],
    },
  ]

  for (const courseData of sampleCourses) {
    await prisma.course.upsert({
      where: { title: courseData.title },
      update: {},
      create: {
        ...courseData,
        modules: [
          {
            title: 'Introduction',
            duration: 30,
            content: 'Course overview and objectives',
          },
          {
            title: 'Core Concepts',
            duration: courseData.duration - 60,
            content: 'Main course content and exercises',
          },
          {
            title: 'Assessment',
            duration: 30,
            content: 'Final assessment and certification',
          },
        ],
      },
    })
  }

  // Create sample announcements
  console.log('Creating sample announcements...')
  const sampleAnnouncements = [
    {
      title: 'Welcome to NAMC NorCal Member Portal!',
      content: 'We are excited to launch our new digital platform. This portal will help you connect with opportunities, network with fellow contractors, and grow your business.',
      targetAudience: 'ALL',
      isUrgent: false,
    },
    {
      title: 'New Project Opportunities Available',
      content: 'Several new construction projects have been posted to the portal. Log in to view details and submit your applications.',
      targetAudience: 'REGULAR',
      isUrgent: true,
    },
    {
      title: 'Annual Conference Registration Now Open',
      content: 'Registration for our 2025 Annual Conference is now open. Early bird pricing available until February 15th.',
      targetAudience: 'ALL',
      isUrgent: false,
    },
  ]

  for (const announcementData of sampleAnnouncements) {
    await prisma.announcement.upsert({
      where: { title: announcementData.title },
      update: {},
      create: {
        ...announcementData,
        senderId: adminUser.id,
      },
    })
  }

  // Create sample membership tiers
  console.log('Creating sample membership tiers...')
  const sampleTiers = [
    {
      name: 'Basic Membership',
      description: 'Essential membership for new contractors',
      price: 250,
      duration: 12, // 12 months
      benefits: [
        'Access to project opportunities',
        'Member directory access',
        'Event registration',
        'Basic training courses',
      ],
    },
    {
      name: 'Professional Membership',
      description: 'Enhanced membership for established contractors',
      price: 500,
      duration: 12,
      benefits: [
        'All Basic benefits',
        'Priority project notifications',
        'Advanced training courses',
        'Mentorship program access',
        'Networking event discounts',
      ],
    },
    {
      name: 'Premium Membership',
      description: 'Comprehensive membership for growing businesses',
      price: 1000,
      duration: 12,
      benefits: [
        'All Professional benefits',
        'Exclusive project opportunities',
        'One-on-one business consulting',
        'Custom training programs',
        'Conference registration included',
      ],
    },
  ]

  for (const tierData of sampleTiers) {
    await prisma.membershipTier.upsert({
      where: { name: tierData.name },
      update: {},
      create: tierData,
    })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📋 Sample Data Created:')
  console.log('- 3 System Roles (admin, member, committee)')
  console.log('- 25 System Permissions')
  console.log('- 1 Admin User (admin@namc-norcal.org)')
  console.log('- 3 Sample Member Users')
  console.log('- 3 Sample Projects')
  console.log('- 3 Sample Events')
  console.log('- 2 Sample Courses')
  console.log('- 3 Sample Announcements')
  console.log('- 3 Membership Tiers')
  console.log('\n🔑 Default Login Credentials:')
  console.log('Email: admin@namc-norcal.org')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 