'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

interface TechProject {
  id: string
  customerName: string
  projectType: 'hvac' | 'water_heater' | 'weatherization'
  status: 'inquiry' | 'agreement' | 'installation' | 'documentation' | 'incentive' | 'complete'
  installationDate?: string
  incentiveAmount: number
  utilityTerritory: string
}

interface TechDashboardData {
  enrollmentStatus: 'active' | 'pending' | 'suspended'
  certificationLevel: 'basic' | 'advanced' | 'master'
  activeProjects: TechProject[]
  completedProjectsCount: number
  totalIncentivesEarned: number
  pendingIncentiveAmount: number
  nextCertificationRenewal: string
}

interface TechDashboardWidgetProps {
  data: TechDashboardData
  className?: string
}

const statusColors = {
  inquiry: 'bg-blue-100 text-blue-700',
  agreement: 'bg-yellow-100 text-yellow-700', 
  installation: 'bg-orange-100 text-orange-700',
  documentation: 'bg-purple-100 text-purple-700',
  incentive: 'bg-green-100 text-green-700',
  complete: 'bg-gray-100 text-gray-700'
}

const certificationColors = {
  basic: 'bg-blue-100 text-blue-700',
  advanced: 'bg-green-100 text-green-700',
  master: 'bg-purple-100 text-purple-700'
}

export function TechDashboardWidget({ data, className }: TechDashboardWidgetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'hvac': return 'Wind'
      case 'water_heater': return 'Droplets'
      case 'weatherization': return 'Home'
      default: return 'Settings'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inquiry': return 'MessageSquare'
      case 'agreement': return 'FileText'
      case 'installation': return 'Wrench'
      case 'documentation': return 'Camera'
      case 'incentive': return 'DollarSign'
      case 'complete': return 'CheckCircle'
      default: return 'Clock'
    }
  }

  return (
    <Card className={`bg-gradient-to-br from-green-50 to-blue-50 border-green-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DynamicIcon name="Zap" className="w-5 h-5 text-green-600" size={20} />
            <CardTitle className="text-lg text-green-800">TECH Clean California</CardTitle>
          </div>
          <Badge className={certificationColors[data.certificationLevel]}>
            {data.certificationLevel.charAt(0).toUpperCase() + data.certificationLevel.slice(1)} Certified
          </Badge>
        </div>
        <CardDescription className="text-green-700">
          Heat pump incentive program status and active projects
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-green-100">
            <div className="text-lg font-semibold text-green-700">{data.activeProjects.length}</div>
            <div className="text-xs text-green-600">Active Projects</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-green-100">
            <div className="text-lg font-semibold text-green-700">{data.completedProjectsCount}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-green-100">
            <div className="text-lg font-semibold text-green-700">{formatCurrency(data.pendingIncentiveAmount)}</div>
            <div className="text-xs text-green-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-green-100">
            <div className="text-lg font-semibold text-green-700">{formatCurrency(data.totalIncentivesEarned)}</div>
            <div className="text-xs text-green-600">Total Earned</div>
          </div>
        </div>

        {/* Active Projects */}
        {data.activeProjects.length > 0 && (
          <div>
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <DynamicIcon name="Activity" className="w-4 h-4 mr-2" size={16} />
              Recent Projects
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data.activeProjects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-100">
                  <div className="flex items-center space-x-2">
                    <DynamicIcon 
                      name={getProjectTypeIcon(project.projectType)} 
                      className="w-4 h-4 text-green-600" 
                      size={16} 
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.customerName}</div>
                      <div className="text-xs text-gray-600">{project.utilityTerritory.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${statusColors[project.status]}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                    <DynamicIcon 
                      name={getStatusIcon(project.status)} 
                      className="w-3 h-3 text-gray-500" 
                      size={12} 
                    />
                  </div>
                </div>
              ))}
            </div>
            {data.activeProjects.length > 3 && (
              <div className="text-center mt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/programs/tech-clean-california/projects">
                    View All {data.activeProjects.length} Projects
                    <DynamicIcon name="ArrowRight" className="w-3 h-3 ml-1" size={12} />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-green-100">
          <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
            <Link href="/programs/tech-clean-california/projects/new">
              <DynamicIcon name="Plus" className="w-4 h-4 mr-1" size={16} />
              New Project
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
            <Link href="/programs/tech-clean-california/incentives">
              <DynamicIcon name="DollarSign" className="w-4 h-4 mr-1" size={16} />
              Incentives
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
            <Link href="/programs/tech-clean-california">
              <DynamicIcon name="ExternalLink" className="w-4 h-4 mr-1" size={16} />
              Program
            </Link>
          </Button>
        </div>

        {/* Certification Renewal Reminder */}
        {data.nextCertificationRenewal && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100">
            <DynamicIcon name="AlertCircle" className="w-3 h-3 inline mr-1" size={12} />
            Certification renewal due: {new Date(data.nextCertificationRenewal).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Mock data for development
export const mockTechData: TechDashboardData = {
  enrollmentStatus: 'active',
  certificationLevel: 'advanced',
  activeProjects: [
    {
      id: 'TECH-001',
      customerName: 'Johnson Residence',
      projectType: 'hvac',
      status: 'installation',
      installationDate: '2024-02-15',
      incentiveAmount: 8500,
      utilityTerritory: 'pge'
    },
    {
      id: 'TECH-002', 
      customerName: 'Smith Commercial',
      projectType: 'water_heater',
      status: 'documentation',
      incentiveAmount: 3000,
      utilityTerritory: 'sce'
    },
    {
      id: 'TECH-003',
      customerName: 'Davis Home',
      projectType: 'hvac',
      status: 'agreement',
      incentiveAmount: 12000,
      utilityTerritory: 'sdge'
    }
  ],
  completedProjectsCount: 15,
  totalIncentivesEarned: 127500,
  pendingIncentiveAmount: 23500,
  nextCertificationRenewal: '2024-12-31'
}