'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  company: z.string().min(2, 'Company name is required'),
  title: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      // Client-side validation
      const validation = registerSchema.safeParse(data)
      if (!validation.success) {
        const firstError = validation.error.errors[0]
        setError(firstError.message)
        return
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          title: data.title,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      setSuccess('Registration successful! Please check your email to verify your account.')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-4">
          <Badge className="bg-namc-green-100 text-namc-green-800 px-4 py-2">
            <UserPlus className="w-4 h-4 mr-2" />
            Join NAMC NorCal
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold text-namc-gray-900">
          Create Your Account
        </CardTitle>
        <CardDescription className="text-lg text-namc-gray-600">
          Join the Northern California chapter of NAMC
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-namc-gray-700">
                First Name *
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                className={errors.firstName ? 'border-red-500' : ''}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-namc-gray-700">
                Last Name *
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                className={errors.lastName ? 'border-red-500' : ''}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-namc-gray-700">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              className={errors.email ? 'border-red-500' : ''}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-namc-gray-700">
              Phone Number *
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              className={errors.phone ? 'border-red-500' : ''}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Business Information */}
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium text-namc-gray-700">
              Company Name *
            </label>
            <Input
              id="company"
              type="text"
              placeholder="ABC Construction Inc."
              className={errors.company ? 'border-red-500' : ''}
              {...register('company')}
            />
            {errors.company && (
              <p className="text-sm text-red-600">{errors.company.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-namc-gray-700">
              Job Title
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Project Manager"
              {...register('title')}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-namc-gray-700">
              Password *
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-namc-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-namc-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="text-xs text-namc-gray-500">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-namc-gray-700">
              Confirm Password *
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-namc-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-namc-gray-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <input
              id="agreeToTerms"
              type="checkbox"
              className="h-4 w-4 text-namc-blue-600 focus:ring-namc-blue-500 border-namc-gray-300 rounded mt-1"
              {...register('agreeToTerms')}
            />
            <label htmlFor="agreeToTerms" className="text-sm text-namc-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-namc-blue-600 hover:text-namc-blue-800 font-medium">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-namc-blue-600 hover:text-namc-blue-800 font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-namc-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-namc-blue-600 hover:text-namc-blue-800"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}