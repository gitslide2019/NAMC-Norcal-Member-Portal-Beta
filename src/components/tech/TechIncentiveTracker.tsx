'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { Progress } from '@/components/ui/progress'

interface IncentivePayment {
  id: string
  projectId: string
  customerName: string
  equipmentType: string
  utilityTerritory: string
  baseIncentive: number
  bonusIncentive: number
  totalIncentive: number
  status: 'pending_review' | 'approved' | 'processing' | 'paid' | 'rejected' | 'appeal'
  submissionDate: string
  approvalDate?: string
  paymentDate?: string
  rejectionReason?: string
  processingTime: number // days
  expectedPayment?: string
  referenceNumber?: string
}

interface IncentiveSummary {
  totalEarned: number
  totalPending: number
  totalPaid: number
  projectsCount: number
  averageIncentive: number
  averageProcessingTime: number
}

interface TechIncentiveTrackerProps {
  payments: IncentivePayment[]
  summary: IncentiveSummary
  onRequestAppeal: (paymentId: string) => void
  onViewDetails: (paymentId: string) => void
  className?: string
}

const statusConfig = {
  pending_review: { 
    label: 'Pending Review', 
    color: 'bg-yellow-100 text-yellow-700', 
    icon: 'Clock',
    description: 'Submitted to utility for review'
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-green-100 text-green-700', 
    icon: 'CheckCircle',
    description: 'Approved by utility, payment processing'
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-700', 
    icon: 'RefreshCw',
    description: 'Payment in progress'
  },
  paid: { 
    label: 'Paid', 
    color: 'bg-green-100 text-green-700', 
    icon: 'DollarSign',
    description: 'Payment completed'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-700', 
    icon: 'XCircle',
    description: 'Application rejected'
  },
  appeal: { 
    label: 'Under Appeal', 
    color: 'bg-purple-100 text-purple-700', 
    icon: 'Scale',
    description: 'Appeal in progress'
  }
}

const utilityProcessingTimes = {
  pge: { name: 'PG&E', averageDays: 45, maxDays: 60 },
  sce: { name: 'SCE', averageDays: 30, maxDays: 45 },
  sdge: { name: 'SDG&E', averageDays: 35, maxDays: 50 },
  smud: { name: 'SMUD', averageDays: 25, maxDays: 35 },
  ladwp: { name: 'LADWP', averageDays: 40, maxDays: 55 }
}

export function TechIncentiveTracker({
  payments,
  summary,
  onRequestAppeal,
  onViewDetails,
  className
}: TechIncentiveTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [utilityFilter, setUtilityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('submissionDate')

  // Filter and sort payments
  const filteredPayments = payments
    .filter(payment => {
      const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
      const matchesUtility = utilityFilter === 'all' || payment.utilityTerritory === utilityFilter
      
      return matchesSearch && matchesStatus && matchesUtility
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.totalIncentive - a.totalIncentive
        case 'status':
          return a.status.localeCompare(b.status)
        case 'submissionDate':
        default:
          return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
      }
    })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getProcessingProgress = (payment: IncentivePayment) => {
    const utility = utilityProcessingTimes[payment.utilityTerritory as keyof typeof utilityProcessingTimes]
    if (!utility) return 0
    
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(payment.submissionDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return Math.min(100, (daysSinceSubmission / utility.maxDays) * 100)
  }

  const getStatusCounts = () => {
    return payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const statusCounts = getStatusCounts()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-800 flex items-center">
            <DynamicIcon name="DollarSign" className="w-6 h-6 mr-2" size={24} />
            TECH Incentive Tracker
          </h1>
          <p className="text-green-700 mt-1">Track your heat pump incentive payments and processing status</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.totalEarned)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DynamicIcon name="TrendingUp" className="w-6 h-6 text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1">From {summary.projectsCount} projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(summary.totalPaid)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DynamicIcon name="CreditCard" className="w-6 h-6 text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-1">Received payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{formatCurrency(summary.totalPending)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DynamicIcon name="Clock" className="w-6 h-6 text-yellow-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-1">In processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                <p className="text-2xl font-bold text-purple-700">{summary.averageProcessingTime}d</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DynamicIcon name="Timer" className="w-6 h-6 text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-1">Average time</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Status Overview</CardTitle>
          <CardDescription>Current status distribution of your incentive payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="text-center">
                <div className={`inline-flex p-3 rounded-lg ${config.color} mb-2`}>
                  <DynamicIcon name={config.icon} className="w-5 h-5" size={20} />
                </div>
                <div className="text-lg font-bold">{statusCounts[status] || 0}</div>
                <div className="text-sm text-gray-600">{config.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer name, project ID, or reference number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={utilityFilter} onValueChange={setUtilityFilter}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Filter by utility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Utilities</SelectItem>
                {Object.entries(utilityProcessingTimes).map(([key, utility]) => (
                  <SelectItem key={key} value={key}>{utility.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submissionDate">Submission Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => {
          const config = statusConfig[payment.status]
          const progress = getProcessingProgress(payment)
          const utility = utilityProcessingTimes[payment.utilityTerritory as keyof typeof utilityProcessingTimes]
          
          return (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{payment.customerName}</h3>
                    <p className="text-sm text-gray-600">
                      Project {payment.projectId} • {payment.equipmentType}
                    </p>
                    {payment.referenceNumber && (
                      <p className="text-xs text-gray-500">Ref: {payment.referenceNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(payment.totalIncentive)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Base: {formatCurrency(payment.baseIncentive)}
                      {payment.bonusIncentive > 0 && (
                        <span className="text-green-600">
                          {' '}+ {formatCurrency(payment.bonusIncentive)} bonus
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={config.color}>
                        <DynamicIcon name={config.icon} className="w-3 h-3 mr-1" size={12} />
                        {config.label}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {utility?.name || payment.utilityTerritory.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                    
                    {(payment.status === 'pending_review' || payment.status === 'processing') && utility && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Processing Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          Expected processing: {utility.averageDays}-{utility.maxDays} days
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{formatDate(payment.submissionDate)}</span>
                    </div>
                    {payment.approvalDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Approved:</span>
                        <span>{formatDate(payment.approvalDate)}</span>
                      </div>
                    )}
                    {payment.paymentDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-medium text-green-700">{formatDate(payment.paymentDate)}</span>
                      </div>
                    )}
                    {payment.expectedPayment && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Expected:</span>
                        <span>{formatDate(payment.expectedPayment)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processing Time:</span>
                      <span>{payment.processingTime} days</span>
                    </div>
                  </div>
                </div>

                {payment.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <DynamicIcon name="AlertCircle" className="w-4 h-4 text-red-600 mt-0.5 mr-2" size={16} />
                      <div>
                        <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                        <p className="text-sm text-red-700 mt-1">{payment.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(payment.id)}>
                      <DynamicIcon name="Eye" className="w-4 h-4 mr-1" size={16} />
                      View Details
                    </Button>
                    {payment.status === 'rejected' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onRequestAppeal(payment.id)}
                        className="text-purple-700 border-purple-200 hover:bg-purple-50"
                      >
                        <DynamicIcon name="Scale" className="w-4 h-4 mr-1" size={16} />
                        Request Appeal
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payment.processingTime} days processing
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <DynamicIcon name="Search" className="w-12 h-12 text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || utilityFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Complete your first TECH project to see incentive payments here'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Mock data for development
export const mockIncentivePayments: IncentivePayment[] = [
  {
    id: 'PAY-001',
    projectId: 'TECH-001',
    customerName: 'Sarah Johnson',
    equipmentType: 'Heat Pump HVAC',
    utilityTerritory: 'pge',
    baseIncentive: 7500,
    bonusIncentive: 1000,
    totalIncentive: 8500,
    status: 'paid',
    submissionDate: '2024-01-15',
    approvalDate: '2024-02-10',
    paymentDate: '2024-02-20',
    processingTime: 36,
    referenceNumber: 'PGE-2024-001234'
  },
  {
    id: 'PAY-002',
    projectId: 'TECH-002',
    customerName: 'Michael Chen',
    equipmentType: 'Heat Pump Water Heater',
    utilityTerritory: 'sce',
    baseIncentive: 3000,
    bonusIncentive: 0,
    totalIncentive: 3000,
    status: 'processing',
    submissionDate: '2024-02-01',
    approvalDate: '2024-02-15',
    processingTime: 25,
    expectedPayment: '2024-03-01',
    referenceNumber: 'SCE-2024-005678'
  },
  {
    id: 'PAY-003',
    projectId: 'TECH-003',
    customerName: 'Davis Family',
    equipmentType: 'Heat Pump HVAC',
    utilityTerritory: 'sdge',
    baseIncentive: 10000,
    bonusIncentive: 2000,
    totalIncentive: 12000,
    status: 'pending_review',
    submissionDate: '2024-02-10',
    processingTime: 15,
    referenceNumber: 'SDGE-2024-009876'
  },
  {
    id: 'PAY-004',
    projectId: 'TECH-004',
    customerName: 'Robert Martinez',
    equipmentType: 'Heat Pump HVAC',
    utilityTerritory: 'pge',
    baseIncentive: 8500,
    bonusIncentive: 1000,
    totalIncentive: 9500,
    status: 'rejected',
    submissionDate: '2024-01-25',
    processingTime: 30,
    rejectionReason: 'Equipment model not found on approved list. Please verify model number and resubmit with correct documentation.',
    referenceNumber: 'PGE-2024-001890'
  }
]

export const mockIncentiveSummary: IncentiveSummary = {
  totalEarned: 33000,
  totalPending: 21000,
  totalPaid: 8500,
  projectsCount: 4,
  averageIncentive: 8250,
  averageProcessingTime: 32
}