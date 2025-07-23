'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, Column } from '@/components/ui/data-table'
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp,
  Download,
  Filter,
  Eye,
  Edit,
  Plus,
  Search,
  Globe
} from 'lucide-react'

// Mock data structure - replace with actual API calls
interface Contractor {
  id: string
  licenseNumber: string
  businessName: string
  dbaName?: string
  email?: string
  emailValidated: boolean
  emailConfidence?: number
  phone?: string
  phoneValidated: boolean
  city?: string
  county?: string
  state?: string
  zipCode?: string
  licenseStatus?: string
  licenseType?: string
  primaryClassification?: string
  classifications: string[]
  priorityScore?: number
  dataQualityScore?: number
  outreachStatus?: string
  lastContactDate?: string
  contactAttempts: number
  isNamcMember: boolean
  membershipInterest?: string
  createdAt: string
  updatedAt: string
}

interface ContractorAnalytics {
  overview: {
    totalContractors: number
    contractorsWithEmail: number
    contractorsWithPhone: number
    contractorsWithBoth: number
    validatedEmails: number
    validatedPhones: number
    namcMembers: number
  }
  metrics: {
    emailCoverage: number
    phoneCoverage: number
    bothContactsCoverage: number
    emailValidationRate: number
    phoneValidationRate: number
    memberConversionRate: number
  }
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [analytics, setAnalytics] = useState<ContractorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [sortColumn, setSortColumn] = useState<keyof Contractor>('businessName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState({
    city: '',
    county: '',
    classification: '',
    licenseStatus: '',
    hasEmail: '',
    hasPhone: '',
    outreachStatus: '',
  })

  // Fetch contractors data
  const fetchContractors = useCallback(async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchValue,
        sortBy: sortColumn,
        sortOrder: sortDirection,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== '')),
      })

      // Mock API call - replace with actual API
      const response = await fetch(`/api/admin/contractors?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Replace with proper auth
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContractors(data.data || [])
        setPagination(data.pagination || pagination)
      }
    } catch (error) {
      console.error('Error fetching contractors:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchValue, sortColumn, sortDirection, filters])

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/admin/contractors/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Replace with proper auth
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }, [])

  useEffect(() => {
    fetchContractors()
  }, [fetchContractors])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Table columns configuration
  const columns: Column<Contractor>[] = [
    {
      key: 'licenseNumber',
      label: 'License #',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium text-namc-blue-600">
          {value}
        </div>
      ),
    },
    {
      key: 'businessName',
      label: 'Business Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-namc-gray-900">{value}</div>
          {row.dbaName && (
            <div className="text-sm text-namc-gray-500">DBA: {row.dbaName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (value, row) => (
        <div className="space-y-1">
          {row.email ? (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-namc-gray-400" />
              <span className="text-sm">{row.email}</span>
              {row.emailValidated && (
                <Badge variant="success" size="sm">Verified</Badge>
              )}
            </div>
          ) : (
            <div className="text-sm text-namc-gray-400">No email</div>
          )}
          
          {row.phone ? (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-namc-gray-400" />
              <span className="text-sm">{row.phone}</span>
              {row.phoneValidated && (
                <Badge variant="success" size="sm">Verified</Badge>
              )}
            </div>
          ) : (
            <div className="text-sm text-namc-gray-400">No phone</div>
          )}
        </div>
      ),
    },
    {
      key: 'city',
      label: 'Location',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-namc-gray-400" />
          <span className="text-sm">
            {row.city}, {row.state} {row.zipCode}
          </span>
        </div>
      ),
    },
    {
      key: 'primaryClassification',
      label: 'Classification',
      render: (value, row) => (
        <div>
          {value && (
            <Badge variant="secondary" size="sm">{value}</Badge>
          )}
          {row.classifications.length > 1 && (
            <div className="text-xs text-namc-gray-500 mt-1">
              +{row.classifications.length - 1} more
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'outreachStatus',
      label: 'Outreach',
      render: (value, row) => {
        const statusConfig = {
          'not_contacted': { variant: 'secondary' as const, label: 'Not Contacted' },
          'contacted': { variant: 'warning' as const, label: 'Contacted' },
          'replied': { variant: 'info' as const, label: 'Replied' },
          'interested': { variant: 'success' as const, label: 'Interested' },
          'not_interested': { variant: 'destructive' as const, label: 'Not Interested' },
          'member': { variant: 'success' as const, label: 'Member' },
        }
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.not_contacted
        
        return (
          <div>
            <Badge variant={config.variant} size="sm">
              {config.label}
            </Badge>
            {row.contactAttempts > 0 && (
              <div className="text-xs text-namc-gray-500 mt-1">
                {row.contactAttempts} attempts
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'priorityScore',
      label: 'Priority',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-namc-gray-400">-</span>
        
        const getScoreColor = (score: number) => {
          if (score >= 80) return 'text-namc-green-600'
          if (score >= 60) return 'text-namc-gold-600'
          if (score >= 40) return 'text-namc-orange-600'
          return 'text-namc-red-600'
        }
        
        return (
          <div className={`font-medium ${getScoreColor(value)}`}>
            {value}/100
          </div>
        )
      },
    },
  ]

  // Table actions
  const actions = [
    {
      label: 'View',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: Contractor) => {
        // Navigate to contractor detail view
        window.location.href = `/admin/contractors/${row.id}`
      },
    },
    {
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: (row: Contractor) => {
        // Open edit modal or navigate to edit page
        console.log('Edit contractor:', row.id)
      },
    },
  ]

  // Bulk actions
  const bulkActions = [
    {
      label: 'Export Selected',
      icon: <Download className="w-4 h-4" />,
      onClick: (rows: Contractor[]) => {
        console.log('Export selected contractors:', rows.map(r => r.id))
      },
    },
    {
      label: 'Mark as Contacted',
      icon: <Mail className="w-4 h-4" />,
      onClick: (rows: Contractor[]) => {
        console.log('Mark as contacted:', rows.map(r => r.id))
      },
    },
  ]

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle sort
  const handleSort = (column: keyof Contractor, direction: 'asc' | 'desc') => {
    setSortColumn(column)
    setSortDirection(direction)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // Export data
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        search: searchValue,
        format: 'csv',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== '')),
      })

      const response = await fetch(`/api/admin/contractors/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `namc-contractors-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-namc-gray-900">California Contractors</h1>
          <p className="text-namc-gray-600">
            Manage and analyze the CSLB contractor database with contact enrichment data
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Contractor
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Total Contractors</p>
                  <p className="text-3xl font-bold text-namc-gray-900">
                    {analytics.overview.totalContractors.toLocaleString()}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-namc-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Email Coverage</p>
                  <p className="text-3xl font-bold text-namc-gray-900">
                    {analytics.metrics.emailCoverage}%
                  </p>
                  <p className="text-sm text-namc-gray-500">
                    {analytics.overview.contractorsWithEmail.toLocaleString()} contacts
                  </p>
                </div>
                <Mail className="w-8 h-8 text-namc-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Phone Coverage</p>
                  <p className="text-3xl font-bold text-namc-gray-900">
                    {analytics.metrics.phoneCoverage}%
                  </p>
                  <p className="text-sm text-namc-gray-500">
                    {analytics.overview.contractorsWithPhone.toLocaleString()} contacts
                  </p>
                </div>
                <Phone className="w-8 h-8 text-namc-gold-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">NAMC Members</p>
                  <p className="text-3xl font-bold text-namc-gray-900">
                    {analytics.overview.namcMembers.toLocaleString()}
                  </p>
                  <p className="text-sm text-namc-gray-500">
                    {analytics.metrics.memberConversionRate}% conversion
                  </p>
                </div>
                <Users className="w-8 h-8 text-namc-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={contractors}
        columns={columns}
        pagination={pagination}
        loading={loading}
        searchValue={searchValue}
        onSearch={handleSearch}
        onSort={handleSort}
        onPageChange={handlePageChange}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        actions={actions}
        bulkActions={bulkActions}
        title="Contractor Database"
        description="Search, filter, and manage California contractors with enriched contact data"
        exportButton={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        }
        filters={
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        }
      />
    </div>
  )
}