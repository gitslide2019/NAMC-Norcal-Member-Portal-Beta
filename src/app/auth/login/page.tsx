'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PublicOnlyRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/hooks/useAuth'
import { useNotify } from '@/components/ui/notification-system'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Eye, EyeOff, Shield } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const notify = useNotify()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      notify.error('Missing Information', 'Please enter both email and password.')
      return
    }

    setIsLoading(true)
    
    try {
      // Call the login API directly since useAuth hook doesn't have login method
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Use the existing auth store
        await login(data.data.token, data.data.user)
        
        notify.success('Welcome back!', `Good to see you, ${data.data.user.firstName}.`)

        // Redirect based on user type
        if (data.data.user.memberType === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        const errorMessage = data.message || 'Login failed. Please try again.'
        notify.error('Login Failed', errorMessage)
      }
    } catch (error) {
      notify.error('Connection Error', 'Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (userType: 'admin' | 'member') => {
    if (userType === 'admin') {
      setFormData({
        email: 'admin@namc-norcal.org',
        password: 'password123',
        rememberMe: false
      })
    } else {
      setFormData({
        email: 'maria.johnson@example.com',
        password: 'password123',
        rememberMe: false
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-namc-blue-50 to-namc-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-namc-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-namc-blue-900">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your NAMC NorCal member account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                }
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me for 30 days
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full namc-button-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Demo Accounts (for testing):
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
              >
                <Shield className="h-3 w-3 mr-2" />
                Demo Admin Login
              </Button>
              <Button
                variant="outline" 
                className="w-full text-xs"
                onClick={() => handleDemoLogin('member')}
                disabled={isLoading}
              >
                Demo Member Login
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal text-namc-blue-600"
                onClick={() => router.push('/auth/register')}
              >
                Sign up here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <LoginForm />
    </PublicOnlyRoute>
  )
}