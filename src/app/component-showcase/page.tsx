'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  MessageSquare,
  Palette,
  Eye,
  Code,
  Star,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

// Import component sets
import { Button as ProfButton } from '@/components/ui/sets/professional/button'
import { Card as ProfCard, MetricCard as ProfMetricCard, FeatureCard as ProfFeatureCard } from '@/components/ui/sets/professional/card'
import { Input as ProfInput } from '@/components/ui/sets/professional/input'

import { Button as MinButton } from '@/components/ui/sets/minimalist/button'
import { Card as MinCard, MetricCard as MinMetricCard, FeatureCard as MinFeatureCard } from '@/components/ui/sets/minimalist/card'

import { Button as DynButton } from '@/components/ui/sets/dynamic/button'
import { Card as DynCard, MetricCard as DynMetricCard, FeatureCard as DynFeatureCard } from '@/components/ui/sets/dynamic/card'

type ComponentSet = 'professional' | 'minimalist' | 'dynamic'

const componentSets = {
  professional: {
    name: 'Professional Corporate',
    description: 'Trust, authority, compliance-focused design for government contractors',
    color: 'namc-blue-800',
    Button: ProfButton,
    Card: ProfCard,
    MetricCard: ProfMetricCard,
    FeatureCard: ProfFeatureCard,
    characteristics: [
      'Deep blue primary colors with professional grays',
      'Clean, minimal forms with strong security indicators',
      'Traditional sidebar with clear hierarchy',
      'High readability, WCAG AA compliant typography',
      'Structured inputs with comprehensive validation'
    ],
    strengths: [
      'Government contractor compliance',
      'Professional and trustworthy appearance',
      'Clear hierarchy and navigation',
      'Accessibility standards met',
      'Audit trail friendly design'
    ],
    useCases: [
      'Government contractor portals',
      'Compliance-heavy applications',
      'Enterprise B2B platforms',
      'Professional service platforms',
      'Financial and legal applications'
    ]
  },
  minimalist: {
    name: 'Modern Minimalist',
    description: 'Clean, efficient, mobile-first design for tech-savvy contractors',
    color: 'namc-blue-600',
    Button: MinButton,
    Card: MinCard,
    MetricCard: MinMetricCard,
    FeatureCard: MinFeatureCard,
    characteristics: [
      'Modern blue with high contrast and warm grays',
      'Card-based forms with subtle animations',
      'Collapsible sidebar with icon-first design',
      'Dense data presentation with progressive disclosure',
      'Floating labels with inline validation'
    ],
    strengths: [
      'Mobile-first responsive design',
      'Clean and uncluttered interface',
      'Fast loading and performance',
      'Modern developer experience',
      'Excellent for power users'
    ],
    useCases: [
      'SaaS applications',
      'Mobile-first platforms',
      'Developer tools',
      'Modern web applications',
      'Startup environments'
    ]
  },
  dynamic: {
    name: 'Interactive Dynamic',
    description: 'Engagement, collaboration, gamification for community-focused contractors',
    color: 'namc-blue-600',
    Button: DynButton,
    Card: DynCard,
    MetricCard: DynMetricCard,
    FeatureCard: DynFeatureCard,
    characteristics: [
      'Vibrant blue with energetic gradients',
      'Progressive forms with onboarding flows',
      'Context-aware sidebar with activity indicators',
      'Activity feed style with real-time updates',
      'Multi-step wizards with progress indicators'
    ],
    strengths: [
      'High user engagement',
      'Interactive and animated elements',
      'Social and collaborative features',
      'Gamification elements',
      'Modern and exciting feel'
    ],
    useCases: [
      'Social platforms',
      'Community-driven applications',
      'Learning management systems',
      'Interactive dashboards',
      'Gaming and entertainment'
    ]
  }
}

export default function ComponentShowcase() {
  const [activeSet, setActiveSet] = useState<ComponentSet>('professional')
  const [viewMode, setViewMode] = useState<'comparison' | 'details'>('comparison')

  const currentSet = componentSets[activeSet]

  return (
    <div className="min-h-screen bg-gradient-to-br from-namc-gray-50 to-namc-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-namc-gray-900 mb-4">
            NAMC Portal UI Component Sets
          </h1>
          <p className="text-lg text-namc-gray-600 max-w-3xl mx-auto">
            Compare three distinct design approaches for the NAMC NorCal Member Portal. 
            Each set is optimized for different use cases and user preferences.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <div className="flex space-x-1">
              {Object.entries(componentSets).map(([key, set]) => (
                <button
                  key={key}
                  onClick={() => setActiveSet(key as ComponentSet)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSet === key
                      ? 'bg-namc-blue-600 text-white'
                      : 'text-namc-gray-600 hover:text-namc-gray-900 hover:bg-namc-gray-100'
                  }`}
                >
                  {set.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center ${
                  viewMode === 'comparison'
                    ? 'bg-namc-blue-100 text-namc-blue-700'
                    : 'text-namc-gray-600 hover:text-namc-gray-900'
                }`}
              >
                <Eye className="w-4 h-4 mr-1" />
                Comparison
              </button>
              <button
                onClick={() => setViewMode('details')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center ${
                  viewMode === 'details'
                    ? 'bg-namc-blue-100 text-namc-blue-700'
                    : 'text-namc-gray-600 hover:text-namc-gray-900'
                }`}
              >
                <Code className="w-4 h-4 mr-1" />
                Details
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'comparison' ? (
          // Comparison View
          <div className="space-y-12">
            {/* Set Overview */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <div className="text-center mb-6">
                <Badge className={`bg-${currentSet.color} text-white mb-4`}>
                  <Palette className="w-4 h-4 mr-2" />
                  {currentSet.name}
                </Badge>
                <h2 className="text-2xl font-bold text-namc-gray-900 mb-2">
                  {currentSet.name}
                </h2>
                <p className="text-namc-gray-600 text-lg">
                  {currentSet.description}
                </p>
              </div>
            </Card>

            {/* Component Demos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Buttons */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Buttons
                  </CardTitle>
                  <CardDescription>
                    Primary, secondary, and action buttons
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <currentSet.Button>Primary Action</currentSet.Button>
                    <currentSet.Button variant="secondary">Secondary</currentSet.Button>
                    <currentSet.Button variant="outline">Outline</currentSet.Button>
                    <currentSet.Button variant="ghost" size="sm">Ghost</currentSet.Button>
                  </div>
                </CardContent>
              </Card>

              {/* Metric Cards */}
              <div className="space-y-4">
                <currentSet.MetricCard
                  title="Active Members"
                  value="500+"
                  description="Growing community"
                  trend="up"
                  trendValue="+12% this quarter"
                  icon={<Users className="w-6 h-6 text-namc-blue-600" />}
                />
                <currentSet.MetricCard
                  title="Project Value"
                  value="$100M+"
                  description="Available contracts"
                  trend="up"
                  trendValue="+25% this year"
                  icon={<Building2 className="w-6 h-6 text-namc-gold-600" />}
                />
              </div>

              {/* Feature Card */}
              <currentSet.FeatureCard
                title="Project Opportunities"
                description="Access exclusive construction projects and bidding opportunities with direct client connections."
                icon={<Building2 className="w-6 h-6" />}
                features={[
                  "Real-time project notifications",
                  "AI-powered project matching",
                  "Simplified application process",
                  "Direct client connections"
                ]}
                actionLabel="Explore Projects"
                onAction={() => console.log('Navigate to projects')}
              />
            </div>

            {/* Navigation Demo */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Navigation & Layout Demo
                </CardTitle>
                <CardDescription>
                  How the navigation and layout would look with this component set
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-namc-gray-100 rounded-lg p-4 min-h-[300px] flex">
                  {/* Mock Sidebar */}
                  <div className="w-64 bg-white rounded-lg shadow-sm p-4 mr-4">
                    <div className="space-y-2">
                      <div className="font-semibold text-namc-gray-900 mb-4">NAMC NorCal</div>
                      {['Dashboard', 'Projects', 'Events', 'Messages', 'Directory'].map((item, index) => (
                        <div 
                          key={item}
                          className={`p-2 rounded text-sm ${
                            index === 0 
                              ? `bg-${currentSet.color} text-white` 
                              : 'text-namc-gray-600 hover:bg-namc-gray-100'
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mock Main Content */}
                  <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
                    <div className="space-y-4">
                      <div className="h-8 bg-namc-gray-200 rounded w-1/3"></div>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-20 bg-namc-gray-100 rounded"></div>
                        ))}
                      </div>
                      <div className="h-32 bg-namc-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Details View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Characteristics */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Key Characteristics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {currentSet.characteristics.map((char, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      {char}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {currentSet.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <TrendingUp className="w-4 h-4 text-namc-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Ideal Use Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {currentSet.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <ArrowRight className="w-4 h-4 text-namc-gold-600 mr-2 mt-0.5 flex-shrink-0" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Evaluation Section */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-namc-blue-50 to-namc-gold-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Ready to Evaluate and Choose?
            </CardTitle>
            <CardDescription className="text-lg">
              Each component set has been designed with specific use cases and user needs in mind. 
              Consider your target audience, compliance requirements, and long-term maintenance when making your choice.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center mt-6">
            <Button size="lg" className="mr-4">
              Start User Testing
            </Button>
            <Button variant="outline" size="lg">
              Technical Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}