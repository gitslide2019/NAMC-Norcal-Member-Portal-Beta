'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

interface Member {
  id: string
  name: string
  company: string
  memberType: 'REGULAR' | 'PREMIUM' | 'CORPORATE'
  location: string
  specialties: string[]
  joinDate: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  email: string
  phone?: string
  website?: string
  certifications: string[]
  avatar?: string
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Maria Rodriguez',
    company: 'Rodriguez Construction LLC',
    memberType: 'PREMIUM',
    location: 'San Francisco, CA',
    specialties: ['General Contracting', 'Commercial Construction', 'Green Building'],
    joinDate: '2022-01-15',
    status: 'ACTIVE',
    email: 'maria@rodriguezcons.com',
    phone: '(415) 555-0123',
    website: 'www.rodriguezcons.com',
    certifications: ['LEED Certified', 'TECH Clean California']
  },
  {
    id: '2',
    name: 'James Chen',
    company: 'Chen HVAC Services',
    memberType: 'REGULAR',
    location: 'Oakland, CA',
    specialties: ['HVAC Installation', 'Heat Pumps', 'Energy Efficiency'],
    joinDate: '2023-03-22',
    status: 'ACTIVE',
    email: 'james@chenhvac.com',
    phone: '(510) 555-0456',
    certifications: ['TECH Clean California', 'EPA Certified']
  },
  {
    id: '3',
    name: 'Sarah Williams',
    company: 'Williams Electrical Co.',
    memberType: 'CORPORATE',
    location: 'San Jose, CA',
    specialties: ['Electrical Systems', 'Solar Installation', 'Commercial Wiring'],
    joinDate: '2021-08-10',
    status: 'ACTIVE',
    email: 'sarah@williamselectric.com',
    phone: '(408) 555-0789',
    website: 'www.williamselectric.com',
    certifications: ['Licensed Electrician', 'Solar Certified']
  },
  {
    id: '4',
    name: 'Michael Thompson',
    company: 'Thompson Plumbing',
    memberType: 'REGULAR',
    location: 'Fremont, CA',
    specialties: ['Plumbing', 'Water Systems', 'Emergency Repairs'],
    joinDate: '2023-06-05',
    status: 'ACTIVE',
    email: 'mike@thompsonplumbing.com',
    phone: '(510) 555-1234',
    certifications: ['Licensed Plumber', 'Backflow Certified']
  },
  {
    id: '5',
    name: 'Lisa Garcia',
    company: 'Garcia Roofing Solutions',
    memberType: 'PREMIUM',
    location: 'Santa Clara, CA',
    specialties: ['Roofing', 'Solar Roofing', 'Waterproofing'],
    joinDate: '2022-11-18',
    status: 'ACTIVE',
    email: 'lisa@garciaroofing.com',
    phone: '(408) 555-5678',
    website: 'www.garciaroofing.com',
    certifications: ['GAF Certified', 'Solar Installation']
  },
  {
    id: '6',
    name: 'David Kim',
    company: 'Kim Landscaping & Design',
    memberType: 'REGULAR',
    location: 'Palo Alto, CA',
    specialties: ['Landscaping', 'Irrigation', 'Sustainable Design'],
    joinDate: '2023-09-12',
    status: 'PENDING',
    email: 'david@kimlandscape.com',
    phone: '(650) 555-9012',
    certifications: ['Irrigation Certified']
  }
]

const memberTypeConfig = {
  REGULAR: { color: 'bg-blue-100 text-blue-700', label: 'Regular' },
  PREMIUM: { color: 'bg-purple-100 text-purple-700', label: 'Premium' },
  CORPORATE: { color: 'bg-orange-100 text-orange-700', label: 'Corporate' }
}

const statusConfig = {
  ACTIVE: { color: 'bg-green-100 text-green-700', label: 'Active' },
  INACTIVE: { color: 'bg-gray-100 text-gray-700', label: 'Inactive' },
  PENDING: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' }
}

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')

  // Get unique locations for filter
  const locations = Array.from(new Set(mockMembers.map(member => member.location.split(',')[1]?.trim() || member.location)))

  // Filter and sort members
  const filteredMembers = mockMembers
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = typeFilter === 'all' || member.memberType === typeFilter
      const matchesLocation = locationFilter === 'all' || member.location.includes(locationFilter)
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter
      
      return matchesSearch && matchesType && matchesLocation && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'company':
          return a.company.localeCompare(b.company)
        case 'joinDate':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
        case 'location':
          return a.location.localeCompare(b.location)
        default:
          return 0
      }
    })

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-namc-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Member Directory
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-namc-blue-100 max-w-3xl mx-auto">
              Connect with certified minority contractors across Northern California
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                2,500+ Members
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                50+ Specialties
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                Bay Area Coverage
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Find Members</CardTitle>
            <CardDescription>Search and filter our member directory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search by name, company, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Member Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="CORPORATE">Corporate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location, index) => (
                    <SelectItem key={index} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="joinDate">Join Date</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-namc-gray-600">
            Showing {filteredMembers.length} of {mockMembers.length} members
          </p>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const typeConfig = memberTypeConfig[member.memberType]
            const memberStatusConfig = statusConfig[member.status]
            
            return (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                      <Badge className={memberStatusConfig.color}>
                        {memberStatusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-namc-blue-600">
                    {member.company}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DynamicIcon name="MapPin" className="w-4 h-4 mr-2" size={16} />
                      {member.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DynamicIcon name="Calendar" className="w-4 h-4 mr-2" size={16} />
                      Member since {formatJoinDate(member.joinDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DynamicIcon name="Mail" className="w-4 h-4 mr-2" size={16} />
                      {member.email}
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DynamicIcon name="Phone" className="w-4 h-4 mr-2" size={16} />
                        {member.phone}
                      </div>
                    )}
                  </div>
                  
                  {/* Specialties */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {member.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  {member.certifications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.certifications.slice(0, 2).map((cert, index) => (
                          <Badge key={index} className="bg-green-100 text-green-700 text-xs">
                            <DynamicIcon name="Award" className="w-3 h-3 mr-1" size={12} />
                            {cert}
                          </Badge>
                        ))}
                        {member.certifications.length > 2 && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            +{member.certifications.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-namc-blue-600 hover:bg-namc-blue-700">
                      <DynamicIcon name="User" className="w-4 h-4 mr-2" size={16} />
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline">
                      <DynamicIcon name="MessageSquare" className="w-4 h-4 mr-2" size={16} />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <DynamicIcon name="Search" className="w-12 h-12 text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all members
              </p>
              <Button onClick={() => { 
                setSearchTerm(''); 
                setTypeFilter('all'); 
                setLocationFilter('all'); 
                setStatusFilter('all'); 
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <section className="mt-16 text-center bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 text-white rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-namc-blue-100 mb-8 max-w-2xl mx-auto">
            Connect with Northern California's largest network of minority contractors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-namc-blue-600 hover:bg-namc-gray-100" asChild>
              <Link href="/register">
                <DynamicIcon name="UserPlus" className="w-5 h-5 mr-2" size={20} />
                Become a Member
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <DynamicIcon name="Download" className="w-5 h-5 mr-2" size={20} />
              Download Directory
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}