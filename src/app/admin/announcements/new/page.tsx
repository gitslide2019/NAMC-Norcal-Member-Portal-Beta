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

export default function NewAnnouncementPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'NORMAL',
    audience: 'ALL_MEMBERS',
    category: 'GENERAL',
    scheduledDate: '',
    scheduledTime: '',
    includeUnsubscribed: false,
    sendImmediately: true,
    requiresReadConfirmation: false,
    allowReplies: false,
    attachments: [] as File[],
    status: 'DRAFT'
  })

  const priorityOptions = [
    { value: 'LOW', label: 'Low Priority' },
    { value: 'NORMAL', label: 'Normal Priority' },
    { value: 'HIGH', label: 'High Priority' },
    { value: 'URGENT', label: 'Urgent' },
  ]

  const audienceOptions = [
    { value: 'ALL_MEMBERS', label: 'All Members' },
    { value: 'PREMIUM_MEMBERS', label: 'Premium Members Only' },
    { value: 'NEW_MEMBERS', label: 'New Members (Last 30 days)' },
    { value: 'ACTIVE_MEMBERS', label: 'Active Members' },
    { value: 'INACTIVE_MEMBERS', label: 'Inactive Members' },
    { value: 'SPECIFIC_GROUP', label: 'Specific Group' },
  ]

  const categoryOptions = [
    { value: 'GENERAL', label: 'General Announcement' },
    { value: 'EVENT', label: 'Event Notification' },
    { value: 'PROJECT', label: 'Project Update' },
    { value: 'POLICY', label: 'Policy Change' },
    { value: 'TRAINING', label: 'Training Opportunity' },
    { value: 'SAFETY', label: 'Safety Alert' },
    { value: 'MEMBERSHIP', label: 'Membership Update' },
    { value: 'NEWSLETTER', label: 'Newsletter' },
    { value: 'EMERGENCY', label: 'Emergency Notice' },
  ]

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft - Not Sent' },
    { value: 'SCHEDULED', label: 'Scheduled for Later' },
    { value: 'SENT', label: 'Send Immediately' },
  ]

  const handleInputChange = (field: string, value: string | boolean | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // In real app, this would call API to create/send announcement
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Creating announcement:', formData)
      
      // Reset form after successful creation
      setFormData({
        subject: '',
        message: '',
        priority: 'NORMAL',
        audience: 'ALL_MEMBERS',
        category: 'GENERAL',
        scheduledDate: '',
        scheduledTime: '',
        includeUnsubscribed: false,
        sendImmediately: true,
        requiresReadConfirmation: false,
        allowReplies: false,
        attachments: [],
        status: 'DRAFT'
      })
      
      if (formData.sendImmediately) {
        alert('Announcement sent successfully!')
      } else {
        alert('Announcement saved successfully!')
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
      alert('Error creating announcement. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const estimatedRecipients = () => {
    // Mock recipient count based on audience selection
    switch (formData.audience) {
      case 'ALL_MEMBERS': return 245
      case 'PREMIUM_MEMBERS': return 156
      case 'NEW_MEMBERS': return 23
      case 'ACTIVE_MEMBERS': return 189
      case 'INACTIVE_MEMBERS': return 56
      case 'SPECIFIC_GROUP': return 45
      default: return 0
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
                  <h1 className="text-2xl font-bold text-namc-gray-900">Send Announcement</h1>
                  <p className="text-namc-gray-600">Broadcast message to NAMC members</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-namc-gray-600">
                  Recipients: <span className="font-semibold">{estimatedRecipients()}</span>
                </div>
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
              {/* Message Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Message Details</CardTitle>
                  <CardDescription>
                    Compose your announcement message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="subject">Subject Line *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Important Update: New Safety Training Requirements"
                      required
                      maxLength={100}
                    />
                    <p className="text-sm text-namc-gray-600 mt-1">
                      {formData.subject.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="message">Message Content *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={12}
                      placeholder="Dear NAMC Members,&#10;&#10;We are pleased to announce...&#10;&#10;Please note that...&#10;&#10;For more information, contact us at...&#10;&#10;Best regards,&#10;NAMC NorCal Team"
                      required
                    />
                    <p className="text-sm text-namc-gray-600 mt-1">
                      Use clear, professional language. Include all necessary details and contact information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value) => handleInputChange('priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label htmlFor="status">Send Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>
                </CardContent>
              </Card>

              {/* Audience Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Audience Selection</CardTitle>
                  <CardDescription>
                    Choose who will receive this announcement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select 
                      value={formData.audience} 
                      onValueChange={(value) => handleInputChange('audience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {audienceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-namc-gray-600 mt-1">
                      Estimated recipients: <span className="font-semibold">{estimatedRecipients()} members</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeUnsubscribed"
                        checked={formData.includeUnsubscribed}
                        onCheckedChange={(checked) => handleInputChange('includeUnsubscribed', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="includeUnsubscribed" className="font-medium">
                          Include Unsubscribed Members
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Send to members who have opted out of regular emails (use sparingly)
                        </p>
                      </div>
                    </div>
                  </div>

                  {formData.audience === 'SPECIFIC_GROUP' && (
                    <div className="bg-namc-blue-50 border border-namc-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <DynamicIcon name="Info" className="w-5 h-5 text-namc-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-namc-blue-900">Specific Group Selection</h4>
                          <p className="text-sm text-namc-blue-700 mt-1">
                            In the full implementation, you would be able to select specific member groups, 
                            committees, or upload a custom recipient list.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                  <CardDescription>
                    Configure when and how the announcement is sent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendImmediately"
                        checked={formData.sendImmediately}
                        onCheckedChange={(checked) => handleInputChange('sendImmediately', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="sendImmediately" className="font-medium">
                          Send Immediately
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Send the announcement right after creation
                        </p>
                      </div>
                    </div>
                  </div>

                  {!formData.sendImmediately && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scheduledTime">Scheduled Time</Label>
                        <Input
                          id="scheduledTime"
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiresReadConfirmation"
                        checked={formData.requiresReadConfirmation}
                        onCheckedChange={(checked) => handleInputChange('requiresReadConfirmation', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="requiresReadConfirmation" className="font-medium">
                          Require Read Confirmation
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Track who has read this announcement (for important updates)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowReplies"
                        checked={formData.allowReplies}
                        onCheckedChange={(checked) => handleInputChange('allowReplies', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="allowReplies" className="font-medium">
                          Allow Replies
                        </Label>
                        <p className="text-sm text-namc-gray-600">
                          Members can reply to this announcement via email
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                  <CardDescription>
                    Add files to include with the announcement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="attachments">Upload Files</Label>
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <p className="text-sm text-namc-gray-600 mt-1">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF. Max 10MB per file.
                    </p>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-namc-gray-900 mb-2">Attached Files</h4>
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-namc-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <DynamicIcon name="Paperclip" className="w-4 h-4 text-namc-gray-600" />
                              <div>
                                <p className="text-sm font-medium text-namc-gray-900">{file.name}</p>
                                <p className="text-xs text-namc-gray-600">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <DynamicIcon name="X" className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview & Warnings */}
              <Card>
                <CardHeader>
                  <CardTitle>Review & Send</CardTitle>
                  <CardDescription>
                    Review your announcement before sending
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-namc-yellow-50 border border-namc-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <DynamicIcon name="AlertTriangle" className="w-5 h-5 text-namc-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-namc-yellow-900">Important Reminders</h4>
                        <ul className="text-sm text-namc-yellow-700 mt-1 list-disc list-inside space-y-1">
                          <li>Double-check all recipient counts and audience selection</li>
                          <li>Proofread your message for spelling and grammar</li>
                          <li>Include clear contact information for follow-up questions</li>
                          <li>Test any links included in your message</li>
                          <li>Consider the timing of your announcement</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {formData.priority === 'URGENT' && (
                    <div className="bg-namc-red-50 border border-namc-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <DynamicIcon name="AlertCircle" className="w-5 h-5 text-namc-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-namc-red-900">Urgent Announcement</h4>
                          <p className="text-sm text-namc-red-700 mt-1">
                            This announcement is marked as URGENT and will be prominently displayed to all recipients. 
                            Please ensure this priority level is appropriate for your message.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                    disabled={isLoading || !formData.subject || !formData.message}
                    className={formData.sendImmediately ? 'bg-namc-red-600 hover:bg-namc-red-700' : ''}
                  >
                    {isLoading ? (
                      <>
                        <DynamicIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        {formData.sendImmediately ? 'Sending...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <DynamicIcon name={formData.sendImmediately ? "Send" : "Save"} className="w-4 h-4 mr-2" />
                        {formData.sendImmediately ? `Send to ${estimatedRecipients()} Members` : 'Save Announcement'}
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