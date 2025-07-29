'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

interface TechProgramCardProps {
  userEligible: boolean
  className?: string
}

const programBenefits = [
  {
    icon: 'DollarSign',
    title: 'Up to $15,000 Incentives',
    description: 'Earn significant rebates for qualifying heat pump installations'
  },
  {
    icon: 'Award',
    title: 'Professional Certification',
    description: 'Enhance your credentials with TECH program certification'
  },
  {
    icon: 'Users',
    title: 'Customer Referrals',
    description: 'Access to pre-qualified customers seeking heat pump installations'
  },
  {
    icon: 'FileCheck',
    title: 'Streamlined Process',
    description: 'Automated paperwork and incentive processing through HubSpot'
  }
]

const eligibilityRequirements = [
  'Active NAMC NorCal membership',
  'Valid California contractor license',
  'HVAC-specific trade certifications',
  'Service areas within participating utility territories'
]

export function TechProgramCard({ userEligible, className }: TechProgramCardProps) {
  return (
    <Card className={`bg-gradient-to-br from-green-50 to-blue-50 border-green-200 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DynamicIcon name="Zap" className="w-6 h-6 text-green-600" size={24} />
            </div>
            <div>
              <CardTitle className="text-xl text-green-800">TECH Clean California</CardTitle>
              <CardDescription className="text-green-700">
                Heat Pump Incentive Program for Contractors
              </CardDescription>
            </div>
          </div>
          {userEligible && (
            <Badge className="bg-green-100 text-green-700 border-green-300">
              Eligible to Enroll
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Program Overview */}
        <div className="bg-white p-4 rounded-lg border border-green-100">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center">
            <DynamicIcon name="Info" className="w-4 h-4 mr-2" size={16} />
            Program Overview
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            The TECH Clean California program provides significant financial incentives for qualified contractors 
            installing high-efficiency heat pumps. Join thousands of contractors earning substantial rebates while 
            helping California achieve its clean energy goals.
          </p>
        </div>

        {/* Key Benefits */}
        <div>
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <DynamicIcon name="Star" className="w-4 h-4 mr-2" size={16} />
            Key Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {programBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-100">
                <DynamicIcon 
                  name={benefit.icon} 
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" 
                  size={20} 
                />
                <div>
                  <div className="font-medium text-sm text-gray-900">{benefit.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div>
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <DynamicIcon name="CheckCircle" className="w-4 h-4 mr-2" size={16} />
            Eligibility Requirements
          </h3>
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <ul className="space-y-2">
              {eligibilityRequirements.map((requirement, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <DynamicIcon 
                    name={userEligible ? "Check" : "Circle"} 
                    className={`w-4 h-4 mr-2 ${userEligible ? 'text-green-600' : 'text-gray-400'}`} 
                    size={16} 
                  />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Participating Utilities */}
        <div>
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <DynamicIcon name="MapPin" className="w-4 h-4 mr-2" size={16} />
            Participating Utilities
          </h3>
          <div className="flex flex-wrap gap-2">
            {['PG&E', 'SCE', 'SDG&E', 'SMUD', 'LADWP'].map((utility) => (
              <Badge key={utility} variant="outline" className="border-green-200 text-green-700">
                {utility}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-green-100">
          {userEligible ? (
            <>
              <Button className="bg-green-600 hover:bg-green-700 text-white flex-1" asChild>
                <Link href="/programs/tech-clean-california/enroll">
                  <DynamicIcon name="UserPlus" className="w-4 h-4 mr-2" size={16} />
                  Enroll Now
                </Link>
              </Button>
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
                <Link href="/programs/tech-clean-california/info">
                  <DynamicIcon name="BookOpen" className="w-4 h-4 mr-2" size={16} />
                  Learn More
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 flex-1" asChild>
                <Link href="/programs/tech-clean-california/requirements">
                  <DynamicIcon name="AlertCircle" className="w-4 h-4 mr-2" size={16} />
                  Check Eligibility
                </Link>
              </Button>
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" asChild>
                <Link href="/programs/tech-clean-california/info">
                  <DynamicIcon name="BookOpen" className="w-4 h-4 mr-2" size={16} />
                  Program Details
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border border-green-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-700">$45M+</div>
              <div className="text-xs text-green-600">Total Incentives Paid</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-700">2,500+</div>
              <div className="text-xs text-green-600">Active Contractors</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-700">15,000+</div>
              <div className="text-xs text-green-600">Projects Completed</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          <DynamicIcon name="Phone" className="w-4 h-4 inline mr-1" size={16} />
          Questions about enrollment? Contact us at{' '}
          <a href="mailto:tech-support@namcnorcal.org" className="font-medium hover:underline">
            tech-support@namcnorcal.org
          </a>
        </div>
      </CardContent>
    </Card>
  )
}