'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import Link from 'next/link'

export default function NewProjectPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    deadline: '',
    requirements: '',
    qualifications: '',
    isPublic: true,
    allowBidding: true,
    requiresLicense: true,
    requiresInsurance: true,
    status: 'DRAFT'
  })

  const projectCategories = [
    { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
    { value: 'COMMERCIAL', label: 'Commercial Construction' },
    { value: 'RESIDENTIAL', label: 'Residential Construction' },
    { value: 'INDUSTRIAL', label: 'Industrial Construction' },
    { value: 'RENOVATION', label: 'Renovation & Remodeling' },
    { value: 'LANDSCAPING', label: 'Landscaping & Site Work' },
    { value: 'ELECTRICAL', label: 'Electrical Work' },
    { value: 'PLUMBING', label: 'Plumbing & HVAC' },
    { value: 'ROOFING', label: 'Roofing & Waterproofing' },
    { value: 'SPECIALTY', label: 'Specialty Trades' },
  ]

  const projectStatuses = [
    { value: 'DRAFT', label: 'Draft - Not Published' },
    { value: 'PUBLISHED', label: 'Published - Open for Applications' },
    { value: 'BIDDING_OPEN', label: 'Bidding Open' },
    { value: 'BIDDING_CLOSED', label: 'Bidding Closed' },
    { value: 'AWARDED', label: 'Project Awarded' },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // In real app, this would call API to create new project
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Creating new project:', formData)
      
      // Reset form after successful creation
      setFormData({
        title: '',
        description: '',
        category: '',
        budgetMin: '',
        budgetMax: '',
        location: '',
        contactEmail: '',
        contactPhone: '',
        deadline: '',
        requirements: '',
        qualifications: '',
        isPublic: true,
        allowBidding: true,
        requiresLicense: true,
        requiresInsurance: true,
        status: 'DRAFT'
      })
      
      alert('Project created successfully!')
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project. Please try again.')
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
                  <h1 className="text-2xl font-bold text-namc-gray-900">Create New Project</h1>
                  <p className="text-namc-gray-600">Post a new project opportunity for NAMC members</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" type="button">
                  <DynamicIcon name="Save" className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Basic information about the construction project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Oakland Bay Bridge Maintenance Project"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      placeholder="Detailed description of the project scope, objectives, and deliverables..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="category">Project Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Project Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projectStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Project Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Oakland, CA or specific address"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget & Timeline</CardTitle>
                  <CardDescription>
                    Financial and scheduling information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="budgetMin">Minimum Budget ($)</Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                        placeholder="2500000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budgetMax">Maximum Budget ($)</Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                        placeholder="3200000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deadline">Project Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                    />
                    <p className="text-sm text-namc-gray-600 mt-1">
                      Expected completion date for the project
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Project contact details for inquiries and applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="projects@namcnorcal.org"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+1 (415) 555-0123"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements & Qualifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements & Qualifications</CardTitle>
                  <CardDescription>
                    Specific requirements and qualifications for contractors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="requirements">Project Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      rows={4}
                      placeholder="List specific technical requirements, materials, equipment, or special considerations..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="qualifications">Contractor Qualifications</Label>
                    <Textarea
                      id="qualifications"
                      value={formData.qualifications}
                      onChange={(e) => handleInputChange('qualifications', e.target.value)}
                      rows={4}
                      placeholder="Required licenses, certifications, experience level, bonding requirements..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresLicense"
                        checked={formData.requiresLicense}
                        onCheckedChange={(checked) => handleInputChange('requiresLicense', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="requiresLicense" className="font-medium">
                          Requires Valid License
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Contractor must have valid state and local licenses
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresInsurance"
                        checked={formData.requiresInsurance}
                        onCheckedChange={(checked) => handleInputChange('requiresInsurance', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="requiresInsurance" className="font-medium">
                          Requires Insurance
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Contractor must provide proof of liability and workers' compensation insurance
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                  <CardDescription>
                    Configure project visibility and application settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => handleInputChange('isPublic', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="isPublic" className="font-medium">
                          Public Project
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Make this project visible to all NAMC members
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowBidding"
                        checked={formData.allowBidding}
                        onCheckedChange={(checked) => handleInputChange('allowBidding', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="allowBidding" className="font-medium">
                          Allow Competitive Bidding
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Enable contractors to submit competitive bids for this project
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-namc-blue-50 border border-namc-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <DynamicIcon name="Info" className="w-5 h-5 text-namc-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-namc-blue-900">Project Visibility</h4>
                        <p className="text-sm text-namc-blue-700 mt-1">
                          Public projects are visible to all NAMC members. Private projects are only visible 
                          to specific invited contractors. Draft projects are not visible until published.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-namc-gray-200">
                <Link href="/admin">
                  <Button type="button" variant="outline">
                    <DynamicIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                  >
                    <DynamicIcon name="Eye" className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.title || !formData.description || !formData.category}
                  >
                    {isLoading ? (
                      <>
                        <DynamicIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <DynamicIcon name="Building2" className="w-4 h-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminRequiredRoute>
  )
}