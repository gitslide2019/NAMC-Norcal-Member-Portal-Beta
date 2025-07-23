'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  overview: {
    totalMembers: number
    activeMembers: number
    totalContractors: number
    contractorsWithEmail: number
    totalEvents: number
    upcomingEvents: number
    totalRevenue: number
    monthlyRevenue: number
  }
  trends: {
    memberGrowth: number
    contractorGrowth: number
    emailCoverage: number
    eventAttendance: number
  }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    user?: string
  }>
  topCounties: Array<{
    county: string
    count: number
    percentage: number
  }>
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setDashboardData({
        overview: {
          totalMembers: 487,
          activeMembers: 423,
          totalContractors: 1358,
          contractorsWithEmail: 864,
          totalEvents: 24,
          upcomingEvents: 6,
          totalRevenue: 125000,
          monthlyRevenue: 18500,
        },
        trends: {
          memberGrowth: 12.5,
          contractorGrowth: 8.3,
          emailCoverage: 63.6,
          eventAttendance: 85.2,
        },
        recentActivity: [
          {
            id: '1',
            type: 'member_joined',
            description: 'New member registration: Maria Gonzalez',
            timestamp: '2 hours ago',
            user: 'System',
          },
          {
            id: '2',
            type: 'contractor_enriched',
            description: 'Email discovered for ABC Construction (License: 123456)',
            timestamp: '4 hours ago',
            user: 'Enrichment Service',
          },
          {
            id: '3',
            type: 'event_registration',
            description: '15 new registrations for "Safety Training Workshop"',
            timestamp: '6 hours ago',
            user: 'Event System',
          },
          {
            id: '4',
            type: 'outreach_campaign',
            description: 'Email campaign sent to 250 contractors in Bay Area',
            timestamp: '1 day ago',
            user: 'Admin User',
          },
        ],
        topCounties: [
          { county: 'Los Angeles', count: 245, percentage: 18.1 },
          { county: 'San Diego', count: 189, percentage: 13.9 },
          { county: 'Orange', count: 156, percentage: 11.5 },
          { county: 'Riverside', count: 134, percentage: 9.9 },
          { county: 'San Bernardino', count: 121, percentage: 8.9 },
        ],
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-namc-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-namc-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-namc-gray-900">Dashboard</h1>
          <p className="text-namc-gray-600">
            Welcome to the NAMC NorCal admin dashboard. Monitor your platform performance and contractor outreach.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/analytics">
              <Activity className="w-4 h-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/contractors">
              <Building2 className="w-4 h-4 mr-2" />
              Manage Contractors
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-namc-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-namc-gray-900">
                  {dashboardData.overview.totalMembers.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-namc-green-600 mr-1" />
                  <span className="text-sm text-namc-green-600 font-medium">
                    +{dashboardData.trends.memberGrowth}%
                  </span>
                  <span className="text-sm text-namc-gray-500 ml-2">this month</span>
                </div>
              </div>
              <div className="p-3 bg-namc-blue-100 rounded-full">
                <Users className="w-6 h-6 text-namc-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-namc-gray-600">CA Contractors</p>
                <p className="text-3xl font-bold text-namc-gray-900">
                  {dashboardData.overview.totalContractors.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-namc-green-600 mr-1" />
                  <span className="text-sm text-namc-green-600 font-medium">
                    +{dashboardData.trends.contractorGrowth}%
                  </span>
                  <span className="text-sm text-namc-gray-500 ml-2">enriched</span>
                </div>
              </div>
              <div className="p-3 bg-namc-gold-100 rounded-full">
                <Building2 className="w-6 h-6 text-namc-gold-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-namc-gray-600">Email Coverage</p>
                <p className="text-3xl font-bold text-namc-gray-900">
                  {dashboardData.trends.emailCoverage}%
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-namc-gray-600">
                    {dashboardData.overview.contractorsWithEmail.toLocaleString()} contacts
                  </span>
                </div>
              </div>
              <div className="p-3 bg-namc-green-100 rounded-full">
                <Mail className="w-6 h-6 text-namc-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-namc-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-namc-gray-900">
                  ${(dashboardData.overview.monthlyRevenue / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-namc-gray-600">
                    ${(dashboardData.overview.totalRevenue / 1000).toFixed(0)}K total
                  </span>
                </div>
              </div>
              <div className="p-3 bg-namc-red-100 rounded-full">
                <DollarSign className="w-6 h-6 text-namc-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/activity">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg border border-namc-gray-200 hover:bg-namc-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      {activity.type === 'member_joined' && (
                        <div className="p-2 bg-namc-blue-100 rounded-full">
                          <Users className="w-4 h-4 text-namc-blue-600" />
                        </div>
                      )}
                      {activity.type === 'contractor_enriched' && (
                        <div className="p-2 bg-namc-green-100 rounded-full">
                          <Building2 className="w-4 h-4 text-namc-green-600" />
                        </div>
                      )}
                      {activity.type === 'event_registration' && (
                        <div className="p-2 bg-namc-gold-100 rounded-full">
                          <Calendar className="w-4 h-4 text-namc-gold-600" />
                        </div>
                      )}
                      {activity.type === 'outreach_campaign' && (
                        <div className="p-2 bg-namc-red-100 rounded-full">
                          <Mail className="w-4 h-4 text-namc-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-namc-gray-900">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-namc-gray-500">{activity.timestamp}</span>
                        {activity.user && (
                          <>
                            <span className="text-xs text-namc-gray-400">•</span>
                            <span className="text-xs text-namc-gray-500">{activity.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Counties */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Counties</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/contractors?view=geographic">
                    <MapPin className="w-4 h-4 mr-2" />
                    View Map
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topCounties.map((county, index) => (
                  <div key={county.county} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-namc-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-namc-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-namc-gray-900">
                          {county.county}
                        </p>
                        <p className="text-xs text-namc-gray-500">
                          {county.percentage}% of total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-namc-gray-900">
                        {county.count.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/contractors/export">
                    <Download className="w-4 h-4 mr-2" />
                    Export Contractor Data
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/outreach/new">
                    <Mail className="w-4 h-4 mr-2" />
                    Create Outreach Campaign
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/events/new">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule New Event
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/reports">
                    <Activity className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}