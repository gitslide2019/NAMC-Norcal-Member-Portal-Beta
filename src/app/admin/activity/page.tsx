'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import Link from 'next/link'

// Mock data - in real app, this would come from API
const mockActivities = [
  {
    id: '1',
    type: 'MEMBER_REGISTRATION',
    description: 'New member Maria Rodriguez registered with Premium membership',
    timestamp: '2024-01-15T14:30:00Z',
    user: 'maria.rodriguez@example.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      membershipType: 'PREMIUM',
      company: 'Rodriguez Construction LLC',
      paymentAmount: 299
    }
  },
  {
    id: '2',
    type: 'PROJECT_SUBMITTED',
    description: 'Oakland Bridge Maintenance project submitted for approval',
    timestamp: '2024-01-15T10:15:00Z',
    user: 'admin@namcnorcal.org',
    ipAddress: '10.0.0.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      projectTitle: 'Oakland Bridge Maintenance',
      budget: 2500000,
      category: 'INFRASTRUCTURE'
    }
  },
  {
    id: '3',
    type: 'EVENT_CREATED',
    description: 'Safety Training Workshop scheduled for February 15, 2024',
    timestamp: '2024-01-15T09:45:00Z',
    user: 'admin@namcnorcal.org',
    ipAddress: '10.0.0.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      eventTitle: 'Safety Training Workshop',
      eventDate: '2024-02-15',
      location: 'NAMC NorCal Office',
      maxCapacity: 50
    }
  },
  {
    id: '4',
    type: 'PAYMENT_RECEIVED',
    description: 'Annual membership payment received from Johnson Construction',
    timestamp: '2024-01-15T08:20:00Z',
    user: 'accounting@namcnorcal.org',
    ipAddress: '10.0.0.8',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      amount: 299,
      company: 'Johnson Construction',
      paymentMethod: 'Credit Card',
      membershipPeriod: '2024-2025'
    }
  },
  {
    id: '5',
    type: 'LOGIN_SUCCESS',
    description: 'User john.smith@example.com logged in successfully',
    timestamp: '2024-01-15T07:30:00Z',
    user: 'john.smith@example.com',
    ipAddress: '192.168.1.150',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    details: {
      loginMethod: 'Email/Password',
      deviceType: 'Mobile'
    }
  },
  {
    id: '6',
    type: 'PROFILE_UPDATE',
    description: 'User sarah.wilson@example.com updated their profile information',
    timestamp: '2024-01-15T06:45:00Z',
    user: 'sarah.wilson@example.com',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      fieldsUpdated: ['phone', 'company', 'title'],
      previousCompany: 'Old Construction LLC',
      newCompany: 'Wilson Building Solutions'
    }
  },
  {
    id: '7',
    type: 'LOGIN_FAILED',
    description: 'Failed login attempt for user test@example.com',
    timestamp: '2024-01-15T05:15:00Z',
    user: 'test@example.com',
    ipAddress: '203.0.113.10',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    details: {
      reason: 'Invalid password',
      attemptCount: 3
    }
  },
  {
    id: '8',
    type: 'MESSAGE_SENT',
    description: 'Message sent from admin to all premium members',
    timestamp: '2024-01-14T16:30:00Z',
    user: 'admin@namcnorcal.org',
    ipAddress: '10.0.0.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: {
      messageType: 'ANNOUNCEMENT',
      recipientCount: 156,
      subject: 'New Safety Training Requirements'
    }
  }
]

const activityTypes = [
  { value: 'all', label: 'All Activities' },
  { value: 'MEMBER_REGISTRATION', label: 'Member Registration' },
  { value: 'LOGIN_SUCCESS', label: 'Successful Logins' },
  { value: 'LOGIN_FAILED', label: 'Failed Logins' },
  { value: 'PROFILE_UPDATE', label: 'Profile Updates' },
  { value: 'PROJECT_SUBMITTED', label: 'Project Submissions' },
  { value: 'EVENT_CREATED', label: 'Event Creation' },
  { value: 'PAYMENT_RECEIVED', label: 'Payments' },
  { value: 'MESSAGE_SENT', label: 'Messages' },
]

const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

function getActivityIcon(type: string): string {
  switch (type) {
    case 'MEMBER_REGISTRATION':
      return 'UserPlus'
    case 'LOGIN_SUCCESS':
      return 'LogIn'
    case 'LOGIN_FAILED':
      return 'AlertTriangle'
    case 'PROFILE_UPDATE':
      return 'Edit'
    case 'PROJECT_SUBMITTED':
      return 'Building2'
    case 'EVENT_CREATED':
      return 'Calendar'
    case 'PAYMENT_RECEIVED':
      return 'DollarSign'
    case 'MESSAGE_SENT':
      return 'Mail'
    default:
      return 'Activity'
  }
}

function getActivityColor(type: string): string {
  switch (type) {
    case 'MEMBER_REGISTRATION':
      return 'bg-green-100 text-green-700'
    case 'LOGIN_SUCCESS':
      return 'bg-blue-100 text-blue-700'
    case 'LOGIN_FAILED':
      return 'bg-red-100 text-red-700'
    case 'PROFILE_UPDATE':
      return 'bg-yellow-100 text-yellow-700'
    case 'PROJECT_SUBMITTED':
      return 'bg-purple-100 text-purple-700'
    case 'EVENT_CREATED':
      return 'bg-indigo-100 text-indigo-700'
    case 'PAYMENT_RECEIVED':
      return 'bg-green-100 text-green-700'
    case 'MESSAGE_SENT':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('week')
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)

  // Filter activities based on search and filters
  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || activity.type === selectedType
    
    // Simple time filtering - in real app, this would be more sophisticated
    let matchesTime = true
    if (selectedTimeRange !== 'all') {
      const activityDate = new Date(activity.timestamp)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 3600 * 24))
      
      switch (selectedTimeRange) {
        case 'today':
          matchesTime = daysDiff === 0
          break
        case 'week':
          matchesTime = daysDiff <= 7
          break
        case 'month':
          matchesTime = daysDiff <= 30
          break
      }
    }
    
    return matchesSearch && matchesType && matchesTime
  })

  const handleExportActivity = () => {
    // In real app, this would export activity log
    console.log('Exporting activity log...')
  }

  return (
    <AdminRequiredRoute>
      <div className="min-h-screen bg-namc-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-namc-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="text-namc-gray-600 hover:text-namc-gray-900">
                  <DynamicIcon name="ArrowLeft" className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-namc-gray-900">System Activity</h1>
                  <p className="text-namc-gray-600">Monitor all system activities and user actions</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={handleExportActivity}>
                  <DynamicIcon name="Download" className="w-4 h-4 mr-2" />
                  Export Log
                </Button>
                <Button size="sm">
                  <DynamicIcon name="RefreshCw" className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Activity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Total Activities</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{mockActivities.length}</p>
                  </div>
                  <DynamicIcon name="Activity" className="h-8 w-8 text-namc-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-namc-gray-600">
                  <span>Last 7 days</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">User Logins</p>
                    <p className="text-2xl font-bold text-namc-gray-900">
                      {mockActivities.filter(a => a.type === 'LOGIN_SUCCESS').length}
                    </p>
                  </div>
                  <DynamicIcon name="LogIn" className="h-8 w-8 text-namc-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <DynamicIcon name="TrendingUp" className="w-4 h-4 mr-1" />
                  <span>+15% from last week</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Failed Logins</p>
                    <p className="text-2xl font-bold text-namc-gray-900">
                      {mockActivities.filter(a => a.type === 'LOGIN_FAILED').length}
                    </p>
                  </div>
                  <DynamicIcon name="AlertTriangle" className="h-8 w-8 text-namc-red-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-namc-gray-600">
                  <span>Security monitoring</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">New Members</p>
                    <p className="text-2xl font-bold text-namc-gray-900">
                      {mockActivities.filter(a => a.type === 'MEMBER_REGISTRATION').length}
                    </p>
                  </div>
                  <DynamicIcon name="UserPlus" className="h-8 w-8 text-namc-purple-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-namc-gray-600">
                  <span>This week</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                    Search Activities
                  </label>
                  <div className="relative">
                    <DynamicIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                    Activity Type
                  </label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                    Time Range
                  </label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedType('all')
                      setSelectedTimeRange('week')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Showing {filteredActivities.length} activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="border border-namc-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            <DynamicIcon 
                              name={getActivityIcon(activity.type) as any} 
                              className="w-5 h-5" 
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-namc-gray-900">
                              {activity.description}
                            </p>
                            <Badge className={getActivityColor(activity.type)}>
                              {activity.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-namc-gray-500">
                            <span>User: {activity.user}</span>
                            <span>IP: {activity.ipAddress}</span>
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedActivity(
                          expandedActivity === activity.id ? null : activity.id
                        )}
                      >
                        <DynamicIcon 
                          name={expandedActivity === activity.id ? "ChevronUp" : "ChevronDown"} 
                          className="w-4 h-4" 
                        />
                      </Button>
                    </div>
                    
                    {expandedActivity === activity.id && (
                      <div className="mt-4 pt-4 border-t border-namc-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-namc-gray-900 mb-2">Technical Details</h4>
                            <div className="space-y-1 text-namc-gray-600">
                              <p><span className="font-medium">User Agent:</span> {activity.userAgent}</p>
                              <p><span className="font-medium">IP Address:</span> {activity.ipAddress}</p>
                              <p><span className="font-medium">Timestamp:</span> {activity.timestamp}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-namc-gray-900 mb-2">Additional Information</h4>
                            <div className="space-y-1 text-namc-gray-600">
                              {Object.entries(activity.details).map(([key, value]) => (
                                <p key={key}>
                                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {
                                    typeof value === 'number' ? value.toLocaleString() : String(value)
                                  }
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <DynamicIcon name="Activity" className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-namc-gray-900 mb-2">No activities found</h3>
                  <p className="text-namc-gray-600 mb-4">
                    No activities match your current filters.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedType('all')
                      setSelectedTimeRange('week')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRequiredRoute>
  )
}