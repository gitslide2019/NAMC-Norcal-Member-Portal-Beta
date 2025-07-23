'use client'

import { useState, useEffect } from 'react'
import { AdminRequiredRoute } from '@/components/auth/protected-route'
import { useAdminActions, useAdminState, useAdminFilters } from '@/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  User,
  Clock,
  AlertCircle
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Mock audit log data for demonstration
const mockAuditLogs = [
  {
    id: '1',
    action: 'USER_LOGIN',
    userId: 'admin-1',
    userName: 'System Administrator',
    userEmail: 'admin@namc-norcal.org',
    targetUserId: null,
    targetUserName: null,
    details: 'User admin@namc-norcal.org logged in successfully',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: '2',
    action: 'USER_CREATED',
    userId: 'admin-1',
    userName: 'System Administrator',
    userEmail: 'admin@namc-norcal.org',
    targetUserId: 'user-123',
    targetUserName: 'John Smith',
    details: 'New member account created for john.smith@example.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '3',
    action: 'PROJECT_CREATED',
    userId: 'admin-1',
    userName: 'System Administrator',
    userEmail: 'admin@namc-norcal.org',
    targetUserId: null,
    targetUserName: null,
    details: 'New project posted: Downtown Office Complex Renovation',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: '4',
    action: 'PASSWORD_RESET_REQUESTED',
    userId: 'user-456',
    userName: 'Maria Johnson',
    userEmail: 'maria.johnson@example.com',
    targetUserId: null,
    targetUserName: null,
    details: 'Password reset requested for maria.johnson@example.com',
    ipAddress: '192.168.1.150',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: '5',
    action: 'USER_UPDATED',
    userId: 'user-789',
    userName: 'Carlos Santos',
    userEmail: 'carlos.santos@example.com',
    targetUserId: 'user-789',
    targetUserName: 'Carlos Santos',
    details: 'Profile updated - business information modified',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
]

const actionTypeLabels = {
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  USER_CREATED: 'User Created',
  USER_UPDATED: 'User Updated',
  USER_DELETED: 'User Deleted',
  PASSWORD_RESET_REQUESTED: 'Password Reset',
  PASSWORD_RESET_EMAIL_SENT: 'Reset Email Sent',
  PROJECT_CREATED: 'Project Created',
  PROJECT_UPDATED: 'Project Updated',
  PROJECT_DELETED: 'Project Deleted',
  EVENT_CREATED: 'Event Created',
  EVENT_UPDATED: 'Event Updated',
  PAYMENT_PROCESSED: 'Payment Processed',
  SYSTEM_CONFIG_CHANGED: 'Config Changed',
}

const actionTypeColors = {
  USER_LOGIN: 'bg-namc-green-100 text-namc-green-800',
  USER_LOGOUT: 'bg-namc-gray-100 text-namc-gray-800',
  USER_CREATED: 'bg-namc-blue-100 text-namc-blue-800',
  USER_UPDATED: 'bg-namc-blue-100 text-namc-blue-800',
  USER_DELETED: 'bg-namc-red-100 text-namc-red-800',
  PASSWORD_RESET_REQUESTED: 'bg-namc-gold-100 text-namc-gold-800',
  PASSWORD_RESET_EMAIL_SENT: 'bg-namc-gold-100 text-namc-gold-800',
  PROJECT_CREATED: 'bg-namc-purple-100 text-namc-purple-800',
  PROJECT_UPDATED: 'bg-namc-purple-100 text-namc-purple-800',
  PROJECT_DELETED: 'bg-namc-red-100 text-namc-red-800',
  EVENT_CREATED: 'bg-namc-green-100 text-namc-green-800',
  EVENT_UPDATED: 'bg-namc-green-100 text-namc-green-800',
  PAYMENT_PROCESSED: 'bg-namc-gold-100 text-namc-gold-800',
  SYSTEM_CONFIG_CHANGED: 'bg-namc-red-100 text-namc-red-800',
}

function AuditLogsContent() {
  const { adminActions, setAdminActions } = useAdminActions()
  const { isLoading, setLoading } = useAdminState()
  const { filters, setFilter, resetFilters } = useAdminFilters()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [displayLogs, setDisplayLogs] = useState(mockAuditLogs)

  useEffect(() => {
    // Initialize with mock data
    setAdminActions(mockAuditLogs as any)
    setDisplayLogs(mockAuditLogs)
  }, [setAdminActions])

  // Filter logs based on search and action type
  useEffect(() => {
    let filtered = mockAuditLogs

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
      )
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter)
    }

    setDisplayLogs(filtered)
  }, [searchTerm, actionFilter])

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Details', 'IP Address'].join(','),
      ...displayLogs.map(log => [
        log.createdAt.toISOString(),
        actionTypeLabels[log.action as keyof typeof actionTypeLabels] || log.action,
        log.userName,
        `"${log.details}"`, // Wrap in quotes for CSV
        log.ipAddress
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Activity className="h-8 w-8 mr-3 text-namc-blue-600" />
                Audit Logs
              </h1>
              <p className="text-muted-foreground mt-1">
                Track all administrative actions and user activities
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="action-filter">Action Type</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="USER_LOGIN">User Login</SelectItem>
                    <SelectItem value="USER_CREATED">User Created</SelectItem>
                    <SelectItem value="USER_UPDATED">User Updated</SelectItem>
                    <SelectItem value="PROJECT_CREATED">Project Created</SelectItem>
                    <SelectItem value="PASSWORD_RESET_REQUESTED">Password Reset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setActionFilter('all')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              Showing {displayLogs.length} of {mockAuditLogs.length} audit entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-2">Loading audit logs...</span>
              </div>
            ) : displayLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No audit logs found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          className={actionTypeColors[log.action as keyof typeof actionTypeColors] || 'bg-gray-100 text-gray-800'}
                        >
                          {actionTypeLabels[log.action as keyof typeof actionTypeLabels] || log.action}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(log.createdAt)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.createdAt.toLocaleString()}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{log.details}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span className="font-medium">{log.userName}</span>
                        <span className="ml-1">({log.userEmail})</span>
                      </div>
                      
                      {log.targetUserName && (
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          <span>Target: {log.targetUserName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <span className="font-mono">{log.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuditLogsPage() {
  return (
    <AdminRequiredRoute>
      <AuditLogsContent />
    </AdminRequiredRoute>
  )
}