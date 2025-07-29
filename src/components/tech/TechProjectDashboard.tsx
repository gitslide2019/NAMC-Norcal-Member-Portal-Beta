'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import Link from 'next/link'

interface TechProject {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  projectType: 'hvac' | 'water_heater' | 'weatherization'
  status: 'inquiry' | 'agreement' | 'installation' | 'documentation' | 'incentive' | 'complete'
  utilityTerritory: string
  installationAddress: string
  equipmentModel: string
  incentiveAmount: number
  createdDate: string
  installationDate?: string
  completedDate?: string
  nextStep: string
  priority: 'high' | 'medium' | 'low'
}

interface TechProjectDashboardProps {
  projects: TechProject[]
  onCreateProject: () => void
  onViewProject: (projectId: string) => void
  className?: string
}

const statusConfig = {
  inquiry: { label: 'Inquiry', color: 'bg-blue-100 text-blue-700', icon: 'MessageSquare' },
  agreement: { label: 'Agreement', color: 'bg-yellow-100 text-yellow-700', icon: 'FileText' },
  installation: { label: 'Installation', color: 'bg-orange-100 text-orange-700', icon: 'Wrench' },
  documentation: { label: 'Documentation', color: 'bg-purple-100 text-purple-700', icon: 'Camera' },
  incentive: { label: 'Incentive', color: 'bg-green-100 text-green-700', icon: 'DollarSign' },
  complete: { label: 'Complete', color: 'bg-gray-100 text-gray-700', icon: 'CheckCircle' }
}

const priorityConfig = {
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700' }
}

export function TechProjectDashboard({ 
  projects, 
  onCreateProject, 
  onViewProject, 
  className 
}: TechProjectDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.installationAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Group projects by status for summary
  const projectsByStatus = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'hvac': return 'Wind'
      case 'water_heater': return 'Droplets'
      case 'weatherization': return 'Home'
      default: return 'Settings'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-800 flex items-center">
            <DynamicIcon name="Zap" className="w-6 h-6 mr-2" size={24} />
            TECH Projects
          </h1>
          <p className="text-green-700 mt-1">Manage your heat pump incentive projects</p>
        </div>
        <Button onClick={onCreateProject} className="bg-green-600 hover:bg-green-700">
          <DynamicIcon name="Plus" className="w-4 h-4 mr-2" size={16} />
          New Project
        </Button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card key={status} className="text-center">
            <CardContent className="pt-4">
              <div className={`inline-flex p-2 rounded-lg ${config.color} mb-2`}>
                <DynamicIcon name={config.icon} className="w-4 h-4" size={16} />
              </div>
              <div className="text-2xl font-bold">{projectsByStatus[status] || 0}</div>
              <div className="text-sm text-gray-600">{config.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer name, address, or project ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {Object.entries(priorityConfig).map(([priority, config]) => (
                  <SelectItem key={priority} value={priority}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <DynamicIcon 
                      name={getProjectTypeIcon(project.projectType)} 
                      className="w-5 h-5 mr-2 text-green-600" 
                      size={20} 
                    />
                    {project.customerName}
                  </CardTitle>
                  <CardDescription>
                    Project ID: {project.id}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={statusConfig[project.status].color}>
                    {statusConfig[project.status].label}
                  </Badge>
                  <Badge className={priorityConfig[project.priority].color}>
                    {priorityConfig[project.priority].label}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <DynamicIcon name="MapPin" className="w-4 h-4 mr-2" size={16} />
                  {project.installationAddress}
                </div>
                <div className="flex items-center text-gray-600">
                  <DynamicIcon name="Phone" className="w-4 h-4 mr-2" size={16} />
                  {project.customerPhone}
                </div>
                <div className="flex items-center text-gray-600">
                  <DynamicIcon name="Mail" className="w-4 h-4 mr-2" size={16} />
                  {project.customerEmail}
                </div>
                <div className="flex items-center text-gray-600">
                  <DynamicIcon name="Zap" className="w-4 h-4 mr-2" size={16} />
                  {project.utilityTerritory.toUpperCase()}
                </div>
              </div>

              {/* Equipment & Incentive */}
              <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-green-800">Equipment</div>
                  <div className="text-xs text-green-600">{project.equipmentModel}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-800">Incentive</div>
                  <div className="text-lg font-bold text-green-700">
                    {formatCurrency(project.incentiveAmount)}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Created: {formatDate(project.createdDate)}</span>
                  {project.installationDate && (
                    <span>Install: {formatDate(project.installationDate)}</span>
                  )}
                </div>
              </div>

              {/* Next Step */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <DynamicIcon name="Clock" className="w-4 h-4 mr-2" size={16} />
                  <span className="font-medium">Next Step:</span>
                </div>
                <div className="text-sm text-blue-700 mt-1">{project.nextStep}</div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewProject(project.id)}
                  >
                    <DynamicIcon name="Eye" className="w-4 h-4 mr-1" size={16} />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <DynamicIcon name="Edit" className="w-4 h-4 mr-1" size={16} />
                    Edit
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <DynamicIcon name="Phone" className="w-4 h-4 mr-1" size={16} />
                    Call
                  </Button>
                  <Button size="sm" variant="outline">
                    <DynamicIcon name="Mail" className="w-4 h-4 mr-1" size={16} />
                    Email
                  </Button>
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
            <DynamicIcon name="Search" className="w-12 h-12 text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first TECH project'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <Button onClick={onCreateProject} className="bg-green-600 hover:bg-green-700">
                <DynamicIcon name="Plus" className="w-4 h-4 mr-2" size={16} />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Mock data for development
export const mockTechProjects: TechProject[] = [
  {
    id: 'TECH-001',
    customerName: 'Sarah Johnson',
    customerPhone: '(555) 123-4567',
    customerEmail: 'sarah.johnson@email.com',
    projectType: 'hvac',
    status: 'installation',
    utilityTerritory: 'pge',
    installationAddress: '123 Oak Street, San Francisco, CA 94102',
    equipmentModel: 'Carrier Infinity 25HNB6 Heat Pump',
    incentiveAmount: 8500,
    createdDate: '2024-01-15',
    installationDate: '2024-02-15',
    nextStep: 'Schedule installation and coordinate with customer',
    priority: 'high'
  },
  {
    id: 'TECH-002',
    customerName: 'Michael Chen',
    customerPhone: '(555) 987-6543',
    customerEmail: 'mchen@business.com',
    projectType: 'water_heater',
    status: 'documentation',
    utilityTerritory: 'sce',
    installationAddress: '456 Pine Avenue, Los Angeles, CA 90210',
    equipmentModel: 'Rheem ProTerra Heat Pump Water Heater',
    incentiveAmount: 3000,
    createdDate: '2024-01-10',
    installationDate: '2024-02-01',
    nextStep: 'Upload installation photos and complete quality checklist',
    priority: 'medium'
  },
  {
    id: 'TECH-003',
    customerName: 'Davis Family',
    customerPhone: '(555) 456-7890',
    customerEmail: 'davis.family@gmail.com',
    projectType: 'hvac',
    status: 'agreement',
    utilityTerritory: 'sdge',
    installationAddress: '789 Elm Drive, San Diego, CA 92101',
    equipmentModel: 'Lennox XP25 Heat Pump',
    incentiveAmount: 12000,
    createdDate: '2024-01-20',
    nextStep: 'Finalize customer agreement and schedule installation',
    priority: 'high'
  },
  {
    id: 'TECH-004',
    customerName: 'Robert Martinez',
    customerPhone: '(555) 321-0987',
    customerEmail: 'r.martinez@yahoo.com',
    projectType: 'hvac',
    status: 'incentive',
    utilityTerritory: 'pge',
    installationAddress: '321 Birch Lane, Oakland, CA 94601',
    equipmentModel: 'Trane XV20i Heat Pump',
    incentiveAmount: 9500,
    createdDate: '2024-01-05',
    installationDate: '2024-01-25',
    completedDate: '2024-01-28',
    nextStep: 'Track incentive processing with utility',
    priority: 'low'
  }
]