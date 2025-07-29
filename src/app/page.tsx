'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, MetricCard, FeatureCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Target
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Enhanced 21st.dev Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-namc-blue-600 via-namc-blue-700 to-namc-blue-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:60px_60px]" />
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 animate-fade-in">
                <Star className="w-3 h-3 mr-1" />
                Welcome to NAMC NorCal
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight animate-fade-in animation-delay-200">
                Empowering Minority
                <br />
                <span className="bg-gradient-to-r from-namc-gold-400 to-namc-gold-300 bg-clip-text text-transparent">
                  Contractors
                </span>
                <br />
                in Northern California
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-white/90 max-w-4xl mx-auto leading-relaxed animate-fade-in animation-delay-400">
                Connect, grow, and succeed with our comprehensive digital platform. 
                Access <span className="font-semibold text-namc-gold-300">$100M+</span> in project opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-600">
                <Button asChild size="xl" variant="gold" className="group">
                  <Link href="/register">
                    Join NAMC NorCal
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in animation-delay-600">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-white/70 text-sm">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-namc-gold-300 mb-2">$100M+</div>
                <div className="text-white/70 text-sm">Project Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
                <div className="text-white/70 text-sm">Annual Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-namc-green-300 mb-2">95%</div>
                <div className="text-white/70 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 text-namc-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Key Metrics Section - Modern Dashboard Style */}
      <section className="py-20 bg-namc-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-namc-blue-100 text-namc-blue-800">
              <Target className="w-3 h-3 mr-1" />
              Platform Impact
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-namc-gray-900 mb-4">
              Driving Real Results for Contractors
            </h2>
            <p className="text-lg text-namc-gray-600 max-w-2xl mx-auto">
              See how NAMC NorCal is making a measurable difference in the construction industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Members"
              value="500+"
              description="Growing community"
              trend="up"
              trendValue="+12% this quarter"
              icon={<Users className="w-6 h-6 text-namc-blue-600" />}
            />
            <MetricCard
              title="Project Opportunities"
              value="$100M+"
              description="Available contracts"
              trend="up"
              trendValue="+25% this year"
              icon={<Building2 className="w-6 h-6 text-namc-gold-600" />}
            />
            <MetricCard
              title="Annual Events"
              value="50+"
              description="Training & networking"
              trend="neutral"
              trendValue="Industry leading"
              icon={<Calendar className="w-6 h-6 text-namc-green-600" />}
            />
            <MetricCard
              title="Member Satisfaction"
              value="95%"
              description="5-star rating average"
              trend="up"
              trendValue="Excellent feedback"
              icon={<Star className="w-6 h-6 text-namc-gold-600" />}
            />
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Design */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-namc-green-100 text-namc-green-800">
              <Zap className="w-3 h-3 mr-1" />
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-namc-gray-900 mb-6">
              Everything You Need to 
              <span className="bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-namc-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our comprehensive platform provides all the tools and resources 
              minority contractors need to grow their businesses and win more projects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Project Opportunities"
              description="Access exclusive construction projects and bidding opportunities with direct client connections."
              icon={<Building2 className="w-6 h-6 text-namc-blue-600" />}
              features={[
                "Real-time project notifications",
                "AI-powered project matching",
                "Simplified application process",
                "Direct client connections"
              ]}
              actionLabel="Explore Projects"
              onAction={() => console.log('Navigate to projects')}
            />

            <FeatureCard
              title="Networking & Community"
              description="Connect with fellow contractors and industry professionals in a thriving community."
              icon={<Users className="w-6 h-6 text-namc-green-600" />}
              features={[
                "Member directory with search",
                "Direct messaging system",
                "Community forums",
                "Mentorship programs"
              ]}
              actionLabel="Join Community"
              onAction={() => console.log('Navigate to community')}
            />

            <FeatureCard
              title="Events & Training"
              description="Attend workshops, conferences, and professional development events to advance your skills."
              icon={<Calendar className="w-6 h-6 text-namc-gold-600" />}
              features={[
                "Industry conferences",
                "Skills training workshops",
                "Certification programs",
                "Networking events"
              ]}
              actionLabel="View Events"
              onAction={() => console.log('Navigate to events')}
            />

            <FeatureCard
              title="Learning Management"
              description="Access comprehensive training and educational resources to stay ahead in the industry."
              icon={<BookOpen className="w-6 h-6 text-namc-cyan-600" />}
              features={[
                "Online courses and modules",
                "Industry best practices",
                "Compliance training",
                "Certification tracking"
              ]}
              actionLabel="Start Learning"
              onAction={() => console.log('Navigate to learning')}
            />

            <FeatureCard
              title="Communication Hub"
              description="Stay informed with announcements and direct messaging capabilities across the platform."
              icon={<MessageSquare className="w-6 h-6 text-namc-red-600" />}
              features={[
                "Real-time announcements",
                "Direct member messaging",
                "Project updates",
                "Event notifications"
              ]}
              actionLabel="Get Connected"
              onAction={() => console.log('Navigate to messages')}
            />

            <FeatureCard
              title="Business Analytics"
              description="Track your progress and access business insights to make data-driven decisions."
              icon={<TrendingUp className="w-6 h-6 text-namc-blue-600" />}
              features={[
                "Performance dashboards",
                "Project tracking",
                "Revenue analytics",
                "Growth metrics"
              ]}
              actionLabel="View Analytics"
              onAction={() => console.log('Navigate to analytics')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced Design */}
      <section className="relative py-24 bg-gradient-to-br from-namc-blue-600 via-namc-blue-700 to-namc-blue-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:60px_60px]" />
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              <Shield className="w-3 h-3 mr-1" />
              Trusted by 500+ Contractors
            </Badge>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
              Ready to Grow Your 
              <span className="bg-gradient-to-r from-namc-gold-300 to-namc-gold-400 bg-clip-text text-transparent">
                {" "}Business?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of successful minority contractors who are already 
              benefiting from the NAMC NorCal platform and winning more projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="xl" variant="gold" className="group">
                <Link href="/register">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-namc-green-300" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-namc-green-300" />
                <span>Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-namc-green-300" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced Design */}
      <section className="py-24 bg-namc-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-namc-gold-100 text-namc-gold-800">
              <Star className="w-3 h-3 mr-1" />
              Member Success Stories
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-namc-gray-900 mb-6">
              What Our Members 
              <span className="bg-gradient-to-r from-namc-green-600 to-namc-green-700 bg-clip-text text-transparent"> Say</span>
            </h2>
            <p className="text-xl text-namc-gray-600 max-w-3xl mx-auto">
              Hear from successful contractors who have grown their businesses and won more projects with NAMC NorCal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card variant="elevated" className="relative">
              <CardContent className="pt-8 pb-6">
                {/* Quote Mark */}
                <div className="absolute top-4 left-6 text-namc-blue-200 text-4xl font-serif">"</div>
                
                {/* Rating */}
                <div className="flex items-center mb-6 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-namc-gold-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-namc-gray-700 mb-6 text-lg leading-relaxed">
                  "NAMC NorCal has been instrumental in growing our business. 
                  The project opportunities and networking events have opened 
                  doors we never thought possible."
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-namc-blue-500 to-namc-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-lg">MJ</span>
                  </div>
                  <div>
                    <div className="font-semibold text-namc-gray-900">Maria Johnson</div>
                    <div className="text-sm text-namc-gray-600">CEO, Johnson Construction</div>
                    <div className="text-xs text-namc-blue-600 font-medium">Member since 2022</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card variant="elevated" className="relative md:transform md:scale-105 md:shadow-namc-xl">
              <CardContent className="pt-8 pb-6">
                {/* Quote Mark */}
                <div className="absolute top-4 left-6 text-namc-green-200 text-4xl font-serif">"</div>
                
                {/* Rating */}
                <div className="flex items-center mb-6 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-namc-gold-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-namc-gray-700 mb-6 text-lg leading-relaxed">
                  "The training programs and mentorship opportunities have 
                  helped us improve our processes and win bigger contracts. 
                  Revenue increased by 40% in our first year!"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-namc-green-500 to-namc-green-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-lg">CS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-namc-gray-900">Carlos Santos</div>
                    <div className="text-sm text-namc-gray-600">Founder, Santos Builders</div>
                    <div className="text-xs text-namc-green-600 font-medium">Member since 2021</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card variant="elevated" className="relative">
              <CardContent className="pt-8 pb-6">
                {/* Quote Mark */}
                <div className="absolute top-4 left-6 text-namc-gold-200 text-4xl font-serif">"</div>
                
                {/* Rating */}
                <div className="flex items-center mb-6 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-namc-gold-500 fill-current" />
                  ))}
                </div>
                
                <p className="text-namc-gray-700 mb-6 text-lg leading-relaxed">
                  "The community support and networking events have been 
                  invaluable. We've formed partnerships that have transformed 
                  our business completely."
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-namc-gold-500 to-namc-gold-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-lg">LW</span>
                  </div>
                  <div>
                    <div className="font-semibold text-namc-gray-900">Lisa Washington</div>
                    <div className="text-sm text-namc-gray-600">Owner, Washington Contracting</div>
                    <div className="text-xs text-namc-gold-600 font-medium">Member since 2020</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Trust Elements */}
          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-namc-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-namc-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-namc-green-600" />
                </div>
                <span className="text-sm font-medium">500+ satisfied members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-namc-gold-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-namc-gold-600" />
                </div>
                <span className="text-sm font-medium">4.9/5 average rating</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-namc-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-namc-blue-600" />
                </div>
                <span className="text-sm font-medium">Trusted since 2019</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 