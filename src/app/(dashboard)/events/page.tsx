'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

// Mock data - in real app, this would come from API
const mockEvents = [
  {
    id: '1',
    title: 'Safety Training Workshop - Fall Protection',
    description: 'Comprehensive OSHA-compliant fall protection training for construction workers and supervisors.',
    type: 'TRAINING',
    startDate: '2024-02-15',
    startTime: '09:00',
    endTime: '17:00',
    location: 'NAMC NorCal Training Center',
    address: '123 Industrial Way, Oakland, CA 94607',
    maxCapacity: 30,
    registeredCount: 22,
    price: 150,
    memberPrice: 100,
    status: 'OPEN',
    isRegistered: true,
    instructor: 'Safety Institute of California',
    requirements: 'Hard hat, safety boots, and photo ID required',
    tags: ['OSHA', 'Safety', 'Required', 'Certification'],
  },
  {
    id: '2',
    title: 'NAMC NorCal Annual Networking Gala',
    description: 'Join us for our annual networking event featuring industry leaders, awards ceremony, and opportunities to connect with fellow contractors.',
    type: 'NETWORKING',
    startDate: '2024-03-20',
    startTime: '18:00',
    endTime: '22:00',
    location: 'San Francisco Marriott Marquis',
    address: '780 Mission St, San Francisco, CA 94103',
    maxCapacity: 200,
    registeredCount: 156,
    price: 125,
    memberPrice: 75,
    status: 'OPEN',
    isRegistered: false,
    instructor: 'NAMC NorCal Leadership',
    requirements: 'Business attire required',
    tags: ['Networking', 'Annual', 'Awards', 'Gala'],
  },
  {
    id: '3',
    title: 'Green Building Certification Workshop',
    description: 'Learn about sustainable construction practices and prepare for LEED certification with hands-on projects and expert guidance.',
    type: 'CERTIFICATION',
    startDate: '2024-02-28',
    startTime: '08:30',
    endTime: '16:30',
    location: 'UC Berkeley Extension',
    address: '1995 University Ave, Berkeley, CA 94704',
    maxCapacity: 25,
    registeredCount: 18,
    price: 300,
    memberPrice: 200,
    status: 'OPEN',
    isRegistered: true,
    instructor: 'California Green Building Council',
    requirements: 'Laptop computer and construction experience recommended',
    tags: ['LEED', 'Sustainability', 'Certification', 'Green Building'],
  },
  {
    id: '4',
    title: 'Digital Marketing for Construction Companies',
    description: 'Master digital marketing strategies specifically designed for construction businesses, including website optimization and social media.',
    type: 'WEBINAR',
    startDate: '2024-02-22',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Online Webinar',
    address: 'Zoom Meeting (link provided after registration)',
    maxCapacity: 100,
    registeredCount: 67,
    price: 50,
    memberPrice: 25,
    status: 'OPEN',
    isRegistered: false,
    instructor: 'Digital Marketing Pro',
    requirements: 'Computer with internet connection',
    tags: ['Marketing', 'Digital', 'Webinar', 'Business Growth'],
  },
  {
    id: '5',
    title: 'California Building Code Updates 2024',
    description: 'Stay current with the latest California building code changes and requirements for 2024, including new regulations and compliance.',
    type: 'SEMINAR',
    startDate: '2024-01-25',
    startTime: '13:00',
    endTime: '17:00',
    location: 'NAMC NorCal Conference Room',
    address: '456 Business Blvd, San Francisco, CA 94105',
    maxCapacity: 40,
    registeredCount: 40,
    price: 100,
    memberPrice: 60,
    status: 'FULL',
    isRegistered: true,
    instructor: 'California Building Officials',
    requirements: 'Current contractor license and photo ID',
    tags: ['Building Code', 'Compliance', 'California', 'Updates'],
  },
  {
    id: '6',
    title: 'Project Management for Small Contractors',
    description: 'Learn essential project management techniques tailored for small to medium construction contractors, including scheduling and budgeting.',
    type: 'TRAINING',
    startDate: '2024-01-18',
    startTime: '09:00',
    endTime: '15:00',
    location: 'San Jose Convention Center',
    address: '150 W San Carlos St, San Jose, CA 95113',
    maxCapacity: 35,
    registeredCount: 35,
    price: 200,
    memberPrice: 150,
    status: 'COMPLETED',
    isRegistered: true,
    instructor: 'Construction Management Institute',
    requirements: 'Experience in construction project management',
    tags: ['Project Management', 'Small Business', 'Training'],
  }
]

const eventTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'TRAINING', label: 'Training Workshop' },
  { value: 'NETWORKING', label: 'Networking Event' },
  { value: 'CERTIFICATION', label: 'Certification Course' },
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'CONFERENCE', label: 'Conference' },
]

const eventStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'OPEN', label: 'Open for Registration' },
  { value: 'FULL', label: 'Full/Waitlist' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

function getStatusColor(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'bg-green-100 text-green-800'
    case 'FULL':
      return 'bg-yellow-100 text-yellow-800'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'TRAINING':
      return 'bg-blue-100 text-blue-700'
    case 'NETWORKING':
      return 'bg-purple-100 text-purple-700'
    case 'CERTIFICATION':
      return 'bg-green-100 text-green-700'
    case 'SEMINAR':
      return 'bg-orange-100 text-orange-700'
    case 'WEBINAR':
      return 'bg-indigo-100 text-indigo-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatEventTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export default function EventsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(false)

  // Filter events based on search and filters
  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === 'all' || event.type === selectedType
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus
    const matchesRegistration = !showRegisteredOnly || event.isRegistered
    
    return matchesSearch && matchesType && matchesStatus && matchesRegistration
  })

  const registeredEvents = mockEvents.filter(event => event.isRegistered)
  const upcomingEvents = mockEvents.filter(event => new Date(event.startDate) > new Date() && event.status === 'OPEN')
  const completedEvents = mockEvents.filter(event => event.status === 'COMPLETED' && event.isRegistered)

  const handleRegisterEvent = (eventId: string) => {
    // In real app, this would call API to register for event
    console.log('Registering for event:', eventId)
  }

  const handleUnregisterEvent = (eventId: string) => {
    // In real app, this would call API to unregister from event
    console.log('Unregistering from event:', eventId)
  }

  return (
    <AuthRequiredRoute>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-namc-gray-900">Events & Training</h1>
          <p className="text-namc-gray-600 mt-1">
            Professional development events, networking opportunities, and training workshops
          </p>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Registered Events</p>
                  <p className="text-2xl font-bold text-namc-gray-900">{registeredEvents.length}</p>
                </div>
                <DynamicIcon name="Calendar" className="h-8 w-8 text-namc-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-namc-gray-900">{upcomingEvents.length}</p>
                </div>
                <DynamicIcon name="Clock" className="h-8 w-8 text-namc-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-namc-gray-900">{completedEvents.length}</p>
                </div>
                <DynamicIcon name="CheckCircle" className="h-8 w-8 text-namc-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Total Available</p>
                  <p className="text-2xl font-bold text-namc-gray-900">{mockEvents.length}</p>
                </div>
                <DynamicIcon name="Calendar" className="h-8 w-8 text-namc-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search & Filter Events</CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="registered-only"
                  checked={showRegisteredOnly}
                  onChange={(e) => setShowRegisteredOnly(e.target.checked)}
                  className="rounded border-namc-gray-300"
                />
                <label htmlFor="registered-only" className="text-sm text-namc-gray-700">
                  Show registered events only
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                  Search Events
                </label>
                <div className="relative">
                  <DynamicIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                  Event Type
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                  Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedType('all')
                    setSelectedStatus('all')
                    setShowRegisteredOnly(false)
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-namc-gray-600">
            Showing {filteredEvents.length} of {mockEvents.length} events
          </p>
        </div>

        {/* Events List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      {event.isRegistered && (
                        <Badge variant="secondary" className="bg-namc-green-100 text-namc-green-700">
                          Registered
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-namc-gray-600">
                      <div className="flex items-center">
                        <DynamicIcon name="Calendar" className="w-4 h-4 mr-1" />
                        {formatEventDate(event.startDate)}
                      </div>
                      <div className="flex items-center">
                        <DynamicIcon name="Clock" className="w-4 h-4 mr-1" />
                        {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {user?.memberType !== 'admin' && (
                      <div>
                        <p className="text-lg font-bold text-namc-gray-900">
                          ${event.memberPrice}
                        </p>
                        {event.price !== event.memberPrice && (
                          <p className="text-sm text-namc-gray-500 line-through">
                            ${event.price}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-namc-gray-600 mb-4">
                  {event.description}
                </CardDescription>
                
                <div className="mb-4">
                  <div className="flex items-center text-sm text-namc-gray-600 mb-2">
                    <DynamicIcon name="MapPin" className="w-4 h-4 mr-1" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-namc-gray-600 mb-2">
                    <DynamicIcon name="User" className="w-4 h-4 mr-1" />
                    <span>Instructor: {event.instructor}</span>
                  </div>
                  <div className="flex items-center text-sm text-namc-gray-600 mb-2">
                    <DynamicIcon name="Users" className="w-4 h-4 mr-1" />
                    <span>{event.registeredCount}/{event.maxCapacity} registered</span>
                  </div>
                </div>

                {event.requirements && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-namc-gray-700 mb-1">Requirements:</p>
                    <p className="text-sm text-namc-gray-600">{event.requirements}</p>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {event.status === 'OPEN' && (
                      <div className="flex items-center text-sm text-namc-green-600">
                        <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-1" />
                        Open for Registration
                      </div>
                    )}
                    {event.status === 'FULL' && (
                      <div className="flex items-center text-sm text-namc-yellow-600">
                        <DynamicIcon name="AlertCircle" className="w-4 h-4 mr-1" />
                        Full - Waitlist Available
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <DynamicIcon name="Eye" className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    {event.status === 'OPEN' && !event.isRegistered && (
                      <Button
                        size="sm"
                        onClick={() => handleRegisterEvent(event.id)}
                      >
                        <DynamicIcon name="Plus" className="w-4 h-4 mr-2" />
                        Register
                      </Button>
                    )}
                    {event.status === 'FULL' && !event.isRegistered && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegisterEvent(event.id)}
                      >
                        <DynamicIcon name="Clock" className="w-4 h-4 mr-2" />
                        Join Waitlist
                      </Button>
                    )}
                    {event.isRegistered && event.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnregisterEvent(event.id)}
                      >
                        <DynamicIcon name="X" className="w-4 h-4 mr-2" />
                        Unregister
                      </Button>
                    )}
                    {event.status === 'COMPLETED' && event.isRegistered && (
                      <Button
                        size="sm"
                        disabled
                      >
                        <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-2" />
                        Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <DynamicIcon name="Calendar" className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-namc-gray-900 mb-2">No events found</h3>
              <p className="text-namc-gray-600 mb-4">
                Try adjusting your search criteria or check back later for new events.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedType('all')
                  setSelectedStatus('all')
                  setShowRegisteredOnly(false)
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthRequiredRoute>
  )
}