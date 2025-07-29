'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-namc-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About NAMC NorCal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-namc-blue-100 max-w-3xl mx-auto">
              Empowering minority contractors in Northern California for over three decades
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                Founded 1990
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                2,500+ Members
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                $2B+ Projects
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* Mission Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-namc-gray-900 mb-8">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-namc-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DynamicIcon name="Target" className="w-8 h-8 text-namc-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Advocate</h3>
                <p className="text-namc-gray-600">
                  Advocate for minority contractors in public and private sector opportunities
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DynamicIcon name="Users" className="w-8 h-8 text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Connect</h3>
                <p className="text-namc-gray-600">
                  Connect minority contractors with networking, mentorship, and business opportunities
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DynamicIcon name="TrendingUp" className="w-8 h-8 text-yellow-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Empower</h3>
                <p className="text-namc-gray-600">
                  Empower businesses through education, resources, and professional development
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* History Section */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-namc-gray-900 mb-6">Our History</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-namc-blue-500 pl-6">
                  <h3 className="text-xl font-semibold text-namc-blue-700 mb-2">1990 - Founded</h3>
                  <p className="text-namc-gray-600">
                    NAMC NorCal was established to address the lack of minority representation in the construction industry.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-semibold text-green-700 mb-2">2000s - Growth</h3>
                  <p className="text-namc-gray-600">
                    Expanded programs to include professional development, certification assistance, and advocacy.
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-6">
                  <h3 className="text-xl font-semibold text-yellow-700 mb-2">2020s - Innovation</h3>
                  <p className="text-namc-gray-600">
                    Launched digital transformation initiatives and partnerships with clean energy programs like TECH Clean California.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-namc-gray-100 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-namc-gray-900 mb-6">By the Numbers</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-namc-blue-600">2,500+</div>
                  <div className="text-namc-gray-600">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">$2B+</div>
                  <div className="text-namc-gray-600">Project Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">150+</div>
                  <div className="text-namc-gray-600">Annual Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">33+</div>
                  <div className="text-namc-gray-600">Years Serving</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section>
          <h2 className="text-3xl font-bold text-namc-gray-900 text-center mb-12">Our Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <DynamicIcon name="Zap" className="w-6 h-6 text-green-600" size={24} />
                </div>
                <CardTitle>TECH Clean California</CardTitle>
                <CardDescription>
                  Heat pump incentive program helping contractors earn up to $15,000 per installation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/programs/tech-clean-california">
                    Learn More
                    <DynamicIcon name="ArrowRight" className="w-4 h-4 ml-2" size={16} />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <DynamicIcon name="GraduationCap" className="w-6 h-6 text-blue-600" size={24} />
                </div>
                <CardTitle>Professional Development</CardTitle>
                <CardDescription>
                  Training programs, certifications, and continuing education opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Courses
                  <DynamicIcon name="ArrowRight" className="w-4 h-4 ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <DynamicIcon name="Handshake" className="w-6 h-6 text-purple-600" size={24} />
                </div>
                <CardTitle>Networking & Events</CardTitle>
                <CardDescription>
                  Regular networking events, mixers, and industry connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/events">
                    View Events
                    <DynamicIcon name="ArrowRight" className="w-4 h-4 ml-2" size={16} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-namc-gray-900 text-center mb-12">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-namc-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <DynamicIcon name="User" className="w-16 h-16 text-namc-gray-500" size={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maria Rodriguez</h3>
              <p className="text-namc-blue-600 font-medium mb-2">Executive Director</p>
              <p className="text-namc-gray-600 text-sm">
                25+ years of experience in construction and minority business advocacy
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-namc-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <DynamicIcon name="User" className="w-16 h-16 text-namc-gray-500" size={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2">James Chen</h3>
              <p className="text-namc-blue-600 font-medium mb-2">Program Director</p>
              <p className="text-namc-gray-600 text-sm">
                Expert in contractor certification and professional development programs
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-namc-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <DynamicIcon name="User" className="w-16 h-16 text-namc-gray-500" size={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sarah Williams</h3>
              <p className="text-namc-blue-600 font-medium mb-2">Membership Director</p>
              <p className="text-namc-gray-600 text-sm">
                Dedicated to member services and community outreach initiatives
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 text-white rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Join NAMC NorCal?</h2>
          <p className="text-xl text-namc-blue-100 mb-8 max-w-2xl mx-auto">
            Become part of Northern California's premier minority contractor organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-namc-blue-600 hover:bg-namc-gray-100" asChild>
              <Link href="/auth/register">
                <DynamicIcon name="UserPlus" className="w-5 h-5 mr-2" size={20} />
                Become a Member
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <DynamicIcon name="Phone" className="w-5 h-5 mr-2" size={20} />
              Contact Us
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}