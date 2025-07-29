'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

const settingsSections = [
  { id: 'profile', name: 'Profile Information', icon: 'User' },
  { id: 'account', name: 'Account Settings', icon: 'Settings' },
  { id: 'notifications', name: 'Notifications', icon: 'Bell' },
  { id: 'privacy', name: 'Privacy & Security', icon: 'Shield' },
  { id: 'billing', name: 'Billing & Subscription', icon: 'CreditCard' },
  { id: 'preferences', name: 'Preferences', icon: 'Sliders' },
]

const mockUserProfile = {
  firstName: 'Maria',
  lastName: 'Johnson',
  email: 'maria.johnson@example.com',
  phone: '+1 (555) 123-4567',
  company: 'Johnson Construction LLC',
  title: 'General Contractor',
  bio: 'Experienced general contractor specializing in residential and commercial construction projects in the Bay Area.',
  website: 'https://johnsonconstruction.com',
  linkedIn: 'https://linkedin.com/in/maria-johnson-contractor',
  address: '123 Construction Ave, San Francisco, CA 94102',
  timezone: 'America/Los_Angeles',
  language: 'en',
}

const mockNotificationSettings = {
  emailNotifications: {
    newProjects: true,
    eventReminders: true,
    messages: true,
    weeklyDigest: false,
    marketing: false,
  },
  pushNotifications: {
    newProjects: true,
    messages: true,
    eventReminders: true,
  },
  smsNotifications: {
    urgentMessages: false,
    eventReminders: false,
  }
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState(mockUserProfile)
  const [notifications, setNotifications] = useState(mockNotificationSettings)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // In real app, this would call API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Profile updated:', profile)
      // Update auth context
      updateUser({
        firstName: profile.firstName,
        lastName: profile.lastName,
      })
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      // In real app, this would call API to update notification settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Notifications updated:', notifications)
    } catch (error) {
      console.error('Error updating notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    setIsLoading(true)
    try {
      // In real app, this would call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="linkedIn">LinkedIn Profile</Label>
            <Input
              id="linkedIn"
              value={profile.linkedIn}
              onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleSaveProfile} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderAccountSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Account Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={profile.timezone} onValueChange={(value) => setProfile({ ...profile, timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={profile.language} onValueChange={(value) => setProfile({ ...profile, language: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={isLoading}>
            {isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4 text-red-600">Danger Zone</h3>
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-namc-gray-900">Delete Account</h4>
                <p className="text-sm text-namc-gray-600 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive" className="ml-4">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.emailNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`email-${key}`}
                checked={value}
                onCheckedChange={(checked) => 
                  setNotifications({
                    ...notifications,
                    emailNotifications: {
                      ...notifications.emailNotifications,
                      [key]: checked as boolean
                    }
                  })
                }
              />
              <Label htmlFor={`email-${key}`} className="capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.pushNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`push-${key}`}
                checked={value}
                onCheckedChange={(checked) => 
                  setNotifications({
                    ...notifications,
                    pushNotifications: {
                      ...notifications.pushNotifications,
                      [key]: checked as boolean
                    }
                  })
                }
              />
              <Label htmlFor={`push-${key}`} className="capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">SMS Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.smsNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`sms-${key}`}
                checked={value}
                onCheckedChange={(checked) => 
                  setNotifications({
                    ...notifications,
                    smsNotifications: {
                      ...notifications.smsNotifications,
                      [key]: checked as boolean
                    }
                  })
                }
              />
              <Label htmlFor={`sms-${key}`} className="capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={handleSaveNotifications} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Profile Visibility</Label>
              <p className="text-sm text-namc-gray-600">Control who can see your profile information</p>
            </div>
            <Select defaultValue="members">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="members">NAMC Members Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Contact Information</Label>
              <p className="text-sm text-namc-gray-600">Allow other members to see your contact details</p>
            </div>
            <Checkbox defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Project History</Label>
              <p className="text-sm text-namc-gray-600">Show your project history to other members</p>
            </div>
            <Checkbox defaultChecked />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <Button variant="outline">
            <DynamicIcon name="Download" className="w-4 h-4 mr-2" />
            Download My Data
          </Button>
          <p className="text-sm text-namc-gray-600">
            Download a copy of all your account data and information.
          </p>
        </div>
      </div>
    </div>
  )

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Membership Status</h3>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-namc-gray-900">NAMC NorCal Premium Member</h4>
                <p className="text-sm text-namc-gray-600">Active until March 15, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-namc-gray-900">$299/year</p>
                <p className="text-sm text-namc-gray-600">Renews automatically</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Payment Method</h3>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DynamicIcon name="CreditCard" className="w-6 h-6 text-namc-gray-400" />
                <div>
                  <p className="font-medium text-namc-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-namc-gray-600">Expires 12/2026</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Billing History</h3>
        <div className="space-y-2">
          {[
            { date: '2024-01-15', amount: '$299.00', status: 'Paid' },
            { date: '2023-01-15', amount: '$299.00', status: 'Paid' },
            { date: '2022-01-15', amount: '$299.00', status: 'Paid' },
          ].map((invoice, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-namc-gray-200">
              <div>
                <p className="font-medium text-namc-gray-900">Annual Membership</p>
                <p className="text-sm text-namc-gray-600">{invoice.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-namc-gray-900">{invoice.amount}</p>
                <p className="text-sm text-namc-green-600">{invoice.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Display Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Theme</Label>
              <p className="text-sm text-namc-gray-600">Choose your preferred color scheme</p>
            </div>
            <Select defaultValue="light">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Dashboard Layout</Label>
              <p className="text-sm text-namc-gray-600">Choose your preferred dashboard layout</p>
            </div>
            <Select defaultValue="standard">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-namc-gray-900 mb-4">Communication Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox defaultChecked />
            <Label>Receive project recommendations based on my skills</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox defaultChecked />
            <Label>Show me networking opportunities in my area</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox />
            <Label>Include me in beta testing programs</Label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection()
      case 'account':
        return renderAccountSection()
      case 'notifications':
        return renderNotificationsSection()
      case 'privacy':
        return renderPrivacySection()
      case 'billing':
        return renderBillingSection()
      case 'preferences':
        return renderPreferencesSection()
      default:
        return renderProfileSection()
    }
  }

  return (
    <AuthRequiredRoute>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-namc-gray-900">Settings</h1>
          <p className="text-namc-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div>
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-namc-blue-100 text-namc-blue-700'
                      : 'text-namc-gray-600 hover:bg-namc-gray-100 hover:text-namc-gray-900'
                  }`}
                >
                  <DynamicIcon name={section.icon as any} className="w-5 h-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthRequiredRoute>
  )
}