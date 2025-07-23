'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Settings,
  BarChart3,
  Database,
  Shield,
  Menu,
  X,
  ChevronRight,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
    current: false,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Contractors',
    href: '/admin/contractors',
    icon: Building2,
    current: false,
    badge: 'New',
  },
  {
    name: 'Members',
    href: '/admin/members',
    icon: Users,
    current: false,
  },
  {
    name: 'Events',
    href: '/admin/events',
    icon: Calendar,
    current: false,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
    current: false,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    current: false,
  },
  {
    name: 'Database',
    href: '/admin/database',
    icon: Database,
    current: false,
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
    current: false,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    current: false,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Update current navigation item based on pathname
  const currentNavigation = navigation.map(item => ({
    ...item,
    current: pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
  }))

  return (
    <div className="flex h-screen bg-namc-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={currentNavigation} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={currentNavigation} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navbar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-namc-gray-200">
          <button
            type="button"
            className="px-4 border-r border-namc-gray-200 text-namc-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-namc-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <Breadcrumb pathname={pathname} />
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <Badge variant="secondary" className="mr-4">
                Admin Panel
              </Badge>
              
              <div className="relative">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-namc-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">A</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-namc-gray-800">Admin User</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navigation }: { navigation: typeof navigation }) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-namc-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-namc-gray-200">
        <Link href="/admin" className="flex items-center">
          <div className="h-8 w-8 bg-namc-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <div>
            <div className="text-lg font-semibold text-namc-gray-900">NAMC Admin</div>
            <div className="text-xs text-namc-gray-500">Northern California</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                item.current
                  ? 'bg-namc-blue-50 border-namc-blue-500 text-namc-blue-700 border-r-2'
                  : 'text-namc-gray-600 hover:bg-namc-gray-50 hover:text-namc-gray-900',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200'
              )}
            >
              <Icon
                className={cn(
                  item.current ? 'text-namc-blue-500' : 'text-namc-gray-400 group-hover:text-namc-gray-500',
                  'mr-3 flex-shrink-0 h-5 w-5'
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-namc-gray-200">
        <div className="text-xs text-namc-gray-500 text-center">
          NAMC NorCal Admin Portal
          <br />
          Version 1.0.0
        </div>
      </div>
    </div>
  )
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)
  
  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === segments.length - 1
    
    return {
      href,
      label,
      isLast
    }
  })

  if (breadcrumbItems.length <= 1) {
    return (
      <h1 className="text-lg font-semibold text-namc-gray-900">
        Dashboard
      </h1>
    )
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-namc-gray-500">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
          {item.isLast ? (
            <span className="text-namc-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-namc-gray-700">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}