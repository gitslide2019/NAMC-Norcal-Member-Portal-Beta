'use client'

import { useAuth } from '@/hooks/useAuth'
import { AdminRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

// Mock data - in real app, this would come from API
const mockAdminStats = {
  totalMembers: 245,
  activeProjects: 18,
  pendingApplications: 7,
  upcomingEvents: 4,
  monthlyRevenue: 15750,
  systemHealth: 98.5,
}

const mockRecentActivity = [
  {
    id: '1',
    type: 'MEMBER_REGISTRATION',
    description: 'New member Maria Rodriguez registered',
    timestamp: '2 hours ago',
    icon: 'UserPlus',
  },
  {
    id: '2',
    type: 'PROJECT_SUBMITTED',
    description: 'Oakland Bridge Maintenance project submitted for approval',
    timestamp: '4 hours ago',
    icon: 'Building2',
  },
  {
    id: '3',
    type: 'EVENT_CREATED',
    description: 'Safety Training Workshop scheduled for Feb 15',
    timestamp: '6 hours ago',
    icon: 'Calendar',
  },
  {
    id: '4',
    type: 'PAYMENT_RECEIVED',
    description: 'Annual membership payment from Johnson Construction',
    timestamp: '8 hours ago',
    icon: 'DollarSign',
  },
]

const mockSystemAlerts = [
  {
    id: '1',
    level: 'WARNING',
    message: 'Database backup scheduled maintenance in 2 hours',
    timestamp: '30 minutes ago',
  },
  {
    id: '2',
    level: 'INFO',
    message: 'Monthly newsletter sent to 245 members successfully',
    timestamp: '2 hours ago',
  },
  {
    id: '3',
    level: 'SUCCESS',
    message: 'HubSpot TECH integration sync completed',
    timestamp: '4 hours ago',
  },
]

const quickActions = [
  {
    name: 'Add New Member',
    description: 'Register a new member manually',
    href: '/admin/members/new',
    icon: 'UserPlus',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'Create Project',
    description: 'Post a new project opportunity',
    href: '/admin/projects/new',
    icon: 'Building2',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    name: 'Schedule Event',
    description: 'Create a new networking event',
    href: '/admin/events/new',
    icon: 'Calendar',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    name: 'Send Announcement',
    description: 'Broadcast message to all members',
    href: '/admin/announcements/new',
    icon: 'Megaphone',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
]

function getAlertColor(level: string): string {
  switch (level) {
    case 'ERROR':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'INFO':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'SUCCESS':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <AdminRequiredRoute>
      <div className="min-h-screen bg-namc-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-namc-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-namc-gray-900">Admin Dashboard</h1>
                <p className="text-namc-gray-600">Welcome back, {user?.firstName}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <DynamicIcon name="Download" className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button size="sm">
                  <DynamicIcon name="Settings" className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{mockAdminStats.totalMembers}</p>
                  </div>
                  <DynamicIcon name="Users" className="h-8 w-8 text-namc-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <DynamicIcon name="TrendingUp" className="w-4 h-4 mr-1" />
                  <span>+12 this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{mockAdminStats.activeProjects}</p>
                  </div>
                  <DynamicIcon name="Building2" className="h-8 w-8 text-namc-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-namc-gray-600">
                  <span>5 awaiting approval</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Pending Apps</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{mockAdminStats.pendingApplications}</p>
                  </div>
                  <DynamicIcon name="Clock" className="h-8 w-8 text-namc-yellow-600" />
                </div>
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    <Link href="/admin/applications">Review</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Upcoming Events</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{mockAdminStats.upcomingEvents}</p>
                  </div>
                  <DynamicIcon name="Calendar" className="h-8 w-8 text-namc-purple-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-namc-gray-600">
                  <span>Next: Safety Training</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-namc-gray-900">
                      ${mockAdminStats.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <DynamicIcon name="DollarSign" className="h-8 w-8 text-namc-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <DynamicIcon name="TrendingUp" className="w-4 h-4 mr-1" />
                  <span>+8.3% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">System Health</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{mockAdminStats.systemHealth}%</p>
                  </div>
                  <DynamicIcon name="Activity" className="h-8 w-8 text-namc-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <span>All systems operational</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-namc-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Card key={action.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <DynamicIcon name={action.icon as any} className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-namc-gray-900">{action.name}</h3>
                        <p className="text-sm text-namc-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions and events in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-namc-blue-100 rounded-full flex items-center justify-center">
                            <DynamicIcon 
                              name={activity.icon as any} 
                              className="w-4 h-4 text-namc-blue-600" 
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-namc-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-namc-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      <Link href="/admin/activity">View All Activity</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Alerts */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Important system notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockSystemAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-3 rounded-lg border ${getAlertColor(alert.level)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <p className="text-xs mt-1 opacity-75">{alert.timestamp}</p>
                          </div>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {alert.level}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Link href="/admin/alerts">View All Alerts</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* TECH Integration Status */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>TECH Integration</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </CardTitle>
                  <CardDescription>HubSpot TECH Clean California program status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-namc-gray-600">Last Sync</span>
                      <span className="text-sm font-medium text-namc-gray-900">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-namc-gray-600">Enrolled Contractors</span>
                      <span className="text-sm font-medium text-namc-gray-900">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-namc-gray-600">Active Projects</span>
                      <span className="text-sm font-medium text-namc-gray-900">8</span>
                    </div>
                    <div className="pt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        <Link href="/admin/tech">Manage TECH Program</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminRequiredRoute>
  )
}