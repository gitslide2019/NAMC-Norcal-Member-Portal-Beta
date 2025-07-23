'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-namc-blue-50 to-namc-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-namc-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-namc-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NAMC</span>
              </div>
              <span className="font-semibold text-namc-gray-900">NorCal</span>
            </Link>
            
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-namc-blue-600 via-namc-blue-700 to-namc-blue-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:60px_60px]" />
          
          <div className="relative z-10 flex flex-col justify-center px-12 py-16">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                Welcome to the 
                <span className="block text-namc-gold-300">NAMC NorCal</span>
                Member Portal
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Connect with fellow minority contractors, access exclusive project opportunities, 
                and grow your business with our comprehensive digital platform.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-namc-gold-400 rounded-full"></div>
                  <span className="text-white/90">Access $100M+ in project opportunities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-namc-gold-400 rounded-full"></div>
                  <span className="text-white/90">Connect with 500+ verified contractors</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-namc-gold-400 rounded-full"></div>
                  <span className="text-white/90">Professional training and certification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-namc-gold-400 rounded-full"></div>
                  <span className="text-white/90">Industry networking events</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}