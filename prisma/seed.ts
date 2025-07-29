import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting minimal database seed for authentication testing...')

  // Create basic roles
  console.log('Creating basic roles...')
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System administrator with full access',
    },
  })

  const memberRole = await prisma.role.upsert({
    where: { name: 'member' },
    update: {},
    create: {
      name: 'member',
      description: 'Regular NAMC member',
    },
  })

  // Create demo users
  console.log('Creating demo users...')
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
      skills: '["Project Management", "System Administration", "Business Development"]',
      languages: '["English"]',
    },
  })

  // Assign admin role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  // Regular member
  const memberUser = await prisma.user.upsert({
    where: { email: 'maria.johnson@example.com' },
    update: {},
    create: {
      email: 'maria.johnson@example.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Johnson',
      company: 'Johnson Construction',
      title: 'Owner',
      phone: '+1-555-0124',
      memberType: 'REGULAR',
      isActive: true,
      isVerified: true,
      skills: '["Residential Construction", "Project Management", "Green Building"]',
      languages: '["English"]',
    },
  })

  // Assign member role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: memberUser.id, roleId: memberRole.id } },
    update: {},
    create: {
      userId: memberUser.id,
      roleId: memberRole.id,
    },
  })

  // Create a sample project for testing
  const existingProject = await prisma.project.findFirst({
    where: { title: 'Downtown Office Renovation' }
  })
  
  if (!existingProject) {
    await prisma.project.create({
      data: {
        title: 'Downtown Office Renovation',
        description: 'Complete renovation of a 50,000 sq ft office complex.',
        category: 'COMMERCIAL',
        budgetMin: 2500000,
        budgetMax: 3500000,
        location: 'San Francisco, CA',
        status: 'BIDDING_OPEN',
        createdById: adminUser.id,
      },
    })
  }

  // Create a sample event for testing
  const existingEvent = await prisma.event.findFirst({
    where: { title: 'NAMC NorCal Annual Conference 2025' }
  })
  
  if (!existingEvent) {
    await prisma.event.create({
      data: {
        title: 'NAMC NorCal Annual Conference 2025',
        description: 'Join us for our biggest event of the year!',
        type: 'CONFERENCE',
        startDate: new Date('2025-03-15T09:00:00Z'),
        endDate: new Date('2025-03-16T17:00:00Z'),
        location: 'San Francisco Marriott Marquis',
        maxCapacity: 300,
        price: 299,
        memberPrice: 199,
        status: 'REGISTRATION_OPEN',
        createdById: adminUser.id,
      },
    })
  }

  console.log('✅ Minimal database seeding completed successfully!')
  console.log('\n📋 Demo Data Created:')
  console.log('- 2 Roles (admin, member)')
  console.log('- 2 Demo Users')
  console.log('- 1 Sample Project')
  console.log('- 1 Sample Event')
  console.log('\n🔑 Demo Login Credentials:')
  console.log('Admin: admin@namc-norcal.org / password123')
  console.log('Member: maria.johnson@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })