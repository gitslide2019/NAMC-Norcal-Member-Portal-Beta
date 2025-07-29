'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthRequiredRoute } from '@/components/auth/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

// Mock data - in real app, this would come from API
const mockCourses = [
  {
    id: '1',
    title: 'OSHA 30-Hour Construction Safety Training',
    category: 'SAFETY',
    level: 'INTERMEDIATE',
    duration: 30,
    format: 'ONLINE',
    price: 299,
    memberPrice: 199,
    rating: 4.8,
    enrolledCount: 234,
    description: 'Comprehensive OSHA safety training covering construction hazards, fall protection, electrical safety, and more.',
    instructor: 'Safety Institute of California',
    isEnrolled: true,
    progress: 75,
    nextLesson: 'Module 8: Electrical Safety',
    certificateAwarded: true,
    tags: ['OSHA', 'Safety', 'Required', 'Construction'],
  },
  {
    id: '2',
    title: 'Green Building and LEED Certification',
    category: 'SUSTAINABILITY',
    level: 'ADVANCED',
    duration: 24,
    format: 'HYBRID',
    price: 599,
    memberPrice: 399,
    rating: 4.9,
    enrolledCount: 156,
    description: 'Learn sustainable building practices and prepare for LEED certification with hands-on projects.',
    instructor: 'California Green Building Council',
    isEnrolled: false,
    progress: 0,
    nextLesson: null,
    certificateAwarded: true,
    tags: ['LEED', 'Green Building', 'Sustainability', 'Certification'],
  },
  {
    id: '3',
    title: 'Project Management for Contractors',
    category: 'BUSINESS',
    level: 'INTERMEDIATE',
    duration: 16,
    format: 'ONLINE',
    price: 399,
    memberPrice: 249,
    rating: 4.7,
    enrolledCount: 189,
    description: 'Master project management techniques specific to construction projects, including scheduling, budgeting, and team management.',
    instructor: 'Construction Management Institute',
    isEnrolled: true,
    progress: 30,
    nextLesson: 'Module 3: Budget Management',
    certificateAwarded: true,
    tags: ['Project Management', 'Business', 'Leadership', 'Planning'],
  },
  {
    id: '4',
    title: 'Digital Marketing for Construction Companies',
    category: 'MARKETING',
    level: 'BEGINNER',
    duration: 12,
    format: 'ONLINE',
    price: 199,
    memberPrice: 149,
    rating: 4.5,
    enrolledCount: 98,
    description: 'Learn how to market your construction business online, including website optimization, social media, and lead generation.',
    instructor: 'Digital Marketing Pro',
    isEnrolled: false,
    progress: 0,
    nextLesson: null,
    certificateAwarded: false,
    tags: ['Marketing', 'Digital', 'Business Growth', 'Online'],
  },
  {
    id: '5',
    title: 'California Building Code Updates 2024',
    category: 'COMPLIANCE',
    level: 'INTERMEDIATE',
    duration: 8,
    format: 'LIVE_WEBINAR',
    price: 149,
    memberPrice: 99,
    rating: 4.6,
    enrolledCount: 312,
    description: 'Stay current with the latest California building code changes and requirements for 2024.',
    instructor: 'California Building Officials',
    isEnrolled: true,
    progress: 100,
    nextLesson: null,
    certificateAwarded: true,
    tags: ['Building Code', 'Compliance', 'California', 'Updates'],
  },
]

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'SAFETY', label: 'Safety & Compliance' },
  { value: 'SUSTAINABILITY', label: 'Sustainability' },
  { value: 'BUSINESS', label: 'Business & Management' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'COMPLIANCE', label: 'Code & Compliance' },
  { value: 'TECHNICAL', label: 'Technical Skills' },
]

const levelOptions = [
  { value: 'all', label: 'All Levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
]

const formatOptions = [
  { value: 'all', label: 'All Formats' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'LIVE_WEBINAR', label: 'Live Webinar' },
  { value: 'IN_PERSON', label: 'In Person' },
]

function getLevelColor(level: string): string {
  switch (level) {
    case 'BEGINNER':
      return 'bg-green-100 text-green-700'
    case 'INTERMEDIATE':
      return 'bg-yellow-100 text-yellow-700'
    case 'ADVANCED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'SAFETY':
      return 'bg-red-100 text-red-700'
    case 'SUSTAINABILITY':
      return 'bg-green-100 text-green-700'
    case 'BUSINESS':
      return 'bg-blue-100 text-blue-700'
    case 'MARKETING':
      return 'bg-purple-100 text-purple-700'
    case 'COMPLIANCE':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function CoursesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false)

  // Filter courses based on search and filters
  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
    const matchesFormat = selectedFormat === 'all' || course.format === selectedFormat
    const matchesEnrollment = !showEnrolledOnly || course.isEnrolled
    
    return matchesSearch && matchesCategory && matchesLevel && matchesFormat && matchesEnrollment
  })

  const enrolledCourses = mockCourses.filter(course => course.isEnrolled)
  const completedCourses = enrolledCourses.filter(course => course.progress === 100)
  const inProgressCourses = enrolledCourses.filter(course => course.progress > 0 && course.progress < 100)

  const handleEnrollCourse = (courseId: string) => {
    // In real app, this would call API to enroll in course
    console.log('Enrolling in course:', courseId)
  }

  const handleContinueCourse = (courseId: string) => {
    // In real app, this would navigate to course content
    console.log('Continuing course:', courseId)
  }

  return (
    <AuthRequiredRoute>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-namc-gray-900">Learning Center</h1>
          <p className="text-namc-gray-600 mt-1">
            Advance your skills with professional development courses and certifications
          </p>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-namc-gray-900">{enrolledCourses.length}</p>
                </div>
                <DynamicIcon name="BookOpen" className="h-8 w-8 text-namc-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-namc-gray-900">{inProgressCourses.length}</p>
                </div>
                <DynamicIcon name="Clock" className="h-8 w-8 text-namc-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-namc-gray-900">{completedCourses.length}</p>
                </div>
                <DynamicIcon name="CheckCircle" className="h-8 w-8 text-namc-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-namc-gray-600">Certificates</p>
                  <p className="text-2xl font-bold text-namc-gray-900">
                    {completedCourses.filter(c => c.certificateAwarded).length}
                  </p>
                </div>
                <DynamicIcon name="Award" className="h-8 w-8 text-namc-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search & Filter Courses</CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enrolled-only"
                  checked={showEnrolledOnly}
                  onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                  className="rounded border-namc-gray-300"
                />
                <label htmlFor="enrolled-only" className="text-sm text-namc-gray-700">
                  Show enrolled only
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                  Search Courses
                </label>
                <div className="relative">
                  <DynamicIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-namc-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                  Level
                </label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-namc-gray-700 mb-2">
                  Format
                </label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
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
                    setSelectedCategory('all')
                    setSelectedLevel('all')
                    setSelectedFormat('all')
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
            Showing {filteredCourses.length} of {mockCourses.length} courses
          </p>
        </div>

        {/* Course List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      {course.isEnrolled && (
                        <Badge variant="secondary" className="bg-namc-blue-100 text-namc-blue-700">
                          Enrolled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getCategoryColor(course.category)}>
                        {course.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <Badge variant="outline">
                        {course.format.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-namc-gray-600">
                      <div className="flex items-center">
                        <DynamicIcon name="Clock" className="w-4 h-4 mr-1" />
                        {course.duration} hours
                      </div>
                      <div className="flex items-center">
                        <DynamicIcon name="Users" className="w-4 h-4 mr-1" />
                        {course.enrolledCount} enrolled
                      </div>
                      <div className="flex items-center">
                        <DynamicIcon name="Star" className="w-4 h-4 mr-1 text-yellow-400" />
                        {course.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {user?.memberType !== 'admin' && (
                      <div>
                        <p className="text-lg font-bold text-namc-gray-900">
                          ${course.memberPrice}
                        </p>
                        {course.price !== course.memberPrice && (
                          <p className="text-sm text-namc-gray-500 line-through">
                            ${course.price}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-namc-gray-600 mb-4">
                  {course.description}
                </CardDescription>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-namc-gray-700 mb-1">
                    Instructor: {course.instructor}
                  </p>
                </div>

                {course.isEnrolled && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-namc-gray-700">Progress</span>
                      <span className="text-sm text-namc-gray-600">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    {course.nextLesson && course.progress < 100 && (
                      <p className="text-sm text-namc-gray-600 mt-2">
                        Next: {course.nextLesson}
                      </p>
                    )}
                    {course.progress === 100 && course.certificateAwarded && (
                      <div className="flex items-center mt-2 text-sm text-namc-green-600">
                        <DynamicIcon name="Award" className="w-4 h-4 mr-1" />
                        Certificate available
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {course.certificateAwarded && (
                      <div className="flex items-center text-sm text-namc-gray-600">
                        <DynamicIcon name="Award" className="w-4 h-4 mr-1" />
                        Certificate
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <DynamicIcon name="Eye" className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    {course.isEnrolled ? (
                      <Button
                        size="sm"
                        onClick={() => handleContinueCourse(course.id)}
                        disabled={course.progress === 100}
                      >
                        {course.progress === 100 ? (
                          <>
                            <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        ) : course.progress > 0 ? (
                          <>
                            <DynamicIcon name="Play" className="w-4 h-4 mr-2" />
                            Continue
                          </>
                        ) : (
                          <>
                            <DynamicIcon name="Play" className="w-4 h-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleEnrollCourse(course.id)}
                      >
                        <DynamicIcon name="Plus" className="w-4 h-4 mr-2" />
                        Enroll
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <DynamicIcon name="BookOpen" className="w-12 h-12 text-namc-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-namc-gray-900 mb-2">No courses found</h3>
              <p className="text-namc-gray-600 mb-4">
                Try adjusting your search criteria or check back later for new courses.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedLevel('all')
                  setSelectedFormat('all')
                  setShowEnrolledOnly(false)
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