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

export default function NewEventPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    address: '',
    maxCapacity: '',
    price: '',
    memberPrice: '',
    requirements: '',
    agenda: '',
    isPublic: true,
    requiresRegistration: true,
    allowWaitlist: true,
    sendReminders: true,
    status: 'DRAFT'
  })

  const eventTypes = [
    { value: 'NETWORKING', label: 'Networking Event' },
    { value: 'TRAINING', label: 'Training Workshop' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'WEBINAR', label: 'Webinar' },
    { value: 'MEETING', label: 'General Meeting' },
    { value: 'SOCIAL', label: 'Social Event' },
    { value: 'FUNDRAISER', label: 'Fundraiser' },
    { value: 'CERTIFICATION', label: 'Certification Course' },
    { value: 'OTHER', label: 'Other' },
  ]

  const eventStatuses = [
    { value: 'DRAFT', label: 'Draft - Not Published' },
    { value: 'PUBLISHED', label: 'Published - Open for Registration' },
    { value: 'REGISTRATION_CLOSED', label: 'Registration Closed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' },
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
      // In real app, this would call API to create new event
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Creating new event:', formData)
      
      // Reset form after successful creation
      setFormData({
        title: '',
        description: '',
        type: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        address: '',
        maxCapacity: '',
        price: '',
        memberPrice: '',
        requirements: '',
        agenda: '',
        isPublic: true,
        requiresRegistration: true,
        allowWaitlist: true,
        sendReminders: true,
        status: 'DRAFT'
      })
      
      alert('Event created successfully!')
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Error creating event. Please try again.')
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
                  <h1 className="text-2xl font-bold text-namc-gray-900">Schedule New Event</h1>
                  <p className="text-namc-gray-600">Create a new networking event or workshop</p>
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
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>
                    Basic information about the event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Safety Training Workshop - Fall Protection"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Event Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      placeholder="Detailed description of the event, including objectives, target audience, and key takeaways..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="type">Event Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => handleInputChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Event Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {eventStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Date & Time</CardTitle>
                  <CardDescription>
                    When the event will take place
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                      />
                      <p className="text-sm text-namc-gray-600 mt-1">
                        Leave blank if single-day event
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>
                    Where the event will take place
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="location">Venue Name</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="NAMC NorCal Office, Conference Room A"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street, San Francisco, CA 94102"
                    />
                  </div>

                  <div className="bg-namc-blue-50 border border-namc-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <DynamicIcon name="Info" className="w-5 h-5 text-namc-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-namc-blue-900">Virtual Events</h4>
                        <p className="text-sm text-namc-blue-700 mt-1">
                          For virtual events, enter the platform name (e.g., "Zoom", "Microsoft Teams") 
                          in the venue field. Meeting links will be sent to registered attendees.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capacity & Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Capacity & Pricing</CardTitle>
                  <CardDescription>
                    Event capacity and registration fees
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={formData.maxCapacity}
                      onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                      placeholder="50"
                    />
                    <p className="text-sm text-namc-gray-600 mt-1">
                      Leave blank for unlimited capacity
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="price">General Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="25.00"
                      />
                      <p className="text-sm text-namc-gray-600 mt-1">
                        Enter 0 for free events
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="memberPrice">NAMC Member Price ($)</Label>
                      <Input
                        id="memberPrice"
                        type="number"
                        step="0.01"
                        value={formData.memberPrice}
                        onChange={(e) => handleInputChange('memberPrice', e.target.value)}
                        placeholder="15.00"
                      />
                      <p className="text-sm text-namc-gray-600 mt-1">
                        Discounted price for NAMC members
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Content</CardTitle>
                  <CardDescription>
                    Additional information for attendees
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="agenda">Event Agenda</Label>
                    <Textarea
                      id="agenda"
                      value={formData.agenda}
                      onChange={(e) => handleInputChange('agenda', e.target.value)}
                      rows={5}
                      placeholder="9:00 AM - Registration and Coffee&#10;9:30 AM - Opening Remarks&#10;10:00 AM - Keynote Presentation&#10;11:00 AM - Break&#10;11:15 AM - Workshop Session&#10;12:00 PM - Lunch and Networking"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements & Preparation</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      rows={3}
                      placeholder="Please bring a laptop, notebook, and safety equipment if applicable..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Event Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Settings</CardTitle>
                  <CardDescription>
                    Configure event visibility and registration settings
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
                          Public Event
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Make this event visible to all NAMC members
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresRegistration"
                        checked={formData.requiresRegistration}
                        onCheckedChange={(checked) => handleInputChange('requiresRegistration', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="requiresRegistration" className="font-medium">
                          Requires Registration
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Members must register to attend this event
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowWaitlist"
                        checked={formData.allowWaitlist}
                        onCheckedChange={(checked) => handleInputChange('allowWaitlist', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="allowWaitlist" className="font-medium">
                          Allow Waitlist
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Allow members to join a waitlist when the event is full
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendReminders"
                        checked={formData.sendReminders}
                        onCheckedChange={(checked) => handleInputChange('sendReminders', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="sendReminders" className="font-medium">
                          Send Reminders
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Automatically send email reminders to registered attendees
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-namc-yellow-50 border border-namc-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <DynamicIcon name="AlertTriangle" className="w-5 h-5 text-namc-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-namc-yellow-900">Event Publishing</h4>
                        <p className="text-sm text-namc-yellow-700 mt-1">
                          Events saved as "Draft" are not visible to members. Change status to "Published" 
                          to make the event available for registration. You can edit event details even after publishing.
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
                    disabled={isLoading || !formData.title || !formData.description || !formData.type || !formData.startDate || !formData.startTime}
                  >
                    {isLoading ? (
                      <>
                        <DynamicIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      <>
                        <DynamicIcon name="Calendar" className="w-4 h-4 mr-2" />
                        Create Event
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