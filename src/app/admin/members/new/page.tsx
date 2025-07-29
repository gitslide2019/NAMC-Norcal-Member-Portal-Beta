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

export default function NewMemberPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    bio: '',
    website: '',
    linkedIn: '',
    address: '',
    memberType: 'REGULAR',
    isActive: true,
    sendWelcomeEmail: true,
    autoEnrollEvents: false,
  })

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
      // In real app, this would call API to create new member
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Creating new member:', formData)
      
      // Reset form after successful creation
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        title: '',
        bio: '',
        website: '',
        linkedIn: '',
        address: '',
        memberType: 'REGULAR',
        isActive: true,
        sendWelcomeEmail: true,
        autoEnrollEvents: false,
      })
      
      alert('Member created successfully!')
    } catch (error) {
      console.error('Error creating member:', error)
      alert('Error creating member. Please try again.')
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
                  <h1 className="text-2xl font-bold text-namc-gray-900">Add New Member</h1>
                  <p className="text-namc-gray-600">Manually register a new NAMC member</p>
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
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Basic personal and contact information for the new member
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main St, San Francisco, CA 94102"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Company and professional details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="General Contractor"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      placeholder="Brief description of professional background and expertise..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="website">Company Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                      <Input
                        id="linkedIn"
                        type="url"
                        value={formData.linkedIn}
                        onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Configure member account permissions and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="memberType">Member Type</Label>
                    <Select 
                      value={formData.memberType} 
                      onValueChange={(value) => handleInputChange('memberType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REGULAR">Regular Member</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-namc-gray-600 mt-1">
                      Administrator accounts have full system access
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="isActive" className="font-medium">
                          Active Account
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Allow this member to log in and access the portal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendWelcomeEmail"
                        checked={formData.sendWelcomeEmail}
                        onCheckedChange={(checked) => handleInputChange('sendWelcomeEmail', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="sendWelcomeEmail" className="font-medium">
                          Send Welcome Email
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Send account setup instructions to the member's email
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoEnrollEvents"
                        checked={formData.autoEnrollEvents}
                        onCheckedChange={(checked) => handleInputChange('autoEnrollEvents', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="autoEnrollEvents" className="font-medium">
                          Auto-enroll in Public Events
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Automatically register for upcoming public events
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>
                    Optional fields for enhanced member profiles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-namc-blue-50 border border-namc-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <DynamicIcon name="Info" className="w-5 h-5 text-namc-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-namc-blue-900">Member Verification</h4>
                        <p className="text-sm text-namc-blue-700 mt-1">
                          Members created manually by administrators are automatically verified. 
                          They will receive a welcome email with instructions to set their password.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-namc-yellow-50 border border-namc-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <DynamicIcon name="AlertTriangle" className="w-5 h-5 text-namc-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-namc-yellow-900">Important Notes</h4>
                        <ul className="text-sm text-namc-yellow-700 mt-1 list-disc list-inside space-y-1">
                          <li>Email addresses must be unique in the system</li>
                          <li>Administrator accounts have full system access</li>
                          <li>Members can update their own profiles after account creation</li>
                          <li>All new members are subject to NAMC membership requirements</li>
                        </ul>
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
                    disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email}
                  >
                    {isLoading ? (
                      <>
                        <DynamicIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Creating Member...
                      </>
                    ) : (
                      <>
                        <DynamicIcon name="UserPlus" className="w-4 h-4 mr-2" />
                        Create Member
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