'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import Link from 'next/link'

// Mock data - in real app, this would come from HubSpot API
const mockTechContractors = [
  {
    id: '1',
    companyName: 'Rodriguez Construction LLC',
    contactName: 'Maria Rodriguez',
    email: 'maria@rodriguezconst.com',
    phone: '+1 (415) 555-0123',
    status: 'ENROLLED',
    enrollmentDate: '2024-01-10',
    certificationLevel: 'BRONZE',
    projectsCompleted: 3,
    totalEarnings: 125000,
    complianceScore: 92,
    lastActivity: '2024-01-14',
    specialties: ['Green Building', 'Energy Efficiency'],
    hubspotId: 'hs_001',
    syncStatus: 'SYNCED'
  },
  {
    id: '2',
    companyName: 'Johnson Electric Inc',
    contactName: 'Michael Johnson',
    email: 'mike@johnsonelectric.com',
    phone: '+1 (510) 555-0234',
    status: 'PENDING_VERIFICATION',
    enrollmentDate: '2024-01-12',
    certificationLevel: 'PENDING',
    projectsCompleted: 0,
    totalEarnings: 0,
    complianceScore: 0,
    lastActivity: '2024-01-12',
    specialties: ['Solar Installation', 'EV Charging'],
    hubspotId: 'hs_002',
    syncStatus: 'PENDING'
  },
  {
    id: '3',
    companyName: 'Green Solutions Plumbing',
    contactName: 'Sarah Wilson',
    email: 'sarah@greensolutionsplumbing.com',
    phone: '+1 (650) 555-0345',
    status: 'ENROLLED',
    enrollmentDate: '2023-12-15',
    certificationLevel: 'SILVER',
    projectsCompleted: 8,
    totalEarnings: 340000,
    complianceScore: 96,
    lastActivity: '2024-01-13',
    specialties: ['Water Conservation', 'Green Plumbing'],
    hubspotId: 'hs_003',
    syncStatus: 'SYNCED'
  },
  {
    id: '4',
    companyName: 'Bay Area HVAC Solutions',
    contactName: 'David Chen',
    email: 'david@bayareahvac.com',
    phone: '+1 (925) 555-0456',
    status: 'SUSPENDED',
    enrollmentDate: '2023-11-20',
    certificationLevel: 'BRONZE',
    projectsCompleted: 2,
    totalEarnings: 85000,
    complianceScore: 68,
    lastActivity: '2024-01-05',
    specialties: ['Heat Pumps', 'Energy Efficiency'],
    hubspotId: 'hs_004',
    syncStatus: 'ERROR'
  }
]

const mockTechProjects = [
  {
    id: '1',
    title: 'Residential Solar + Heat Pump Installation - Oakland',
    contractorId: '1',
    contractorName: 'Rodriguez Construction LLC',
    category: 'SOLAR_HEAT_PUMP',
    budget: 45000,
    status: 'COMPLETED',
    startDate: '2024-01-05',
    completionDate: '2024-01-12',
    energySavings: '35% reduction',
    certificationPoints: 150,
    hubspotDealId: 'deal_001'
  },
  {
    id: '2',
    title: 'Commercial EV Charging Station - San Francisco',
    contractorId: '3',
    contractorName: 'Green Solutions Plumbing',
    category: 'EV_CHARGING',
    budget: 85000,
    status: 'IN_PROGRESS',
    startDate: '2024-01-08',
    completionDate: null,
    energySavings: 'TBD',
    certificationPoints: 0,
    hubspotDealId: 'deal_002'
  },
  {
    id: '3',
    title: 'Multi-Family Heat Pump Retrofit - Berkeley',
    contractorId: '1',
    contractorName: 'Rodriguez Construction LLC',
    category: 'HEAT_PUMP',
    budget: 120000,
    status: 'PENDING_APPROVAL',
    startDate: null,
    completionDate: null,
    energySavings: 'Projected 40%',
    certificationPoints: 0,
    hubspotDealId: 'deal_003'
  }
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'ENROLLED', label: 'Enrolled' },
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'INACTIVE', label: 'Inactive' },
]

const certificationLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' },
]

function getStatusColor(status: string): string {
  switch (status) {
    case 'ENROLLED':
      return 'bg-green-100 text-green-800'
    case 'PENDING_VERIFICATION':
      return 'bg-yellow-100 text-yellow-800'
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getCertificationColor(level: string): string {
  switch (level) {
    case 'BRONZE':
      return 'bg-orange-100 text-orange-800'
    case 'SILVER':
      return 'bg-gray-100 text-gray-800'
    case 'GOLD':
      return 'bg-yellow-100 text-yellow-800'
    case 'PLATINUM':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getSyncStatusColor(status: string): string {
  switch (status) {
    case 'SYNCED':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'ERROR':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function TechProgramPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('contractors')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCertification, setSelectedCertification] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter contractors based on search and filters
  const filteredContractors = mockTechContractors.filter((contractor) => {
    const matchesSearch = contractor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || contractor.status === selectedStatus
    const matchesCertification = selectedCertification === 'all' || contractor.certificationLevel === selectedCertification
    
    return matchesSearch && matchesStatus && matchesCertification
  })

  const enrolledCount = mockTechContractors.filter(c => c.status === 'ENROLLED').length
  const pendingCount = mockTechContractors.filter(c => c.status === 'PENDING_VERIFICATION').length
  const totalProjects = mockTechProjects.length
  const totalEarnings = mockTechContractors.reduce((sum, c) => sum + c.totalEarnings, 0)

  const handleSyncWithHubspot = async () => {
    setIsLoading(true)
    try {
      // In real app, this would call HubSpot sync API
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Syncing with HubSpot...')
    } catch (error) {
      console.error('Error syncing with HubSpot:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveContractor = async (contractorId: string) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to approve contractor
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Approving contractor:', contractorId)
    } catch (error) {
      console.error('Error approving contractor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuspendContractor = async (contractorId: string) => {
    setIsLoading(true)
    try {
      // In real app, this would call API to suspend contractor
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Suspending contractor:', contractorId)
    } catch (error) {
      console.error('Error suspending contractor:', error)
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
                  <h1 className="text-2xl font-bold text-namc-gray-900">TECH Program Management</h1>
                  <p className="text-namc-gray-600">Manage HubSpot TECH Clean California program integration</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSyncWithHubspot}
                  disabled={isLoading}
                >
                  <DynamicIcon name="RefreshCw" className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Syncing...' : 'Sync with HubSpot'}
                </Button>
                <Button size="sm">
                  <DynamicIcon name="Settings" className="w-4 h-4 mr-2" />
                  Program Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Program Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Enrolled Contractors</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{enrolledCount}</p>
                  </div>
                  <DynamicIcon name="Users" className="h-8 w-8 text-namc-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <DynamicIcon name="TrendingUp" className="w-4 h-4 mr-1" />
                  <span>+12% this month</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Pending Verification</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{pendingCount}</p>
                  </div>
                  <DynamicIcon name="Clock" className="h-8 w-8 text-namc-yellow-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-namc-gray-600">
                  <span>Requires review</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-namc-gray-900">{totalProjects}</p>
                  </div>
                  <DynamicIcon name="Building2" className="h-8 w-8 text-namc-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-namc-gray-600">
                  <span>Clean energy projects</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-namc-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-namc-gray-900">
                      ${totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <DynamicIcon name="DollarSign" className="h-8 w-8 text-namc-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <DynamicIcon name="TrendingUp" className="w-4 h-4 mr-1" />
                  <span>Program revenue</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('contractors')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contractors'
                    ? 'border-namc-blue-500 text-namc-blue-600'
                    : 'border-transparent text-namc-gray-500 hover:text-namc-gray-700 hover:border-namc-gray-300'
                }`}
              >
                Contractors ({mockTechContractors.length})
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-namc-blue-500 text-namc-blue-600'
                    : 'border-transparent text-namc-gray-500 hover:text-namc-gray-700 hover:border-namc-gray-300'
                }`}
              >
                Projects ({mockTechProjects.length})
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sync'
                    ? 'border-namc-blue-500 text-namc-blue-600'
                    : 'border-transparent text-namc-gray-500 hover:text-namc-gray-700 hover:border-namc-gray-300'
                }`}
              >
                HubSpot Sync
              </button>
            </nav>
          </div>

          {/* Contractors Tab */}
          {activeTab === 'contractors' && (
            <>
              {/* Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Filter Contractors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                        Search Contractors
                      </label>
                      <div className="relative">
                        <DynamicIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                        <Input
                          placeholder="Search contractors..."
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
                    <div>
                      <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                        Certification
                      </label>
                      <Select value={selectedCertification} onValueChange={setSelectedCertification}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select certification" />
                        </SelectTrigger>
                        <SelectContent>
                          {certificationLevels.map((option) => (
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
                          setSelectedCertification('all')
                        }}
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contractors List */}
              <div className="space-y-4">
                {filteredContractors.map((contractor) => (
                  <Card key={contractor.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-namc-gray-900">
                              {contractor.companyName}
                            </h3>
                            <Badge className={getStatusColor(contractor.status)}>
                              {contractor.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getCertificationColor(contractor.certificationLevel)}>
                              {contractor.certificationLevel}
                            </Badge>
                            <Badge className={getSyncStatusColor(contractor.syncStatus)}>
                              {contractor.syncStatus}
                            </Badge>
                          </div>
                          <p className="text-namc-gray-600 mb-1">{contractor.contactName}</p>
                          <div className="flex items-center space-x-4 text-sm text-namc-gray-600">
                            <span>{contractor.email}</span>
                            <span>{contractor.phone}</span>
                            <span>Enrolled: {contractor.enrollmentDate}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-namc-gray-900">
                            ${contractor.totalEarnings.toLocaleString()}
                          </p>
                          <p className="text-sm text-namc-gray-600">
                            {contractor.projectsCompleted} projects
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <h4 className="font-medium text-namc-gray-900 mb-2">Performance</h4>
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Compliance Score</span>
                                <span>{contractor.complianceScore}%</span>
                              </div>
                              <Progress value={contractor.complianceScore} className="h-2" />
                            </div>
                            <p className="text-sm text-namc-gray-600">
                              Last Activity: {contractor.lastActivity}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-namc-gray-900 mb-2">Specialties</h4>
                          <div className="flex flex-wrap gap-1">
                            {contractor.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-namc-gray-900 mb-2">Actions</h4>
                          <div className="flex flex-wrap gap-2">
                            {contractor.status === 'PENDING_VERIFICATION' && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveContractor(contractor.id)}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <DynamicIcon name="Check" className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {contractor.status === 'ENROLLED' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleSuspendContractor(contractor.id)}
                                disabled={isLoading}
                              >
                                <DynamicIcon name="Pause" className="w-4 h-4 mr-1" />
                                Suspend
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <DynamicIcon name="Eye" className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <DynamicIcon name="ExternalLink" className="w-4 h-4 mr-1" />
                              HubSpot
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {mockTechProjects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-namc-gray-900 mb-2">
                          {project.title}
                        </h3>
                        <p className="text-namc-gray-600 mb-2">
                          Contractor: {project.contractorName}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-namc-gray-600">
                          <Badge variant="outline">{project.category.replace('_', ' ')}</Badge>
                          <span>Budget: ${project.budget.toLocaleString()}</span>
                          <span>Energy Savings: {project.energySavings}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-namc-gray-700">Start Date</p>
                        <p className="text-sm text-namc-gray-900">{project.startDate || 'TBD'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-namc-gray-700">Completion Date</p>
                        <p className="text-sm text-namc-gray-900">{project.completionDate || 'In Progress'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-namc-gray-700">Certification Points</p>
                        <p className="text-sm text-namc-gray-900">{project.certificationPoints}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* HubSpot Sync Tab */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>HubSpot Integration Status</CardTitle>
                  <CardDescription>
                    Monitor and manage the connection with HubSpot TECH Clean California program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-namc-gray-900 mb-4">Connection Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-namc-gray-600">Status</span>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-namc-gray-600">Last Sync</span>
                          <span className="text-sm text-namc-gray-900">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-namc-gray-600">Next Scheduled Sync</span>
                          <span className="text-sm text-namc-gray-900">In 4 hours</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-namc-gray-600">Total Records Synced</span>
                          <span className="text-sm text-namc-gray-900">42 contractors</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-namc-gray-900 mb-4">Sync Statistics</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-namc-gray-600">Successful Syncs</span>
                          <span className="text-sm text-namc-green-600">38</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-namc-gray-600">Pending Syncs</span>
                          <span className="text-sm text-namc-yellow-600">3</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-namc-gray-600">Failed Syncs</span>
                          <span className="text-sm text-namc-red-600">1</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-namc-gray-600">Average Sync Time</span>
                          <span className="text-sm text-namc-gray-900">45 seconds</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-namc-gray-200">
                    <div className="flex items-center space-x-4">
                      <Button onClick={handleSyncWithHubspot} disabled={isLoading}>
                        <DynamicIcon name="RefreshCw" className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Syncing Now...' : 'Force Sync Now'}
                      </Button>
                      <Button variant="outline">
                        <DynamicIcon name="Settings" className="w-4 h-4 mr-2" />
                        Sync Settings
                      </Button>
                      <Button variant="outline">
                        <DynamicIcon name="Download" className="w-4 h-4 mr-2" />
                        Download Sync Log
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Sync Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { time: '2 hours ago', action: 'Contractor data sync completed', status: 'success', records: 42 },
                      { time: '6 hours ago', action: 'Project status updates synced', status: 'success', records: 8 },
                      { time: '1 day ago', action: 'New contractor enrollment sync', status: 'success', records: 3 },
                      { time: '2 days ago', action: 'Payment data sync failed', status: 'error', records: 0 },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-namc-gray-200 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-namc-gray-900">{activity.action}</p>
                            <p className="text-xs text-namc-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-namc-gray-900">{activity.records} records</p>
                          <Badge className={activity.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {activeTab === 'contractors' && filteredContractors.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <DynamicIcon name="Users" className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-namc-gray-900 mb-2">No contractors found</h3>
                <p className="text-namc-gray-600 mb-4">
                  No contractors match your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('all')
                    setSelectedCertification('all')
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