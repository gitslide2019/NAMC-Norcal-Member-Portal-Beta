'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar, 
  FileText,
  Edit,
  Save,
  X,
  ArrowLeft,
  Shield,
  TrendingUp,
  Users,
  MessageSquare,
  Tag,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ContractorDetail {
  id: string
  licenseNumber: string
  businessName: string
  dbaName?: string
  email?: string
  emailValidated: boolean
  emailConfidence?: number
  emailSource?: string
  emailValidationScore?: number
  emailValidationDate?: string
  emailIssues?: string
  emailType?: string
  phone?: string
  phoneValidated: boolean
  phoneConfidence?: number
  phoneSource?: string
  phoneType?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  county?: string
  coordinates?: { lat: number; lng: number }
  licenseStatus?: string
  licenseType?: string
  issueDate?: string
  expireDate?: string
  bondAmount?: string
  classifications: string[]
  primaryClassification?: string
  specialties: string[]
  businessType?: string
  yearsInBusiness?: number
  employeeCount?: string
  priorityScore?: number
  dataQualityScore?: number
  lastEnriched?: string
  enrichmentStatus?: string
  searchTerms: string[]
  notes?: string
  outreachStatus?: string
  lastContactDate?: string
  contactAttempts: number
  campaignTags: string[]
  leadScore?: number
  namcMemberId?: string
  isNamcMember: boolean
  membershipInterest?: string
  serviceRadius?: number
  marketAreas: string[]
  rawCslbData?: string
  createdAt: string
  updatedAt: string
  namcMember?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    memberSince: string
    isActive: boolean
  }
}

export default function ContractorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contractor, setContractor] = useState<ContractorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<Partial<ContractorDetail>>({})

  const contractorId = params.id as string

  useEffect(() => {
    fetchContractor()
  }, [contractorId])

  const fetchContractor = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/contractors/${contractorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContractor(data.data)
        setEditData(data.data)
      } else {
        console.error('Failed to fetch contractor')
      }
    } catch (error) {
      console.error('Error fetching contractor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!contractor) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/contractors/${contractorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const data = await response.json()
        setContractor(data.data)
        setEditing(false)
      } else {
        console.error('Failed to update contractor')
      }
    } catch (error) {
      console.error('Error updating contractor:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(contractor || {})
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-namc-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-namc-gray-200 rounded-lg"></div>
              <div className="h-64 bg-namc-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-namc-gray-200 rounded-lg"></div>
              <div className="h-48 bg-namc-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!contractor) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-namc-gray-900 mb-2">Contractor Not Found</h2>
        <p className="text-namc-gray-600 mb-6">The contractor you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/admin/contractors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contractors
          </Link>
        </Button>
      </div>
    )
  }

  const getOutreachStatusConfig = (status?: string) => {
    const configs = {
      'not_contacted': { variant: 'secondary' as const, label: 'Not Contacted', color: 'text-namc-gray-600' },
      'contacted': { variant: 'warning' as const, label: 'Contacted', color: 'text-namc-gold-600' },
      'replied': { variant: 'info' as const, label: 'Replied', color: 'text-namc-cyan-600' },
      'interested': { variant: 'success' as const, label: 'Interested', color: 'text-namc-green-600' },
      'not_interested': { variant: 'destructive' as const, label: 'Not Interested', color: 'text-namc-red-600' },
      'member': { variant: 'success' as const, label: 'Member', color: 'text-namc-green-600' },
    }
    return configs[status as keyof typeof configs] || configs.not_contacted
  }

  const getPriorityScoreColor = (score?: number) => {
    if (!score) return 'text-namc-gray-400'
    if (score >= 80) return 'text-namc-green-600'
    if (score >= 60) return 'text-namc-gold-600'
    if (score >= 40) return 'text-namc-orange-600'
    return 'text-namc-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/admin/contractors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-namc-gray-900">
              {contractor.businessName}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-namc-gray-600">License: {contractor.licenseNumber}</span>
              {contractor.dbaName && (
                <>
                  <span className="text-namc-gray-400">•</span>
                  <span className="text-namc-gray-600">DBA: {contractor.dbaName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-namc-gray-700">Business Name</label>
                  <div className="mt-1 text-sm text-namc-gray-900">{contractor.businessName}</div>
                </div>
                
                {contractor.dbaName && (
                  <div>
                    <label className="text-sm font-medium text-namc-gray-700">DBA Name</label>
                    <div className="mt-1 text-sm text-namc-gray-900">{contractor.dbaName}</div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-namc-gray-700">License Number</label>
                  <div className="mt-1 text-sm font-medium text-namc-blue-600">{contractor.licenseNumber}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-namc-gray-700">License Status</label>
                  <div className="mt-1">
                    <Badge variant={contractor.licenseStatus === 'Active' ? 'success' : 'secondary'}>
                      {contractor.licenseStatus || 'Unknown'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-namc-gray-700">License Type</label>
                  <div className="mt-1 text-sm text-namc-gray-900">{contractor.licenseType || 'N/A'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-namc-gray-700">Business Type</label>
                  <div className="mt-1 text-sm text-namc-gray-900">{contractor.businessType || 'N/A'}</div>
                </div>

                {contractor.yearsInBusiness && (
                  <div>
                    <label className="text-sm font-medium text-namc-gray-700">Years in Business</label>
                    <div className="mt-1 text-sm text-namc-gray-900">{contractor.yearsInBusiness} years</div>
                  </div>
                )}

                {contractor.employeeCount && (
                  <div>
                    <label className="text-sm font-medium text-namc-gray-700">Employee Count</label>
                    <div className="mt-1 text-sm text-namc-gray-900">{contractor.employeeCount}</div>
                  </div>
                )}
              </div>

              {/* Classifications */}
              {contractor.classifications.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-namc-gray-700 mb-2 block">Classifications</label>
                  <div className="flex flex-wrap gap-2">
                    {contractor.classifications.map((classification, index) => (
                      <Badge 
                        key={index} 
                        variant={classification === contractor.primaryClassification ? 'default' : 'secondary'}
                      >
                        {classification}
                        {classification === contractor.primaryClassification && ' (Primary)'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-namc-gray-700">Email Address</label>
                    {contractor.email && (
                      <div className="flex items-center space-x-2">
                        {contractor.emailValidated ? (
                          <CheckCircle className="w-4 h-4 text-namc-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-namc-gold-600" />
                        )}
                        <span className="text-xs text-namc-gray-500">
                          {contractor.emailValidated ? 'Validated' : 'Unvalidated'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {editing ? (
                    <Input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  ) : contractor.email ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-namc-gray-400" />
                        <a 
                          href={`mailto:${contractor.email}`}
                          className="text-namc-blue-600 hover:text-namc-blue-700"
                        >
                          {contractor.email}
                        </a>
                      </div>
                      
                      {contractor.emailConfidence && (
                        <div className="text-xs text-namc-gray-500">
                          Confidence: {contractor.emailConfidence}%
                          {contractor.emailSource && ` • Source: ${contractor.emailSource}`}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-namc-gray-400">No email address</div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-namc-gray-700">Phone Number</label>
                    {contractor.phone && (
                      <div className="flex items-center space-x-2">
                        {contractor.phoneValidated ? (
                          <CheckCircle className="w-4 h-4 text-namc-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-namc-gold-600" />
                        )}
                        <span className="text-xs text-namc-gray-500">
                          {contractor.phoneValidated ? 'Validated' : 'Unvalidated'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {editing ? (
                    <Input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  ) : contractor.phone ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-namc-gray-400" />
                        <a 
                          href={`tel:${contractor.phone}`}
                          className="text-namc-blue-600 hover:text-namc-blue-700"
                        >
                          {contractor.phone}
                        </a>
                      </div>
                      
                      {contractor.phoneConfidence && (
                        <div className="text-xs text-namc-gray-500">
                          Confidence: {contractor.phoneConfidence}%
                          {contractor.phoneSource && ` • Source: ${contractor.phoneSource}`}
                          {contractor.phoneType && ` • Type: ${contractor.phoneType}`}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-namc-gray-400">No phone number</div>
                  )}
                </div>
              </div>

              {/* Website */}
              {(contractor.website || editing) && (
                <div>
                  <label className="text-sm font-medium text-namc-gray-700 mb-2 block">Website</label>
                  {editing ? (
                    <Input
                      type="url"
                      value={editData.website || ''}
                      onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                      placeholder="Enter website URL"
                    />
                  ) : contractor.website ? (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-namc-gray-400" />
                      <a 
                        href={contractor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-namc-blue-600 hover:text-namc-blue-700 flex items-center"
                      >
                        {contractor.website}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-sm text-namc-gray-400">No website</div>
                  )}
                </div>
              )}

              {/* Address */}
              <div>
                <label className="text-sm font-medium text-namc-gray-700 mb-2 block">Address</label>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-namc-gray-400 mt-1" />
                  <div className="text-sm text-namc-gray-900">
                    {contractor.address && (
                      <div>{contractor.address}</div>
                    )}
                    <div>
                      {contractor.city}, {contractor.state} {contractor.zipCode}
                    </div>
                    {contractor.county && (
                      <div className="text-namc-gray-500">{contractor.county} County</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NAMC Member Information */}
          {contractor.isNamcMember && contractor.namcMember && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  NAMC Member Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-namc-gray-700">Member Name</label>
                    <div className="mt-1 text-sm text-namc-gray-900">
                      {contractor.namcMember.firstName} {contractor.namcMember.lastName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-namc-gray-700">Member Since</label>
                    <div className="mt-1 text-sm text-namc-gray-900">
                      {new Date(contractor.namcMember.memberSince).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-namc-gray-700">Member Email</label>
                    <div className="mt-1 text-sm text-namc-gray-900">
                      {contractor.namcMember.email}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-namc-gray-700">Status</label>
                    <div className="mt-1">
                      <Badge variant={contractor.namcMember.isActive ? 'success' : 'secondary'}>
                        {contractor.namcMember.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-namc-gray-600">Priority Score</span>
                <span className={cn("text-sm font-medium", getPriorityScoreColor(contractor.priorityScore))}>
                  {contractor.priorityScore ? `${contractor.priorityScore}/100` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-namc-gray-600">Data Quality</span>
                <span className={cn("text-sm font-medium", getPriorityScoreColor(contractor.dataQualityScore))}>
                  {contractor.dataQualityScore ? `${contractor.dataQualityScore}/100` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-namc-gray-600">Contact Attempts</span>
                <span className="text-sm font-medium text-namc-gray-900">
                  {contractor.contactAttempts}
                </span>
              </div>

              {contractor.leadScore && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-namc-gray-600">Lead Score</span>
                  <span className={cn("text-sm font-medium", getPriorityScoreColor(contractor.leadScore))}>
                    {contractor.leadScore}/100
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outreach Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Outreach Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-namc-gray-700 mb-2 block">Current Status</label>
                {editing ? (
                  <select
                    value={editData.outreachStatus || ''}
                    onChange={(e) => setEditData({ ...editData, outreachStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-namc-gray-300 rounded-md"
                  >
                    <option value="not_contacted">Not Contacted</option>
                    <option value="contacted">Contacted</option>
                    <option value="replied">Replied</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <Badge variant={getOutreachStatusConfig(contractor.outreachStatus).variant}>
                    {getOutreachStatusConfig(contractor.outreachStatus).label}
                  </Badge>
                )}
              </div>

              {contractor.lastContactDate && (
                <div>
                  <label className="text-sm font-medium text-namc-gray-700">Last Contact</label>
                  <div className="mt-1 text-sm text-namc-gray-900">
                    {new Date(contractor.lastContactDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-namc-gray-700 mb-2 block">Membership Interest</label>
                {editing ? (
                  <select
                    value={editData.membershipInterest || ''}
                    onChange={(e) => setEditData({ ...editData, membershipInterest: e.target.value })}
                    className="w-full px-3 py-2 border border-namc-gray-300 rounded-md"
                  >
                    <option value="">Unknown</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="none">None</option>
                  </select>
                ) : (
                  <Badge 
                    variant={
                      contractor.membershipInterest === 'high' ? 'success' :
                      contractor.membershipInterest === 'medium' ? 'warning' :
                      contractor.membershipInterest === 'low' ? 'secondary' :
                      'outline'
                    }
                  >
                    {contractor.membershipInterest ? 
                      contractor.membershipInterest.charAt(0).toUpperCase() + contractor.membershipInterest.slice(1) : 
                      'Unknown'
                    }
                  </Badge>
                )}
              </div>

              {/* Campaign Tags */}
              {contractor.campaignTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-namc-gray-700 mb-2 block">Campaign Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {contractor.campaignTags.map((tag, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-namc-gray-300 rounded-md"
                  rows={4}
                  placeholder="Add notes about this contractor..."
                />
              ) : contractor.notes ? (
                <p className="text-sm text-namc-gray-900 whitespace-pre-wrap">
                  {contractor.notes}
                </p>
              ) : (
                <p className="text-sm text-namc-gray-400">No notes available</p>
              )}
            </CardContent>
          </Card>

          {/* Data Enrichment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Data Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-namc-gray-600">Created:</span>
                <span className="text-namc-gray-900">
                  {new Date(contractor.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-namc-gray-600">Updated:</span>
                <span className="text-namc-gray-900">
                  {new Date(contractor.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {contractor.lastEnriched && (
                <div className="flex justify-between">
                  <span className="text-namc-gray-600">Last Enriched:</span>
                  <span className="text-namc-gray-900">
                    {new Date(contractor.lastEnriched).toLocaleDateString()}
                  </span>
                </div>
              )}

              {contractor.enrichmentStatus && (
                <div className="flex justify-between">
                  <span className="text-namc-gray-600">Status:</span>
                  <Badge variant="secondary" size="sm">
                    {contractor.enrichmentStatus}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}