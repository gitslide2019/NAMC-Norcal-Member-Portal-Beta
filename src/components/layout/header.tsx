'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/unified-auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export function Header() {
  const { user, isAuthenticated, isLoading, hasHydrated, logout } = useAuth()
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProgramsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Render simple header during SSR and hydration
  if (!hasHydrated) {
    return (
      <header className="border-b border-namc-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="font-bold text-xl text-namc-blue-600" data-testid="header-logo-hydration">
                NAMC NorCal
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-namc-gray-700 hover:text-namc-blue-600">
                About
              </Link>
              <Link href="/events" className="text-namc-gray-700 hover:text-namc-blue-600">
                Events
              </Link>
              <Link href="/members" className="text-namc-gray-700 hover:text-namc-blue-600">
                Members
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="flex items-center text-namc-gray-700 hover:text-namc-blue-600"
                  onClick={() => setProgramsDropdownOpen(!programsDropdownOpen)}
                >
                  Programs
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {mounted && programsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-namc-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <Link 
                        href="/programs/tech-clean-california"
                        className="flex items-center p-3 rounded-lg hover:bg-namc-gray-50 text-sm"
                        onClick={() => setProgramsDropdownOpen(false)}
                        data-testid="tech-program-link"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                          <span className="text-green-600 text-xs font-bold">⚡</span>
                        </div>
                        <div>
                          <div className="font-medium text-namc-gray-900">TECH Clean California</div>
                          <div className="text-namc-gray-600 text-xs">Heat pump incentive program</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/resources" className="text-namc-gray-700 hover:text-namc-blue-600">
                Resources
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="w-20 h-9 bg-gray-100 rounded animate-pulse" />
              <div className="w-24 h-9 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="border-b border-namc-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl text-namc-blue-600" data-testid="header-logo">
              NAMC NorCal
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-namc-gray-700 hover:text-namc-blue-600">
              About
            </Link>
            <Link href="/events" className="text-namc-gray-700 hover:text-namc-blue-600">
              Events
            </Link>
            <Link href="/members" className="text-namc-gray-700 hover:text-namc-blue-600">
              Members
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center text-namc-gray-700 hover:text-namc-blue-600"
                onClick={() => setProgramsDropdownOpen(!programsDropdownOpen)}
                data-testid="programs-dropdown"
              >
                Programs
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {mounted && programsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-namc-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <Link 
                      href="/programs/tech-clean-california"
                      className="flex items-center p-3 rounded-lg hover:bg-namc-gray-50 text-sm"
                      onClick={() => setProgramsDropdownOpen(false)}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                        <span className="text-green-600 text-xs font-bold">⚡</span>
                      </div>
                      <div>
                        <div className="font-medium text-namc-gray-900">TECH Clean California</div>
                        <div className="text-namc-gray-600 text-xs">Heat pump incentive program</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/resources" className="text-namc-gray-700 hover:text-namc-blue-600">
              Resources
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : isAuthenticated && user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {user.firstName}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Join Now</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}