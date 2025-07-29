'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

interface Resource {
  id: string
  title: string
  type: 'DOCUMENT' | 'GUIDE' | 'TEMPLATE' | 'VIDEO' | 'LINK' | 'CERTIFICATION'
  category: 'BUSINESS' | 'TECHNICAL' | 'COMPLIANCE' | 'TRAINING' | 'LEGAL' | 'FINANCE'
  description: string
  fileSize?: string
  format?: string
  downloadCount: number
  uploadDate: string
  author: string
  featured: boolean
  tags: string[]
  url?: string
  requiresMembership: boolean
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'TECH Clean California Program Guide',
    type: 'GUIDE',
    category: 'TECHNICAL',
    description: 'Complete guide to participating in the TECH Clean California heat pump incentive program, including certification requirements and project workflow.',
    fileSize: '2.5 MB',
    format: 'PDF',
    downloadCount: 1250,
    uploadDate: '2024-01-15',
    author: 'NAMC NorCal',
    featured: true,
    tags: ['TECH Program', 'Heat Pumps', 'Incentives', 'Certification'],
    requiresMembership: false
  },
  {
    id: '2',
    title: 'California Contractor License Application Template',
    type: 'TEMPLATE',
    category: 'LEGAL',
    description: 'Fillable template for California contractor license applications with step-by-step instructions and required documentation checklist.',
    fileSize: '1.8 MB',
    format: 'PDF',
    downloadCount: 890,
    uploadDate: '2024-02-01',
    author: 'Legal Department',
    featured: true,
    tags: ['Licensing', 'Legal', 'Applications', 'Templates'],
    requiresMembership: true
  },
  {
    id: '3',
    title: 'Small Business Finance Guide',
    type: 'DOCUMENT',
    category: 'FINANCE',
    description: 'Comprehensive guide to financing options for small contractors including SBA loans, grants, and alternative funding sources.',
    fileSize: '3.2 MB',
    format: 'PDF',
    downloadCount: 675,
    uploadDate: '2024-01-20',
    author: 'Finance Committee',
    featured: false,
    tags: ['Finance', 'SBA Loans', 'Grants', 'Small Business'],
    requiresMembership: true
  },
  {
    id: '4',
    title: 'OSHA Safety Training Video Series',
    type: 'VIDEO',
    category: 'COMPLIANCE',
    description: 'Complete OSHA safety training video series covering construction site safety, hazard identification, and regulatory compliance.',
    fileSize: '450 MB',
    format: 'MP4',
    downloadCount: 1100,
    uploadDate: '2024-01-10',
    author: 'Safety Committee',
    featured: true,
    tags: ['OSHA', 'Safety', 'Training', 'Compliance'],
    requiresMembership: false
  },
  {
    id: '5',
    title: 'Project Proposal Template Pack',
    type: 'TEMPLATE',
    category: 'BUSINESS',
    description: 'Collection of professional project proposal templates for residential and commercial construction projects.',
    fileSize: '1.2 MB',
    format: 'DOCX',
    downloadCount: 2100,
    uploadDate: '2024-02-05',
    author: 'Business Development',
    featured: false,
    tags: ['Proposals', 'Templates', 'Business', 'Contracts'],
    requiresMembership: true
  },
  {
    id: '6',
    title: 'Green Building Certification Directory',
    type: 'LINK',
    category: 'TECHNICAL',
    description: 'Online directory of green building certifications, requirements, and training programs available in California.',
    downloadCount: 450,
    uploadDate: '2024-01-25',
    author: 'Technical Committee',
    featured: false,
    tags: ['Green Building', 'LEED', 'Certification', 'Sustainability'],
    url: 'https://greenbuild-ca.org/directory',
    requiresMembership: false
  },
  {
    id: '7',
    title: 'Digital Marketing Toolkit for Contractors',
    type: 'GUIDE',
    category: 'BUSINESS',
    description: 'Complete digital marketing toolkit including social media templates, website guidelines, and online advertising strategies.',
    fileSize: '4.1 MB',
    format: 'ZIP',
    downloadCount: 780,
    uploadDate: '2024-02-10',
    author: 'Marketing Committee',
    featured: false,
    tags: ['Marketing', 'Digital', 'Social Media', 'Business Growth'],
    requiresMembership: true
  },
  {
    id: '8',
    title: 'Apprenticeship Program Registration',
    type: 'DOCUMENT',
    category: 'TRAINING',
    description: 'Information and registration forms for NAMC NorCal apprenticeship programs in various construction trades.',
    fileSize: '900 KB',
    format: 'PDF',
    downloadCount: 320,
    uploadDate: '2024-02-15',
    author: 'Training Department',
    featured: false,
    tags: ['Apprenticeship', 'Training', 'Education', 'Workforce'],
    requiresMembership: true
  }
]

const typeConfig = {
  DOCUMENT: { color: 'bg-blue-100 text-blue-700', icon: 'FileText' },
  GUIDE: { color: 'bg-green-100 text-green-700', icon: 'Book' },
  TEMPLATE: { color: 'bg-purple-100 text-purple-700', icon: 'Layout' },
  VIDEO: { color: 'bg-red-100 text-red-700', icon: 'Video' },
  LINK: { color: 'bg-cyan-100 text-cyan-700', icon: 'ExternalLink' },
  CERTIFICATION: { color: 'bg-yellow-100 text-yellow-700', icon: 'Award' }
}

const categoryConfig = {
  BUSINESS: { color: 'bg-indigo-100 text-indigo-700', label: 'Business' },
  TECHNICAL: { color: 'bg-blue-100 text-blue-700', label: 'Technical' },
  COMPLIANCE: { color: 'bg-red-100 text-red-700', label: 'Compliance' },
  TRAINING: { color: 'bg-green-100 text-green-700', label: 'Training' },
  LEGAL: { color: 'bg-gray-100 text-gray-700', label: 'Legal' },
  FINANCE: { color: 'bg-yellow-100 text-yellow-700', label: 'Finance' }
}

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')

  // Filter and sort resources
  const filteredResources = mockResources
    .filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = typeFilter === 'all' || resource.type === typeFilter
      const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter
      
      return matchesSearch && matchesType && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.featured !== b.featured) return b.featured ? 1 : -1
          return b.downloadCount - a.downloadCount
        case 'title':
          return a.title.localeCompare(b.title)
        case 'date':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        case 'downloads':
          return b.downloadCount - a.downloadCount
        default:
          return 0
      }
    })

  const featuredResources = filteredResources.filter(resource => resource.featured)
  const regularResources = filteredResources.filter(resource => !resource.featured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-namc-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Resource Library
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-namc-blue-100 max-w-3xl mx-auto">
              Essential documents, guides, and tools for construction professionals
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                50+ Resources
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                Expert Curated
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                Always Updated
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Find Resources</CardTitle>
            <CardDescription>Search and filter our resource library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search resources by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="lg:w-48">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DOCUMENT">Documents</SelectItem>
                  <SelectItem value="GUIDE">Guides</SelectItem>
                  <SelectItem value="TEMPLATE">Templates</SelectItem>
                  <SelectItem value="VIDEO">Videos</SelectItem>
                  <SelectItem value="LINK">Links</SelectItem>
                  <SelectItem value="CERTIFICATION">Certifications</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="lg:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                  <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                  <SelectItem value="LEGAL">Legal</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="lg:w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured First</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="date">Upload Date</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-namc-gray-900 mb-6 flex items-center">
              <DynamicIcon name="Star" className="w-6 h-6 mr-2 text-yellow-600" size={24} />
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredResources.map((resource) => {
                const config = typeConfig[resource.type]
                const resourceCategoryConfig = categoryConfig[resource.category]
                
                return (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={config.color}>
                              <DynamicIcon name={config.icon} className="w-3 h-3 mr-1" size={12} />
                              {resource.type}
                            </Badge>
                            <Badge className={resourceCategoryConfig.color}>
                              {resourceCategoryConfig.label}
                            </Badge>
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <DynamicIcon name="Star" className="w-3 h-3 mr-1" size={12} />
                              Featured
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{resource.title}</CardTitle>
                          <CardDescription className="text-base">{resource.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-600">
                            <DynamicIcon name="User" className="w-4 h-4 mr-2" size={16} />
                            {resource.author}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <DynamicIcon name="Calendar" className="w-4 h-4 mr-2" size={16} />
                            {formatDate(resource.uploadDate)}
                          </div>
                        </div>
                        {resource.fileSize && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <DynamicIcon name="Download" className="w-4 h-4 mr-2" size={16} />
                              {formatDownloads(resource.downloadCount)} downloads
                            </div>
                            <div className="flex items-center text-gray-600">
                              <DynamicIcon name="File" className="w-4 h-4 mr-2" size={16} />
                              {resource.fileSize} • {resource.format}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        {resource.requiresMembership && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <DynamicIcon name="Lock" className="w-3 h-3 mr-1" size={12} />
                            Members Only
                          </Badge>
                        )}
                        <div className="flex gap-2 ml-auto">
                          {resource.type === 'LINK' ? (
                            <Button className="bg-namc-blue-600 hover:bg-namc-blue-700" asChild>
                              <Link href={resource.url || '#'} target="_blank">
                                <DynamicIcon name="ExternalLink" className="w-4 h-4 mr-2" size={16} />
                                Visit Link
                              </Link>
                            </Button>
                          ) : (
                            <Button className="bg-namc-blue-600 hover:bg-namc-blue-700">
                              <DynamicIcon name="Download" className="w-4 h-4 mr-2" size={16} />
                              Download
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <DynamicIcon name="Eye" className="w-4 h-4" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Regular Resources */}
        <section>
          <h2 className="text-2xl font-bold text-namc-gray-900 mb-6 flex items-center">
            <DynamicIcon name="Folder" className="w-6 h-6 mr-2 text-namc-blue-600" size={24} />
            All Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularResources.map((resource) => {
              const config = typeConfig[resource.type]
              const resourceCategory = categoryConfig[resource.category]
              
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={config.color}>
                        <DynamicIcon name={config.icon} className="w-3 h-3 mr-1" size={12} />
                        {resource.type}
                      </Badge>
                      <Badge className={resourceCategory.color}>
                        {resourceCategory.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <DynamicIcon name="User" className="w-4 h-4 mr-2" size={16} />
                        {resource.author}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DynamicIcon name="Calendar" className="w-4 h-4 mr-2" size={16} />
                        {formatDate(resource.uploadDate)}
                      </div>
                      {resource.fileSize && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DynamicIcon name="File" className="w-4 h-4 mr-2" size={16} />
                          {resource.fileSize} • {resource.format}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <DynamicIcon name="Download" className="w-4 h-4 mr-2" size={16} />
                        {formatDownloads(resource.downloadCount)} downloads
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {resource.requiresMembership && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          <DynamicIcon name="Lock" className="w-3 h-3 mr-1" size={12} />
                          Members Only
                        </Badge>
                      )}
                      <div className="flex gap-2 ml-auto">
                        {resource.type === 'LINK' ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={resource.url || '#'} target="_blank">
                              <DynamicIcon name="ExternalLink" className="w-4 h-4" size={16} />
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <DynamicIcon name="Download" className="w-4 h-4" size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <DynamicIcon name="Search" className="w-12 h-12 text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all resources
              </p>
              <Button onClick={() => { 
                setSearchTerm(''); 
                setTypeFilter('all'); 
                setCategoryFilter('all'); 
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <section className="mt-16 text-center bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 text-white rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4">Have a Resource to Share?</h2>
          <p className="text-xl text-namc-blue-100 mb-8 max-w-2xl mx-auto">
            Help the community by contributing valuable resources and expertise
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-namc-blue-600 hover:bg-namc-gray-100">
              <DynamicIcon name="Upload" className="w-5 h-5 mr-2" size={20} />
              Submit Resource
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <DynamicIcon name="MessageSquare" className="w-5 h-5 mr-2" size={20} />
              Suggest Content
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}