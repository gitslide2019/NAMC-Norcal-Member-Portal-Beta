'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

// Mock data - in real app, this would come from API
const mockProjects = [
  {
    id: '1',
    title: 'Oakland Bay Bridge Maintenance',
    category: 'INFRASTRUCTURE',
    budgetMin: 2500000,
    budgetMax: 3200000,
    deadline: '2024-02-15',
    status: 'BIDDING_OPEN',
    location: 'Oakland, CA',
    description: 'Comprehensive maintenance and repair work on the Oakland Bay Bridge infrastructure including steel work, concrete repairs, and safety upgrades.',
    requirements: ['General Contractor License', 'Bridge Construction Experience', 'OSHA Certification'],
    isApplied: false,
  },
  {
    id: '2',
    title: 'San Francisco Housing Development',
    category: 'RESIDENTIAL',
    budgetMin: 15000000,
    budgetMax: 20000000,
    deadline: '2024-02-20',
    status: 'BIDDING_OPEN',
    location: 'San Francisco, CA',
    description: 'Multi-unit affordable housing development project including 120 residential units with sustainable building practices.',
    requirements: ['Residential Construction License', 'Green Building Experience', 'Affordable Housing Experience'],
    isApplied: true,
  },
  {
    id: '3',
    title: 'Community Center Renovation',
    category: 'RENOVATION',
    budgetMin: 800000,
    budgetMax: 1200000,
    deadline: '2024-02-10',
    status: 'BIDDING_OPEN',
    location: 'Berkeley, CA',
    description: 'Complete renovation of historic community center including accessibility upgrades, HVAC system replacement, and interior modernization.',
    requirements: ['Historic Renovation Experience', 'ADA Compliance Knowledge', 'Community Building Experience'],
    isApplied: false,
  },
  {
    id: '4',
    title: 'Solar Installation Project',
    category: 'RENEWABLE_ENERGY',
    budgetMin: 500000,
    budgetMax: 750000,
    deadline: '2024-03-01',
    status: 'UPCOMING',
    location: 'San Jose, CA',
    description: 'Large-scale solar panel installation for municipal buildings with battery storage system integration.',
    requirements: ['Electrical License', 'Solar Installation Certification', 'Battery System Experience'],
    isApplied: false,
  },
]

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'RENOVATION', label: 'Renovation' },
  { value: 'RENEWABLE_ENERGY', label: 'Renewable Energy' },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'BIDDING_OPEN', label: 'Bidding Open' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount.toLocaleString()}`
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'BIDDING_OPEN':
      return 'bg-green-100 text-green-700'
    case 'UPCOMING':
      return 'bg-blue-100 text-blue-700'
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-700'
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Filter projects based on search and filters
  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleApplyProject = (projectId: string) => {
    // In real app, this would call API to apply for project
    console.log('Applying for project:', projectId)
    // Show success message or redirect to application form
  }

  return (
    <AuthRequiredRoute>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-namc-gray-900">Project Opportunities</h1>
            <p className="text-namc-gray-600 mt-1">
              Discover and apply for government and private sector projects
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <DynamicIcon name="List" className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <DynamicIcon name="Grid3X3" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                  Search Projects
                </label>
                <div className="relative">
                  <DynamicIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                  <Input
                    placeholder="Search by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                    {categoryOptions.map((option) => (
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

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-namc-gray-600">
            Showing {filteredProjects.length} of {mockProjects.length} projects
          </p>
          <div className="flex items-center space-x-2 text-sm text-namc-gray-600">
            <DynamicIcon name="Filter" className="w-4 h-4" />
            <span>
              {selectedCategory !== 'all' && `Category: ${categoryOptions.find(c => c.value === selectedCategory)?.label} • `}
              {selectedStatus !== 'all' && `Status: ${statusOptions.find(s => s.value === selectedStatus)?.label} • `}
              {searchTerm && `Search: "${searchTerm}"`}
            </span>
          </div>
        </div>

        {/* Project List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      {project.isApplied && (
                        <Badge variant="secondary" className="bg-namc-blue-100 text-namc-blue-700">
                          Applied
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-namc-gray-600">
                      <div className="flex items-center">
                        <DynamicIcon name="MapPin" className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                      <div className="flex items-center">
                        <DynamicIcon name="Calendar" className="w-4 h-4 mr-1" />
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-lg font-semibold text-namc-gray-900 mt-1">
                      {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-namc-gray-600 mb-4">
                  {project.description}
                </CardDescription>
                
                <div className="mb-4">
                  <h4 className="font-medium text-namc-gray-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {project.category.replace('_', ' ')}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <DynamicIcon name="Eye" className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {!project.isApplied && project.status === 'BIDDING_OPEN' && (
                      <Button
                        size="sm"
                        onClick={() => handleApplyProject(project.id)}
                      >
                        <DynamicIcon name="Send" className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <DynamicIcon name="Building2" className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-namc-gray-900 mb-2">No projects found</h3>
              <p className="text-namc-gray-600 mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
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
    </AuthRequiredRoute>
  )
}