'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccess('')

      // Client-side validation
      const validation = forgotPasswordSchema.safeParse(data)
      if (!validation.success) {
        const firstError = validation.error.errors[0]
        setError(firstError.message)
        return
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset email')
      }

      setSuccess('Password reset instructions have been sent to your email address.')
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-4">
          <Badge className="bg-namc-gray-100 text-namc-gray-800 px-4 py-2">
            <Mail className="w-4 h-4 mr-2" />
            Password Reset
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold text-namc-gray-900">
          Forgot Your Password?
        </CardTitle>
        <CardDescription className="text-lg text-namc-gray-600">
          Enter your email address and we'll send you instructions to reset your password
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

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-namc-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={errors.email ? 'border-red-500' : ''}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Instructions
                </>
              )}
            </Button>
          </form>
        )}

        <div className="text-center space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-namc-blue-600 hover:text-namc-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          
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

        <div className="mt-8 p-4 bg-namc-blue-50 rounded-lg border border-namc-blue-200">
          <h4 className="text-sm font-semibold text-namc-blue-900 mb-2">Need Help?</h4>
          <p className="text-sm text-namc-blue-700 mb-2">
            If you don't receive the email within a few minutes, please check your spam folder.
          </p>
          <p className="text-sm text-namc-blue-700">
            Still having trouble? Contact us at{' '}
            <a href="mailto:support@namc-norcal.org" className="font-medium underline">
              support@namc-norcal.org
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}