'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  User, 
  Building2, 
  Calendar, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const memberNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Projects', href: '/projects', icon: Building2 },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Messages', href: '/messages', icon: MessageSquare, badge: '3' },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Learning', href: '/courses', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const adminNavItems: NavItem[] = [
  { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Applications', href: '/admin/applications', icon: Users },
  { name: 'TECH Program', href: '/admin/tech', icon: Building2 },
  { name: 'System Activity', href: '/admin/activity', icon: Calendar },
  { name: 'System Alerts', href: '/admin/alerts', icon: LayoutDashboard },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navItems = user?.memberType === 'admin' ? adminNavItems : memberNavItems

  const handleLogout = () => {
    logout()
  }

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-namc-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-namc-blue-600 mx-auto mb-4"></div>
          <p className="text-namc-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-namc-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-namc-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-namc-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NAMC</span>
            </div>
            <span className="font-semibold text-namc-gray-900">NorCal</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-namc-blue-100 text-namc-blue-700'
                    : 'text-namc-gray-600 hover:bg-namc-gray-100 hover:text-namc-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="bg-namc-red-100 text-namc-red-700">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-namc-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-namc-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-namc-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-namc-gray-500 truncate">
                {user.memberType === 'admin' ? 'Administrator' : 'Member'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-namc-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, events, members..."
                  className="w-full pl-10 pr-4 py-2 border border-namc-gray-300 rounded-lg focus:ring-2 focus:ring-namc-blue-500 focus:border-namc-blue-500"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-namc-red-500 rounded-full"></span>
              </Button>

              {/* User menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-namc-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-namc-gray-700">
                    {user.firstName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-namc-gray-400" />
                </Button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-namc-gray-200 py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-namc-gray-700 hover:bg-namc-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="inline h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-namc-gray-700 hover:bg-namc-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="inline h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <hr className="my-1 border-namc-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-namc-red-600 hover:bg-namc-gray-100"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}