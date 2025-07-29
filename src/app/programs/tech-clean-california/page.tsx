'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { TechDashboardWidget, mockTechData } from '@/components/tech/TechDashboardWidget'

interface Incentive {
  equipmentType: string
  minAmount: number
  maxAmount: number
  description: string
  requirements: string[]
}

interface Utility {
  name: string
  territory: string
  contactPhone: string
  contactEmail: string
  website: string
  specialRequirements?: string[]
}

const incentiveData: Incentive[] = [
  {
    equipmentType: 'Air Source Heat Pump',
    minAmount: 3000,
    maxAmount: 7000,
    description: 'High-efficiency air source heat pumps for residential and small commercial applications',
    requirements: ['HERS Rating', 'Energy Star Certified', 'Professional Installation']
  },
  {
    equipmentType: 'Ground Source Heat Pump',
    minAmount: 6000,
    maxAmount: 15000,
    description: 'Geothermal heat pump systems with superior efficiency ratings',
    requirements: ['Geothermal Certified Installer', 'Soil Analysis', 'System Design Approval']
  },
  {
    equipmentType: 'Heat Pump Water Heater',
    minAmount: 1500,
    maxAmount: 4000,
    description: 'Energy-efficient heat pump water heating systems',
    requirements: ['UEF Rating ≥2.75', 'Professional Installation', 'Proper Sizing']
  },
  {
    equipmentType: 'Ductless Mini-Split',
    minAmount: 2000,
    maxAmount: 5500,
    description: 'Ductless heat pump systems for targeted heating and cooling',
    requirements: ['ENERGY STAR Certified', 'Load Calculation', 'Proper Refrigerant Handling']
  }
]

const utilityPartners: Utility[] = [
  {
    name: 'Pacific Gas & Electric (PG&E)',
    territory: 'Northern California',
    contactPhone: '1-800-468-4743',
    contactEmail: 'tech@pge.com',
    website: 'www.pge.com/tech',
    specialRequirements: ['Pre-approval required', 'Custom rebate calculator']
  },
  {
    name: 'Southern California Edison (SCE)',
    territory: 'Southern California',
    contactPhone: '1-800-684-0123',
    contactEmail: 'tech@sce.com',
    website: 'www.sce.com/tech'
  },
  {
    name: 'San Diego Gas & Electric (SDG&E)',
    territory: 'San Diego County',
    contactPhone: '1-800-411-7343',
    contactEmail: 'tech@sdge.com',
    website: 'www.sdge.com/tech',
    specialRequirements: ['Climate zone verification', 'Additional documentation']
  },
  {
    name: 'Sacramento Municipal Utility (SMUD)',
    territory: 'Sacramento Area',
    contactPhone: '1-888-742-7683',
    contactEmail: 'tech@smud.org',
    website: 'www.smud.org/tech'
  }
]

// Mock enrollment status
const mockEnrollmentStatus = {
  isEnrolled: true,
  isEligible: true,
  enrollmentDate: '2023-06-15',
  certificationLevel: 'advanced',
  certificationExpiry: '2024-12-31'
}

export default function TechProgramPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'incentives' | 'certification' | 'utilities'>('overview')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <DynamicIcon name="Zap" className="w-16 h-16 text-yellow-300" size={64} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              TECH Clean California
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              California's premier heat pump incentive program for qualified contractors
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                Up to $15,000 per project
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                4 Utility Territories
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                Contractor Certified
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Enrollment Status Widget for Enrolled Members */}
        {mockEnrollmentStatus.isEnrolled && (
          <div className="mb-8">
            <TechDashboardWidget data={mockTechData} />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Program Overview', icon: 'Info' },
              { id: 'incentives', label: 'Incentives', icon: 'DollarSign' },
              { id: 'certification', label: 'Certification', icon: 'Award' },
              { id: 'utilities', label: 'Utility Partners', icon: 'Building' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <DynamicIcon name={tab.icon} className="w-4 h-4 mr-2" size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Program Benefits */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Join TECH Clean California?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DynamicIcon name="TrendingUp" className="w-8 h-8 text-green-600" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Increase Revenue</h3>
                    <p className="text-gray-600">
                      Earn up to $15,000 per qualified heat pump installation through generous utility incentives
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DynamicIcon name="Users" className="w-8 h-8 text-blue-600" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Expand Customer Base</h3>
                    <p className="text-gray-600">
                      Access customers actively seeking heat pump installations with financial incentives
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DynamicIcon name="Award" className="w-8 h-8 text-purple-600" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Professional Certification</h3>
                    <p className="text-gray-600">
                      Gain industry-recognized certification and training in heat pump technology
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Program Overview */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DynamicIcon name="Target" className="w-5 h-5 mr-2 text-green-600" size={20} />
                      Program Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-3 text-green-500 mt-0.5" size={20} />
                        <span>Accelerate adoption of clean heating and cooling technology</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-3 text-green-500 mt-0.5" size={20} />
                        <span>Reduce greenhouse gas emissions from buildings</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-3 text-green-500 mt-0.5" size={20} />
                        <span>Create jobs in the clean energy sector</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-3 text-green-500 mt-0.5" size={20} />
                        <span>Support disadvantaged communities</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DynamicIcon name="ClipboardList" className="w-5 h-5 mr-2 text-blue-600" size={20} />
                      Eligibility Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-3 text-blue-500 mt-0.5" size={20} />
                        <span>Valid California contractor license</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-3 text-blue-500 mt-0.5" size={20} />
                        <span>NAMC NorCal membership (any level)</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-3 text-blue-500 mt-0.5" size={20} />
                        <span>Complete TECH certification training</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-3 text-blue-500 mt-0.5" size={20} />
                        <span>Liability insurance (minimum $1M)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Program Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">15,000+</div>
                  <div className="text-green-100">Heat Pumps Installed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">$127M</div>
                  <div className="text-green-100">Incentives Distributed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">850+</div>
                  <div className="text-green-100">Certified Contractors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">65%</div>
                  <div className="text-green-100">Energy Savings</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'incentives' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Incentives</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Earn substantial incentives for each qualified heat pump installation. Amounts vary by equipment type and efficiency ratings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {incentiveData.map((incentive, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{incentive.equipmentType}</CardTitle>
                      <Badge className="bg-green-100 text-green-700 text-lg px-3 py-1">
                        {formatCurrency(incentive.minAmount)} - {formatCurrency(incentive.maxAmount)}
                      </Badge>
                    </div>
                    <CardDescription>{incentive.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {incentive.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start text-sm">
                          <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-2 text-green-500 mt-0.5" size={16} />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Incentive Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { step: '1', title: 'Customer Agreement', desc: 'Sign agreement with qualified customer' },
                    { step: '2', title: 'Pre-Installation', desc: 'Submit project details and get approval' },
                    { step: '3', title: 'Installation', desc: 'Complete professional installation' },
                    { step: '4', title: 'Documentation', desc: 'Submit photos and paperwork for payment' }
                  ].map((item) => (
                    <div key={item.step} className="text-center">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                        {item.step}
                      </div>
                      <h4 className="font-medium text-blue-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-blue-700">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'certification' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">TECH Certification Levels</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Complete our comprehensive training program to become a certified TECH Clean California contractor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  level: 'Basic',
                  duration: '16 hours',
                  cost: '$450',
                  color: 'blue',
                  features: ['Heat pump fundamentals', 'Installation basics', 'Safety protocols', 'Basic troubleshooting']
                },
                {
                  level: 'Advanced',
                  duration: '32 hours',
                  cost: '$850',
                  color: 'green',
                  popular: true,
                  features: ['Advanced diagnostics', 'System optimization', 'Customer training', 'Business development', 'Manufacturer certifications']
                },
                {
                  level: 'Master',
                  duration: '48 hours',
                  cost: '$1,250',
                  color: 'purple',
                  features: ['Complex installations', 'System design', 'Mentor training', 'Quality assurance', 'Program leadership']
                }
              ].map((cert, index) => (
                <Card key={index} className={`relative ${cert.popular ? 'border-green-300 ring-2 ring-green-200' : ''}`}>
                  {cert.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 bg-${cert.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <DynamicIcon name="Award" className={`w-8 h-8 text-${cert.color}-600`} size={32} />
                    </div>
                    <CardTitle className="text-xl">{cert.level} Certification</CardTitle>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-gray-900">{cert.cost}</div>
                      <div className="text-sm text-gray-600">{cert.duration} training</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {cert.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm">
                          <DynamicIcon name="CheckCircle" className={`w-4 h-4 mr-2 text-${cert.color}-500 mt-0.5`} size={16} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full bg-${cert.color}-600 hover:bg-${cert.color}-700`}>
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-900 flex items-center">
                  <DynamicIcon name="Clock" className="w-5 h-5 mr-2" size={20} />
                  Certification Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4"></div>
                    <div>
                      <strong>Week 1-2:</strong> Online coursework and reading materials
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4"></div>
                    <div>
                      <strong>Week 3:</strong> Hands-on training at approved facility
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4"></div>
                    <div>
                      <strong>Week 4:</strong> Written and practical examinations
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
                    <div>
                      <strong>Week 5:</strong> Certification issued and program access granted
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'utilities' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Utility Partners</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                TECH Clean California works with major California utilities to provide comprehensive incentive coverage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {utilityPartners.map((utility, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{utility.name}</CardTitle>
                    <CardDescription>Service Territory: {utility.territory}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm">
                        <DynamicIcon name="Phone" className="w-4 h-4 mr-2 text-gray-500" size={16} />
                        <span>{utility.contactPhone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DynamicIcon name="Mail" className="w-4 h-4 mr-2 text-gray-500" size={16} />
                        <span>{utility.contactEmail}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DynamicIcon name="Globe" className="w-4 h-4 mr-2 text-gray-500" size={16} />
                        <Link href={`https://${utility.website}`} className="text-blue-600 hover:underline">
                          {utility.website}
                        </Link>
                      </div>
                    </div>

                    {utility.specialRequirements && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Special Requirements:</h4>
                        <ul className="space-y-1">
                          {utility.specialRequirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-start text-sm">
                              <DynamicIcon name="AlertCircle" className="w-4 h-4 mr-2 text-yellow-500 mt-0.5" size={16} />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        <DynamicIcon name="ExternalLink" className="w-4 h-4 mr-2" size={16} />
                        Visit Utility Portal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Working with Utilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-900 mb-3">Best Practices:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-2 text-green-600 mt-0.5" size={16} />
                        <span>Always verify customer utility territory before project start</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-2 text-green-600 mt-0.5" size={16} />
                        <span>Submit pre-approval applications early in the process</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-2 text-green-600 mt-0.5" size={16} />
                        <span>Maintain direct communication with utility representatives</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900 mb-3">Common Requirements:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <DynamicIcon name="FileText" className="w-4 h-4 mr-2 text-green-600 mt-0.5" size={16} />
                        <span>Equipment specification sheets</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="FileText" className="w-4 h-4 mr-2 text-green-600 mt-0.5" size={16} />
                        <span>Installation photos and documentation</span>
                      </li>
                      <li className="flex items-start">
                        <DynamicIcon name="FileText" className="w-4 h-4 mr-2 text-green-600 mt-0.5" size={16} />
                        <span>Customer agreement and project timeline</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call to Action */}
        {!mockEnrollmentStatus.isEnrolled && (
          <section className="mt-16 text-center bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of contractors earning substantial incentives through TECH Clean California
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                <DynamicIcon name="UserPlus" className="w-5 h-5 mr-2" size={20} />
                Enroll in Program
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <DynamicIcon name="Download" className="w-5 h-5 mr-2" size={20} />
                Download Program Guide
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}