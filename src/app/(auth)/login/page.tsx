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
import { DynamicIcon, usePreloadIcons, AUTH_ICONS } from '@/components/ui/dynamic-icon'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Preload auth icons for better performance
  usePreloadIcons(AUTH_ICONS)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError('')

      // Client-side validation
      const validation = loginSchema.safeParse(data)
      if (!validation.success) {
        const firstError = validation.error.errors[0]
        setError(firstError.message)
        return
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }

      // Store token and user data
      await login(result.token, result.user)

      // Redirect based on user type
      if (result.user.memberType === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-4">
          <Badge className="bg-namc-blue-100 text-namc-blue-800 px-4 py-2">
            <DynamicIcon name="LogIn" className="w-4 h-4 mr-2" size={16} />
            Member Login
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold text-namc-gray-900">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-lg text-namc-gray-600">
          Sign in to access your NAMC NorCal member portal
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <DynamicIcon name="AlertCircle" className="h-4 w-4" size={16} aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-namc-gray-700">
              Email Address <span aria-hidden="true">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={errors.email ? 'border-red-500' : ''}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              required
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600" role="alert">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-namc-gray-700">
              Password <span aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error password-toggle' : 'password-toggle'}
                required
                {...register('password')}
              />
              <Button
                id="password-toggle"
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:ring-2 focus:ring-namc-blue-500 focus:ring-offset-2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <DynamicIcon name="EyeOff" className="h-4 w-4 text-namc-gray-400" size={16} aria-hidden="true" />
                ) : (
                  <DynamicIcon name="Eye" className="h-4 w-4 text-namc-gray-400" size={16} aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600" role="alert">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-namc-blue-600 focus:ring-namc-blue-500 border-namc-gray-300 rounded"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-namc-gray-600">
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-namc-blue-600 hover:text-namc-blue-800 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <DynamicIcon name="Loader2" className="mr-2 h-4 w-4 animate-spin" size={16} />
                Signing in...
              </>
            ) : (
              <>
                <DynamicIcon name="LogIn" className="mr-2 h-4 w-4" size={16} />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-namc-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-namc-blue-600 hover:text-namc-blue-800"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-namc-gray-50 rounded-lg border">
          <h4 className="text-sm font-semibold text-namc-gray-900 mb-2">Demo Accounts:</h4>
          <div className="space-y-2 text-xs text-namc-gray-600">
            <div>
              <strong>Admin:</strong> admin@namc-norcal.org / password123
            </div>
            <div>
              <strong>Member:</strong> member@example.com / password123
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}