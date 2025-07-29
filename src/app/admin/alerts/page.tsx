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
const mockAlerts = [
  {
    id: '1',
    title: 'Database backup maintenance scheduled',
    message: 'Scheduled database backup maintenance will begin in 2 hours. System may experience brief interruptions.',
    level: 'WARNING',
    category: 'SYSTEM',
    timestamp: '2024-01-15T14:30:00Z',
    isRead: false,
    isResolved: false,
    source: 'Database Monitor',
    affectedUsers: 0,
    estimatedDuration: '30 minutes',
    actions: ['Notify Users', 'Prepare Rollback']
  },
  {
    id: '2',
    title: 'High number of failed login attempts detected',
    message: 'Unusual pattern of failed login attempts from IP 203.0.113.10. Possible brute force attack.',
    level: 'ERROR',
    category: 'SECURITY',
    timestamp: '2024-01-15T13:45:00Z',
    isRead: true,
    isResolved: false,
    source: 'Security Monitor',
    affectedUsers: 1,
    estimatedDuration: 'Ongoing',
    actions: ['Block IP', 'Investigate', 'Alert User']
  },
  {
    id: '3',
    title: 'Monthly newsletter sent successfully',
    message: 'Monthly newsletter "NAMC NorCal Updates - January 2024" has been delivered to 245 members successfully.',
    level: 'SUCCESS',
    category: 'COMMUNICATION',
    timestamp: '2024-01-15T12:00:00Z',
    isRead: true,
    isResolved: true,
    source: 'Email Service',
    affectedUsers: 245,
    estimatedDuration: 'Completed',
    actions: ['View Report', 'Archive']
  },
  {
    id: '4',
    title: 'HubSpot TECH integration sync completed',
    message: 'Successfully synchronized 42 contractor records with HubSpot TECH Clean California program.',
    level: 'SUCCESS',
    category: 'INTEGRATION',
    timestamp: '2024-01-15T11:30:00Z',
    isRead: true,
    isResolved: true,
    source: 'HubSpot Integration',
    affectedUsers: 42,
    estimatedDuration: '5 minutes',
    actions: ['View Sync Report', 'Schedule Next Sync']
  },
  {
    id: '5',
    title: 'Storage space running low',
    message: 'File storage is at 85% capacity. Consider cleaning up old files or upgrading storage plan.',
    level: 'WARNING',
    category: 'SYSTEM',
    timestamp: '2024-01-15T10:15:00Z',
    isRead: false,
    isResolved: false,
    source: 'File System Monitor',
    affectedUsers: 0,
    estimatedDuration: 'N/A',
    actions: ['Clean Up Files', 'Upgrade Storage', 'Monitor Usage']
  },
  {
    id: '6',
    title: 'Payment processor maintenance window',
    message: 'Stripe payment processor will undergo maintenance from 2 AM to 4 AM PST tomorrow.',
    level: 'INFO',
    category: 'PAYMENT',
    timestamp: '2024-01-15T09:00:00Z',
    isRead: true,
    isResolved: false,
    source: 'Payment Gateway',
    affectedUsers: 0,
    estimatedDuration: '2 hours',
    actions: ['Schedule Maintenance', 'Notify Members']
  },
  {
    id: '7',
    title: 'Certificate expiring soon',
    message: 'SSL certificate for portal.namcnorcal.org will expire in 30 days. Renewal required.',
    level: 'WARNING',
    category: 'SECURITY',
    timestamp: '2024-01-15T08:30:00Z',
    isRead: false,
    isResolved: false,
    source: 'Certificate Monitor',
    affectedUsers: 0,
    estimatedDuration: 'N/A',
    actions: ['Renew Certificate', 'Update DNS', 'Verify Installation']
  }
]

const alertLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'ERROR', label: 'Error' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'INFO', label: 'Info' },
  { value: 'SUCCESS', label: 'Success' },
]

const alertCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'INTEGRATION', label: 'Integration' },
  { value: 'PAYMENT', label: 'Payment' },
]

const alertStatuses = [
  { value: 'all', label: 'All Alerts' },
  { value: 'unread', label: 'Unread' },
  { value: 'unresolved', label: 'Unresolved' },
  { value: 'resolved', label: 'Resolved' },
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

function getAlertIcon(level: string): string {
  switch (level) {
    case 'ERROR':
      return 'AlertCircle'
    case 'WARNING':
      return 'AlertTriangle'
    case 'INFO':
      return 'Info'
    case 'SUCCESS':
      return 'CheckCircle'
    default:
      return 'Bell'
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

export default function AlertsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter alerts based on search and filters
  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || alert.level === selectedLevel
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory
    
    let matchesStatus = true
    if (selectedStatus === 'unread') {
      matchesStatus = !alert.isRead
    } else if (selectedStatus === 'unresolved') {
      matchesStatus = !alert.isResolved
    } else if (selectedStatus === 'resolved') {
      matchesStatus = alert.isResolved
    }
    
    return matchesSearch && matchesLevel && matchesCategory && matchesStatus
  })

  const errorCount = mockAlerts.filter(alert => alert.level === 'ERROR' && !alert.isResolved).length
  const warningCount = mockAlerts.filter(alert => alert.level === 'WARNING' && !alert.isResolved).length
  const unreadCount = mockAlerts.filter(alert => !alert.isRead).length

  const handleMarkAsRead = async (alertId: string) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to mark alert as read
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Marking alert as read:', alertId)
    } catch (error) {
      console.error('Error marking alert as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to resolve alert
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Resolving alert:', alertId)
    } catch (error) {
      console.error('Error resolving alert:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    try {
      // In real app, this would call API to mark all alerts as read
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Marking all alerts as read')
    } catch (error) {
      console.error('Error marking all alerts as read:', error)
    } finally {
      setIsLoading(false)
    }
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
                  <h1 className="text-2xl font-bold text-namc-gray-900">System Alerts</h1>
                  <p className="text-namc-gray-600">Monitor system notifications and alerts</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                >
                  <DynamicIcon name="CheckCheck" className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
                <Button size="sm">
                  <DynamicIcon name="Settings" className="w-4 h-4 mr-2" />
                  Alert Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alert Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Critical Errors</p>
                    <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  </div>
                  <DynamicIcon name="AlertCircle" className="h-8 w-8 text-red-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <span>Requires immediate attention</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                  </div>
                  <DynamicIcon name="AlertTriangle" className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-yellow-600">
                  <span>Monitor closely</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Unread Alerts</p>
                    <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                  </div>
                  <DynamicIcon name="Bell" className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <span>New notifications</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Total Alerts</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{mockAlerts.length}</p>
                  </div>
                  <DynamicIcon name="List" className="h-8 w-8 text-namc-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-namc-gray-600">
                  <span>All time</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                    Search Alerts
                  </label>
                  <div className="relative">
                    <DynamicIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                    Level
                  </label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {alertLevels.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {alertCategories.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                    Status
                  </label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {alertStatuses.map((option) => (
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
                      setSelectedLevel('all')
                      setSelectedCategory('all')
                      setSelectedStatus('all')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`${alert.isRead ? '' : 'ring-2 ring-blue-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAlertColor(alert.level)}`}>
                          <DynamicIcon 
                            name={getAlertIcon(alert.level) as any} 
                            className="w-5 h-5" 
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-namc-gray-900">
                            {alert.title}
                          </h3>
                          {!alert.isRead && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              New
                            </Badge>
                          )}
                          <Badge className={getAlertColor(alert.level)}>
                            {alert.level}
                          </Badge>
                          <Badge variant="outline">
                            {alert.category}
                          </Badge>
                        </div>
                        <p className="text-namc-gray-600 mb-3">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-namc-gray-500">
                          <span>Source: {alert.source}</span>
                          <span>{formatTimestamp(alert.timestamp)}</span>
                          {alert.affectedUsers > 0 && (
                            <span>Affected Users: {alert.affectedUsers}</span>
                          )}
                          <span>Duration: {alert.estimatedDuration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.isResolved && (
                        <Badge className="bg-green-100 text-green-700">
                          Resolved
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedAlert(
                          expandedAlert === alert.id ? null : alert.id
                        )}
                      >
                        <DynamicIcon 
                          name={expandedAlert === alert.id ? "ChevronUp" : "ChevronDown"} 
                          className="w-4 h-4" 
                        />
                      </Button>
                    </div>
                  </div>

                  {expandedAlert === alert.id && (
                    <div className="mt-6 pt-6 border-t border-namc-gray-200">
                      <div className="mb-4">
                        <h4 className="font-medium text-namc-gray-900 mb-2">Available Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {alert.actions.map((action, index) => (
                            <Button key={index} variant="outline" size="sm">
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!alert.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(alert.id)}
                            disabled={isLoading}
                          >
                            <DynamicIcon name="Check" className="w-4 h-4 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                        {!alert.isResolved && (
                          <Button
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                        <Button size="sm" variant="destructive">
                          <DynamicIcon name="Trash2" className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredAlerts.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <DynamicIcon name="Bell" className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-namc-gray-900 mb-2">No alerts found</h3>
                <p className="text-namc-gray-600 mb-4">
                  No alerts match your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedLevel('all')
                    setSelectedCategory('all')
                    setSelectedStatus('all')
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminRequiredRoute>
  )
}