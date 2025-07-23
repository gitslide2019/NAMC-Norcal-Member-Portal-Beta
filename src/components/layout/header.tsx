'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b border-namc-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl text-namc-blue-600">
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
            <Link href="/resources" className="text-namc-gray-700 hover:text-namc-blue-600">
              Resources
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Join Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}