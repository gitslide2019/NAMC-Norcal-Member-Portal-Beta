'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { Progress } from '@/components/ui/progress'

interface TechEnrollmentFormProps {
  onSubmit: (data: EnrollmentData) => void
  onCancel: () => void
  className?: string
}

interface EnrollmentData {
  // Business Information
  businessName: string
  businessLicense: string
  contractorLicense: string
  yearsInBusiness: number
  businessAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  
  // Certification & Experience
  certificationLevel: 'basic' | 'advanced' | 'master'
  hvacExperience: number
  heatPumpExperience: number
  existingCertifications: string[]
  
  // Service Areas
  serviceTerritories: string[]
  serviceRadius: number
  
  // Equipment & Installation
  preferredBrands: string[]
  installationCapacity: number
  hasInsurance: boolean
  insuranceDetails: string
  
  // Program Agreement
  agreesToTerms: boolean
  agreesToTraining: boolean
  marketingConsent: boolean
}

const steps = [
  { id: 1, title: 'Business Info', description: 'Basic business information' },
  { id: 2, title: 'Certification', description: 'Experience and certifications' },
  { id: 3, title: 'Service Areas', description: 'Geographic coverage' },
  { id: 4, title: 'Equipment', description: 'Installation capabilities' },
  { id: 5, title: 'Agreement', description: 'Terms and conditions' }
]

const utilityTerritories = [
  { value: 'pge', label: 'Pacific Gas & Electric (PG&E)' },
  { value: 'sce', label: 'Southern California Edison (SCE)' },
  { value: 'sdge', label: 'San Diego Gas & Electric (SDG&E)' },
  { value: 'smud', label: 'Sacramento Municipal Utility District (SMUD)' },
  { value: 'ladwp', label: 'Los Angeles Department of Water and Power (LADWP)' }
]

const heatPumpBrands = [
  'Carrier', 'Trane', 'Lennox', 'Rheem', 'Goodman', 'York', 'Mitsubishi', 'Daikin'
]

const certificationTypes = [
  'NATE Certification', 'EPA 608 Certification', 'HERS Rater', 'BPI Certification',
  'Manufacturer Certifications', 'OSHA Safety Training'
]

export function TechEnrollmentForm({ onSubmit, onCancel, className }: TechEnrollmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<EnrollmentData>>({
    businessAddress: { street: '', city: '', state: 'CA', zipCode: '' },
    serviceTerritories: [],
    existingCertifications: [],
    preferredBrands: []
  })

  const progress = (currentStep / steps.length) * 100

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateNestedFormData = (field: string, subField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...(prev as any)[field], [subField]: value }
    }))
  }

  const handleSubmit = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onSubmit(formData as EnrollmentData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleArrayValue = (field: string, value: string) => {
    const currentArray = formData[field as keyof EnrollmentData] as string[] || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    updateFormData(field, newArray)
  }

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-green-800 flex items-center">
              <DynamicIcon name="Zap" className="w-6 h-6 mr-2" size={24} />
              TECH Clean California Enrollment
            </CardTitle>
            <CardDescription>
              Join the heat pump incentive program - Step {currentStep} of {steps.length}
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onCancel}>
            <DynamicIcon name="X" className="w-4 h-4" size={16} />
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep 
                    ? 'bg-green-600 text-white' 
                    : step.id < currentStep 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.id < currentStep ? (
                    <DynamicIcon name="Check" className="w-4 h-4" size={16} />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-xs mt-1 text-gray-600">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName || ''}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  placeholder="ABC HVAC Solutions"
                />
              </div>
              
              <div>
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  value={formData.yearsInBusiness || ''}
                  onChange={(e) => updateFormData('yearsInBusiness', parseInt(e.target.value))}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessLicense">Business License Number</Label>
                <Input
                  id="businessLicense"
                  value={formData.businessLicense || ''}
                  onChange={(e) => updateFormData('businessLicense', e.target.value)}
                  placeholder="BL-123456"
                />
              </div>
              
              <div>
                <Label htmlFor="contractorLicense">Contractor License Number</Label>
                <Input
                  id="contractorLicense"
                  value={formData.contractorLicense || ''}
                  onChange={(e) => updateFormData('contractorLicense', e.target.value)}
                  placeholder="CL-789012"
                />
              </div>
            </div>

            <div>
              <Label>Business Address</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Street Address"
                    value={formData.businessAddress?.street || ''}
                    onChange={(e) => updateNestedFormData('businessAddress', 'street', e.target.value)}
                  />
                </div>
                <Input
                  placeholder="City"
                  value={formData.businessAddress?.city || ''}
                  onChange={(e) => updateNestedFormData('businessAddress', 'city', e.target.value)}
                />
                <Input
                  placeholder="ZIP Code"
                  value={formData.businessAddress?.zipCode || ''}
                  onChange={(e) => updateNestedFormData('businessAddress', 'zipCode', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Certification & Experience */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Certification & Experience</h3>
            
            <div>
              <Label>Desired Certification Level</Label>
              <Select 
                value={formData.certificationLevel || ''} 
                onValueChange={(value) => updateFormData('certificationLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select certification level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - Entry level certification</SelectItem>
                  <SelectItem value="advanced">Advanced - Higher incentive rates</SelectItem>
                  <SelectItem value="master">Master - Premium tier benefits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hvacExperience">Years HVAC Experience</Label>
                <Input
                  id="hvacExperience"
                  type="number"
                  value={formData.hvacExperience || ''}
                  onChange={(e) => updateFormData('hvacExperience', parseInt(e.target.value))}
                  placeholder="10"
                />
              </div>
              
              <div>
                <Label htmlFor="heatPumpExperience">Years Heat Pump Experience</Label>
                <Input
                  id="heatPumpExperience"
                  type="number"
                  value={formData.heatPumpExperience || ''}
                  onChange={(e) => updateFormData('heatPumpExperience', parseInt(e.target.value))}
                  placeholder="3"
                />
              </div>
            </div>

            <div>
              <Label>Existing Certifications</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {certificationTypes.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      id={cert}
                      checked={formData.existingCertifications?.includes(cert)}
                      onCheckedChange={() => toggleArrayValue('existingCertifications', cert)}
                    />
                    <Label htmlFor={cert} className="text-sm">{cert}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Service Areas */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Areas</h3>
            
            <div>
              <Label>Utility Territories You Serve</Label>
              <div className="space-y-2 mt-2">
                {utilityTerritories.map((territory) => (
                  <div key={territory.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={territory.value}
                      checked={formData.serviceTerritories?.includes(territory.value)}
                      onCheckedChange={() => toggleArrayValue('serviceTerritories', territory.value)}
                    />
                    <Label htmlFor={territory.value} className="text-sm">{territory.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
              <Input
                id="serviceRadius"
                type="number"
                value={formData.serviceRadius || ''}
                onChange={(e) => updateFormData('serviceRadius', parseInt(e.target.value))}
                placeholder="50"
              />
            </div>
          </div>
        )}

        {/* Step 4: Equipment & Installation */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Equipment & Installation</h3>
            
            <div>
              <Label>Preferred Heat Pump Brands</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {heatPumpBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand}
                      checked={formData.preferredBrands?.includes(brand)}
                      onCheckedChange={() => toggleArrayValue('preferredBrands', brand)}
                    />
                    <Label htmlFor={brand} className="text-sm">{brand}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="installationCapacity">Monthly Installation Capacity</Label>
              <Input
                id="installationCapacity"
                type="number"
                value={formData.installationCapacity || ''}
                onChange={(e) => updateFormData('installationCapacity', parseInt(e.target.value))}
                placeholder="10"
              />
              <p className="text-sm text-gray-600 mt-1">Number of heat pump installations you can complete per month</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasInsurance"
                  checked={formData.hasInsurance || false}
                  onCheckedChange={(checked) => updateFormData('hasInsurance', checked)}
                />
                <Label htmlFor="hasInsurance">I carry appropriate liability insurance</Label>
              </div>
              
              {formData.hasInsurance && (
                <Textarea
                  placeholder="Insurance details (carrier, policy number, coverage amounts)"
                  value={formData.insuranceDetails || ''}
                  onChange={(e) => updateFormData('insuranceDetails', e.target.value)}
                />
              )}
            </div>
          </div>
        )}

        {/* Step 5: Agreement */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Program Agreement</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Program Requirements</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Complete required training within 30 days of enrollment</li>
                <li>• Maintain quality installation standards</li>
                <li>• Submit required documentation for each project</li>
                <li>• Participate in program quality assurance activities</li>
                <li>• Follow utility-specific requirements and timelines</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreesToTerms"
                  checked={formData.agreesToTerms || false}
                  onCheckedChange={(checked) => updateFormData('agreesToTerms', checked)}
                />
                <Label htmlFor="agreesToTerms" className="text-sm leading-relaxed">
                  I agree to the TECH Clean California program terms and conditions, including quality standards and documentation requirements
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreesToTraining"
                  checked={formData.agreesToTraining || false}
                  onCheckedChange={(checked) => updateFormData('agreesToTraining', checked)}
                />
                <Label htmlFor="agreesToTraining" className="text-sm leading-relaxed">
                  I commit to completing required training programs within the specified timeframes
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketingConsent"
                  checked={formData.marketingConsent || false}
                  onCheckedChange={(checked) => updateFormData('marketingConsent', checked)}
                />
                <Label htmlFor="marketingConsent" className="text-sm leading-relaxed">
                  I consent to receive program updates, training notifications, and marketing communications
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <DynamicIcon name="ArrowLeft" className="w-4 h-4 mr-2" size={16} />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              {currentStep === steps.length ? (
                <>
                  <DynamicIcon name="Check" className="w-4 h-4 mr-2" size={16} />
                  Submit Enrollment
                </>
              ) : (
                <>
                  Next
                  <DynamicIcon name="ArrowRight" className="w-4 h-4 ml-2" size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}