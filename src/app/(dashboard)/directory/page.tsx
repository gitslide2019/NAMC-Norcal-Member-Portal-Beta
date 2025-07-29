'use client'

import { useState, useEffect } from 'react'
import { AuthRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { Search, Filter, Users, MapPin, Building2, Mail, Phone, MessageSquare, UserPlus } from 'lucide-react'

interface DirectoryMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  title?: string
  bio?: string
  city?: string
  state?: string
  memberType: 'REGULAR' | 'PREMIUM' | 'CORPORATE'
  specialties: string[]
  certifications: string[]
  joinDate: string
  isActive: boolean
  avatar?: string
}

// Mock data for directory - in real app this would come from API
const mockDirectoryMembers: DirectoryMember[] = [
  {
    id: '1',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria@rodriguezcons.com',
    phone: '(415) 555-0123',
    company: 'Rodriguez Construction LLC',
    title: 'CEO & Founder',
    bio: 'Specializing in sustainable construction and green building practices.',
    city: 'San Francisco',
    state: 'CA',
    memberType: 'PREMIUM',
    specialties: ['General Contracting', 'Green Building', 'Commercial Construction'],
    certifications: ['LEED Certified', 'TECH Clean California'],
    joinDate: '2022-01-15',
    isActive: true
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Chen',
    email: 'james@chenhvac.com',
    phone: '(510) 555-0456',
    company: 'Chen HVAC Services',
    title: 'Lead Technician',
    bio: 'Expert in energy-efficient HVAC systems and heat pump installations.',
    city: 'Oakland',
    state: 'CA',
    memberType: 'REGULAR',
    specialties: ['HVAC Installation', 'Heat Pumps', 'Energy Efficiency'],
    certifications: ['TECH Clean California', 'EPA Certified'],
    joinDate: '2023-03-22',
    isActive: true
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah@williamselectric.com',
    phone: '(408) 555-0789',
    company: 'Williams Electrical Co.',
    title: 'Master Electrician',
    bio: 'Licensed electrician with expertise in solar installations and smart home systems.',
    city: 'San Jose',
    state: 'CA',
    memberType: 'CORPORATE',
    specialties: ['Electrical Systems', 'Solar Installation', 'Smart Home'],
    certifications: ['Licensed Electrician', 'Solar Certified'],
    joinDate: '2021-08-10',
    isActive: true
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Thompson',
    email: 'mike@thompsonplumbing.com',
    phone: '(510) 555-1234',
    company: 'Thompson Plumbing',
    title: 'Owner',
    bio: 'Reliable plumbing services with 24/7 emergency support.',
    city: 'Fremont',
    state: 'CA',
    memberType: 'REGULAR',
    specialties: ['Plumbing', 'Water Systems', 'Emergency Repairs'],
    certifications: ['Licensed Plumber', 'Backflow Certified'],
    joinDate: '2023-06-05',
    isActive: true
  }
]

const memberTypeConfig = {
  REGULAR: { color: 'bg-blue-100 text-blue-700', label: 'Regular' },
  PREMIUM: { color: 'bg-purple-100 text-purple-700', label: 'Premium' },
  CORPORATE: { color: 'bg-orange-100 text-orange-700', label: 'Corporate' }
}

export default function DirectoryPage() {
  const [members, setMembers] = useState<DirectoryMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<DirectoryMember[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Load members data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMembers(mockDirectoryMembers)
      setFilteredMembers(mockDirectoryMembers)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter members based on search and filters
  useEffect(() => {
    let filtered = members

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Member type filter
    if (memberTypeFilter !== 'all') {
      filtered = filtered.filter(member => member.memberType === memberTypeFilter)
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(member => member.city === locationFilter)
    }

    // Specialty filter
    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()))
      )
    }

    setFilteredMembers(filtered)
  }, [members, searchTerm, memberTypeFilter, locationFilter, specialtyFilter])

  const handleSendMessage = (member: DirectoryMember) => {
    // In real app, this would open messaging interface or navigate to messages
    console.log('Send message to:', member.firstName, member.lastName)
  }

  const handleViewProfile = (member: DirectoryMember) => {
    // In real app, this would navigate to full member profile
    console.log('View profile of:', member.firstName, member.lastName)
  }

  // Get unique locations and specialties for filters
  const locations = Array.from(new Set(members.map(m => m.city).filter(Boolean)))
  const specialties = Array.from(new Set(members.flatMap(m => m.specialties)))

  if (isLoading) {
    return (
      <AuthRequiredRoute>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-namc-blue-600 mx-auto mb-4"></div>
            <p className="text-namc-gray-600">Loading member directory...</p>
          </div>
        </div>
      </AuthRequiredRoute>
    )
  }

  return (
    <AuthRequiredRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-namc-gray-900">Member Directory</h1>
            <p className="text-namc-gray-600 mt-2">
              Connect with {members.length} certified minority contractors
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-namc-gray-400" />
            <span className="text-sm text-namc-gray-600">{filteredMembers.length} members</span>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search & Filter
            </CardTitle>
            <CardDescription>Find contractors by name, company, location, or specialty</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
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
                  {locations.map(location => (
                    <SelectItem key={location} value={location || ''}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const typeConfig = memberTypeConfig[member.memberType]
            
            return (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-namc-blue-600 text-white font-semibold">
                        {member.firstName[0]}{member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-lg truncate">
                          {member.firstName} {member.lastName}
                        </CardTitle>
                        <Badge className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                      </div>
                      {member.company && (
                        <CardDescription className="font-medium text-namc-blue-600 truncate">
                          {member.company}
                        </CardDescription>
                      )}
                      {member.title && (
                        <p className="text-sm text-namc-gray-600 truncate">{member.title}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    {member.city && member.state && (
                      <div className="flex items-center text-sm text-namc-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{member.city}, {member.state}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-namc-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-sm text-namc-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-sm text-namc-gray-700 line-clamp-2">{member.bio}</p>
                  )}

                  {/* Specialties */}
                  <div>
                    <h4 className="text-sm font-medium text-namc-gray-900 mb-2">Specialties</h4>
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
                    <div>
                      <h4 className="text-sm font-medium text-namc-gray-900 mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.certifications.slice(0, 2).map((cert, index) => (
                          <Badge key={index} className="bg-green-100 text-green-700 text-xs">
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

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleViewProfile(member)}
                      className="flex-1 bg-namc-blue-600 hover:bg-namc-blue-700"
                    >
                      <DynamicIcon name="User" className="w-4 h-4 mr-2" size={16} />
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSendMessage(member)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
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
              <Users className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-namc-gray-900 mb-2">No members found</h3>
              <p className="text-namc-gray-600 mb-4">
                Try adjusting your search criteria or browse all members
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setMemberTypeFilter('all')
                  setLocationFilter('all')
                  setSpecialtyFilter('all')
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthRequiredRoute>
  )
}