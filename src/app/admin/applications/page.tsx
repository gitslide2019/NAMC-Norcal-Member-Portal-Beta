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
const mockApplications = [
  {
    id: '1',
    applicantName: 'Carlos Rodriguez',
    company: 'Rodriguez Construction LLC',
    email: 'carlos@rodriguezconst.com',
    phone: '+1 (415) 555-0123',
    membershipType: 'PREMIUM',
    status: 'PENDING',
    submittedDate: '2024-01-15',
    businessType: 'General Contractor',
    yearsInBusiness: 12,
    licenseNumber: 'CA-123456',
    annualRevenue: 2500000,
    employees: 25,
    specialties: ['Commercial Construction', 'Residential Remodeling'],
  },
  {
    id: '2',
    applicantName: 'Jennifer Kim',
    company: 'Kim Engineering Services',
    email: 'jennifer@kimengineering.com',
    phone: '+1 (510) 555-0234',
    membershipType: 'STANDARD',
    status: 'UNDER_REVIEW',
    submittedDate: '2024-01-12',
    businessType: 'Engineering Consultant',
    yearsInBusiness: 8,
    licenseNumber: 'CA-789012',
    annualRevenue: 850000,
    employees: 6,
    specialties: ['Structural Engineering', 'Civil Engineering'],
  },
  {
    id: '3',
    applicantName: 'Michael Thompson',
    company: 'Thompson Electric Inc',
    email: 'mike@thompsonelectric.com',
    phone: '+1 (650) 555-0345',
    membershipType: 'PREMIUM',
    status: 'APPROVED',
    submittedDate: '2024-01-10',
    businessType: 'Electrical Contractor',
    yearsInBusiness: 15,
    licenseNumber: 'CA-345678',
    annualRevenue: 1800000,
    employees: 18,
    specialties: ['Commercial Electrical', 'Industrial Wiring'],
  },
  {
    id: '4',
    applicantName: 'Sarah Williams',
    company: 'Williams Plumbing Solutions',
    email: 'sarah@williamsplumbing.com',
    phone: '+1 (925) 555-0456',
    membershipType: 'STANDARD',
    status: 'NEEDS_INFO',
    submittedDate: '2024-01-08',
    businessType: 'Plumbing Contractor',
    yearsInBusiness: 6,
    licenseNumber: 'CA-901234',
    annualRevenue: 650000,
    employees: 8,
    specialties: ['Residential Plumbing', 'Emergency Services'],
  }
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending Review' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'NEEDS_INFO', label: 'Needs Information' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-800'
    case 'NEEDS_INFO':
      return 'bg-orange-100 text-orange-800'
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter applications based on search and filters
  const filteredApplications = mockApplications.filter((app) => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const pendingCount = mockApplications.filter(app => app.status === 'PENDING').length
  const underReviewCount = mockApplications.filter(app => app.status === 'UNDER_REVIEW').length
  const needsInfoCount = mockApplications.filter(app => app.status === 'NEEDS_INFO').length

  const handleApproveApplication = async (applicationId: string) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to approve application
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Approving application:', applicationId)
    } catch (error) {
      console.error('Error approving application:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to reject application
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Rejecting application:', applicationId)
    } catch (error) {
      console.error('Error rejecting application:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestInfo = async (applicationId: string) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to request more info
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Requesting more info for application:', applicationId)
    } catch (error) {
      console.error('Error requesting info:', error)
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
                  <h1 className="text-2xl font-bold text-namc-gray-900">Membership Applications</h1>
                  <p className="text-namc-gray-600">Review and process new membership applications</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <DynamicIcon name="Download" className="w-4 h-4 mr-2" />
                  Export Applications
                </Button>
                <Button size="sm">
                  <DynamicIcon name="Mail" className="w-4 h-4 mr-2" />
                  Bulk Email
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{pendingCount}</p>
                  </div>
                  <DynamicIcon name="Clock" className="h-8 w-8 text-namc-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Under Review</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{underReviewCount}</p>
                  </div>
                  <DynamicIcon name="Eye" className="h-8 w-8 text-namc-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Needs Information</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{needsInfoCount}</p>
                  </div>
                  <DynamicIcon name="AlertCircle" className="h-8 w-8 text-namc-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{mockApplications.length}</p>
                  </div>
                  <DynamicIcon name="Users" className="h-8 w-8 text-namc-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search & Filter Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                    Search Applications
                  </label>
                  <div className="relative">
                    <DynamicIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                    <Input
                      placeholder="Search by name, company, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
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
                      {statusOptions.map((option) => (
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

          {/* Applications List */}
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-namc-gray-900">
                          {application.applicantName}
                        </h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-namc-gray-600 mb-1">{application.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-namc-gray-600">
                        <span>{application.email}</span>
                        <span>{application.phone}</span>
                        <span>Applied: {application.submittedDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-namc-gray-900 mb-1">
                        {application.membershipType} Membership
                      </p>
                      <p className="text-sm text-namc-gray-600">
                        {application.businessType}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-namc-gray-900 mb-2">Business Details</h4>
                      <div className="space-y-1 text-sm text-namc-gray-600">
                        <p>Years in Business: {application.yearsInBusiness}</p>
                        <p>License: {application.licenseNumber}</p>
                        <p>Employees: {application.employees}</p>
                        <p>Annual Revenue: ${application.annualRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-namc-gray-900 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {application.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-namc-gray-900 mb-2">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveApplication(application.id)}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <DynamicIcon name="Check" className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestInfo(application.id)}
                              disabled={isLoading}
                            >
                              <DynamicIcon name="MessageSquare" className="w-4 h-4 mr-1" />
                              Request Info
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectApplication(application.id)}
                              disabled={isLoading}
                            >
                              <DynamicIcon name="X" className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {application.status === 'UNDER_REVIEW' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveApplication(application.id)}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <DynamicIcon name="Check" className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectApplication(application.id)}
                              disabled={isLoading}
                            >
                              <DynamicIcon name="X" className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {application.status === 'NEED_INFO' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestInfo(application.id)}
                            disabled={isLoading}
                          >
                            <DynamicIcon name="Mail" className="w-4 h-4 mr-1" />
                            Follow Up
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <DynamicIcon name="Eye" className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <DynamicIcon name="FileText" className="w-4 h-4 mr-1" />
                          Documents
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <DynamicIcon name="Users" className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-namc-gray-900 mb-2">No applications found</h3>
                <p className="text-namc-gray-600 mb-4">
                  No membership applications match your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminRequiredRoute>
  )
}