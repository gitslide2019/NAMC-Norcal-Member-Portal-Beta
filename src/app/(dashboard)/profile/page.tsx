'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthRequiredRoute } from '@/components/auth/protected-route'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  LinkedinIcon, 
  Twitter,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Camera,
  Edit3
} from 'lucide-react'

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      company: '',
      title: '',
      bio: '',
      website: '',
      linkedin: '',
      twitter: '',
      city: '',
      state: '',
      zipCode: '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      // Client-side validation
      const validation = profileSchema.safeParse(data)
      if (!validation.success) {
        const firstError = validation.error.errors[0]
        setError(firstError.message)
        return
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile')
      }

      // Update user in auth state
      updateUser(result.user)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-namc-blue-600 mx-auto mb-4"></div>
          <p className="text-namc-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthRequiredRoute>
      <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-namc-gray-900">Profile</h1>
          <p className="text-namc-gray-600 mt-2">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a professional photo to help other members recognize you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-namc-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                    disabled={!isEditing}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {isEditing && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-namc-gray-500 mt-2">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-namc-gray-600">Member Type</span>
                <Badge variant={user.memberType === 'admin' ? 'default' : 'secondary'}>
                  {user.memberType === 'admin' ? 'Administrator' : 'Member'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-namc-gray-600">Status</span>
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-namc-gray-600">Verified</span>
                <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                  {user.isVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <span className="text-sm text-namc-gray-600">Member Since</span>
                <p className="text-sm font-medium">January 2024</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your basic personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-namc-gray-700">
                        First Name *
                      </label>
                      <Input
                        {...register('firstName')}
                        disabled={!isEditing}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-namc-gray-700">
                        Last Name *
                      </label>
                      <Input
                        {...register('lastName')}
                        disabled={!isEditing}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-namc-gray-700">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                      <Input
                        {...register('email')}
                        disabled={!isEditing}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-namc-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                      <Input
                        {...register('phone')}
                        disabled={!isEditing}
                        placeholder="(555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-namc-gray-700">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Tell other members about yourself and your business..."
                      className="w-full px-3 py-2 border border-namc-gray-300 rounded-md focus:ring-2 focus:ring-namc-blue-500 focus:border-namc-blue-500 disabled:bg-namc-gray-50 disabled:text-namc-gray-500"
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Details about your company and professional role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-namc-gray-700">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                      <Input
                        {...register('company')}
                        disabled={!isEditing}
                        placeholder="ABC Construction Inc."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-namc-gray-700">
                      Job Title
                    </label>
                    <Input
                      {...register('title')}
                      disabled={!isEditing}
                      placeholder="Project Manager"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>
                    Your business location for networking and project matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-namc-gray-700">
                        City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                        <Input
                          {...register('city')}
                          disabled={!isEditing}
                          placeholder="San Francisco"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-namc-gray-700">
                        State
                      </label>
                      <Input
                        {...register('state')}
                        disabled={!isEditing}
                        placeholder="CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-namc-gray-700">
                        ZIP Code
                      </label>
                      <Input
                        {...register('zipCode')}
                        disabled={!isEditing}
                        placeholder="94102"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Social & Web Presence</CardTitle>
                  <CardDescription>
                    Help other members connect with you online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-namc-gray-700">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                      <Input
                        {...register('website')}
                        disabled={!isEditing}
                        placeholder="https://www.yourcompany.com"
                        className={`pl-10 ${errors.website ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.website && (
                      <p className="text-sm text-red-600">{errors.website.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-namc-gray-700">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <LinkedinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                      <Input
                        {...register('linkedin')}
                        disabled={!isEditing}
                        placeholder="https://www.linkedin.com/in/yourname"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-namc-gray-700">
                      Twitter Handle
                    </label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                      <Input
                        {...register('twitter')}
                        disabled={!isEditing}
                        placeholder="@yourhandle"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      </div>
    </AuthRequiredRoute>
  )
}