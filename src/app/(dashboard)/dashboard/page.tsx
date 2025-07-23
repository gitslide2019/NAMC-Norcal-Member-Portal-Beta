'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DynamicIcon, usePreloadIcons, DASHBOARD_ICONS } from '@/components/ui/dynamic-icon'
import { 
  ProjectMetricCard, 
  EventAttendanceCard, 
  MessageMetricCard, 
  CourseProgressCard 
} from '@/components/ui/business-metric-card'

// Mock data - in real app, this would come from API
const mockStats = {
  projectsApplied: 8,
  eventsAttended: 12,
  coursesEnrolled: 3,
  messagesUnread: 5,
}

const mockRecentProjects = [
  {
    id: '1',
    title: 'Oakland Bay Bridge Maintenance',
    category: 'INFRASTRUCTURE',
    budget: '$2.5M - $3.2M',
    deadline: '2024-02-15',
    status: 'BIDDING_OPEN',
    location: 'Oakland, CA',
  },
  {
    id: '2',
    title: 'San Francisco Housing Development',
    category: 'RESIDENTIAL',
    budget: '$15M - $20M',
    deadline: '2024-02-20',
    status: 'BIDDING_OPEN',
    location: 'San Francisco, CA',
  },
  {
    id: '3',
    title: 'Community Center Renovation',
    category: 'RENOVATION',
    budget: '$800K - $1.2M',
    deadline: '2024-02-10',
    status: 'BIDDING_OPEN',
    location: 'Berkeley, CA',
  },
]

const mockUpcomingEvents = [
  {
    id: '1',
    title: 'NAMC NorCal Networking Mixer',
    type: 'NETWORKING',
    date: '2024-02-08',
    time: '6:00 PM',
    location: 'San Francisco, CA',
    registeredCount: 45,
    maxCapacity: 60,
  },
  {
    id: '2',
    title: 'Construction Safety Training',
    type: 'TRAINING',
    date: '2024-02-12',
    time: '9:00 AM',
    location: 'Oakland, CA',
    registeredCount: 28,
    maxCapacity: 30,
  },
  {
    id: '3',
    title: 'Green Building Certification Workshop',
    type: 'WORKSHOP',
    date: '2024-02-15',
    time: '10:00 AM',
    location: 'San Jose, CA',
    registeredCount: 22,
    maxCapacity: 25,
  },
]

const mockRecentMessages = [
  {
    id: '1',
    sender: 'Maria Rodriguez',
    subject: 'Partnership Opportunity',
    preview: 'Hi! I saw your profile and would love to discuss a potential partnership...',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '2',
    sender: 'NAMC Admin',
    subject: 'New Project Opportunity',
    preview: 'A new project matching your skills has been posted...',
    time: '5 hours ago',
    unread: true,
  },
  {
    id: '3',
    sender: 'David Chen',
    subject: 'Event Follow-up',
    preview: 'Thanks for attending the networking event. Here are the contacts...',
    time: '1 day ago',
    unread: false,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  
  // Preload dashboard icons for better performance
  usePreloadIcons(DASHBOARD_ICONS)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-namc-blue-100 text-lg">
          Here's what's happening in your NAMC NorCal community today.
        </p>
      </div>

      {/* Enhanced Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProjectMetricCard
          projectsApplied={mockStats.projectsApplied}
          weeklyChange={2}
          variant="elevated"
          description="Government and private sector opportunities"
        />
        
        <EventAttendanceCard
          eventsAttended={mockStats.eventsAttended}
          attendanceRank={10}
          variant="elevated"
          description="Networking and professional development"
        />
        
        <CourseProgressCard
          coursesEnrolled={mockStats.coursesEnrolled}
          coursesInProgress={2}
          completionRate={75}
          variant="elevated"
          description="Professional certification programs"
        />
        
        <MessageMetricCard
          unreadCount={mockStats.messagesUnread}
          variant="elevated"
          description="Business communications and opportunities"
          href="/messages"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Project Opportunities</CardTitle>
                  <CardDescription>
                    New projects that match your profile and skills
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/projects">
                    View All
                    <DynamicIcon name="ArrowRight" className="w-4 h-4 ml-2" size={16} />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentProjects.map((project) => (
                <div key={project.id} className="border border-namc-gray-200 rounded-lg p-4 hover:bg-namc-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-namc-gray-900">{project.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {project.category}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-namc-gray-600">
                    <div className="flex items-center">
                      <DynamicIcon name="DollarSign" className="w-4 h-4 mr-2" size={16} />
                      {project.budget}
                    </div>
                    <div className="flex items-center">
                      <DynamicIcon name="MapPin" className="w-4 h-4 mr-2" size={16} />
                      {project.location}
                    </div>
                    <div className="flex items-center">
                      <DynamicIcon name="Clock" className="w-4 h-4 mr-2" size={16} />
                      Deadline: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className="bg-namc-green-100 text-namc-green-700"
                    >
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events">
                    <DynamicIcon name="Plus" className="w-4 h-4" size={16} />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUpcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-namc-blue-500 pl-4">
                  <h4 className="font-medium text-namc-gray-900 text-sm">{event.title}</h4>
                  <p className="text-xs text-namc-gray-600 mt-1">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </p>
                  <p className="text-xs text-namc-gray-500">
                    {event.registeredCount}/{event.maxCapacity} registered
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Messages</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/messages">
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRecentMessages.map((message) => (
                <div key={message.id} className={`p-3 rounded-lg border ${
                  message.unread ? 'bg-namc-blue-50 border-namc-blue-200' : 'bg-white border-namc-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm text-namc-gray-900">{message.sender}</h4>
                    <span className="text-xs text-namc-gray-500">{message.time}</span>
                  </div>
                  <h5 className="font-medium text-sm text-namc-gray-800 mb-1">{message.subject}</h5>
                  <p className="text-xs text-namc-gray-600 line-clamp-2">{message.preview}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts to help you get things done faster
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/projects/new">
                <DynamicIcon name="Building2" className="w-6 h-6 mb-2" size={24} />
                Post a Project
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/events">
                <DynamicIcon name="Calendar" className="w-6 h-6 mb-2" size={24} />
                Register for Event
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/directory">
                <DynamicIcon name="Users" className="w-6 h-6 mb-2" size={24} />
                Find Members
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}