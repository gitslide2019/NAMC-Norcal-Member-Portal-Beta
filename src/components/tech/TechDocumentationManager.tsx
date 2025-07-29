'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { Progress } from '@/components/ui/progress'

interface DocumentationFile {
  id: string
  name: string
  type: 'photo' | 'document' | 'certificate'
  category: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
  size: number
  geotagged?: boolean
  notes?: string
}

interface QualityChecklist {
  id: string
  item: string
  required: boolean
  completed: boolean
  notes?: string
  category: 'installation' | 'equipment' | 'electrical' | 'testing'
}

interface TechDocumentationManagerProps {
  projectId: string
  projectType: 'hvac' | 'water_heater' | 'weatherization'
  utilityTerritory: string
  onDocumentUpload: (files: FileList) => void
  onChecklistUpdate: (checklist: QualityChecklist[]) => void
  onSubmitDocumentation: () => void
  className?: string
}

const requiredPhotos = {
  hvac: [
    { category: 'Equipment Front View', description: 'Clear photo of heat pump unit from front', geotagRequired: true },
    { category: 'Equipment Back View', description: 'Clear photo of heat pump unit from back', geotagRequired: true },
    { category: 'Installation Site', description: 'Wide shot showing installation location', geotagRequired: true },
    { category: 'Electrical Connections', description: 'Close-up of electrical connections and disconnect', geotagRequired: false },
    { category: 'Nameplate/Serial', description: 'Equipment nameplate showing model and serial number', geotagRequired: false }
  ],
  water_heater: [
    { category: 'Water Heater Front', description: 'Front view of heat pump water heater', geotagRequired: true },
    { category: 'Installation Location', description: 'Overall view of installation area', geotagRequired: true },
    { category: 'Plumbing Connections', description: 'Water connections and piping', geotagRequired: false },
    { category: 'Electrical Panel', description: 'Electrical connections and circuit breaker', geotagRequired: false }
  ],
  weatherization: [
    { category: 'Before Installation', description: 'Pre-installation condition', geotagRequired: true },
    { category: 'After Installation', description: 'Post-installation completion', geotagRequired: true },
    { category: 'Work Area', description: 'Overall work area and access', geotagRequired: true }
  ]
}

const qualityChecklists = {
  hvac: [
    { id: 'equip_1', item: 'Equipment model matches approved specifications', required: true, category: 'equipment' as const },
    { id: 'equip_2', item: 'Unit serial number recorded and verified', required: true, category: 'equipment' as const },
    { id: 'equip_3', item: 'Energy Star certification verified', required: true, category: 'equipment' as const },
    { id: 'install_1', item: 'Proper clearances maintained per manufacturer specs', required: true, category: 'installation' as const },
    { id: 'install_2', item: 'Refrigerant lines properly insulated', required: true, category: 'installation' as const },
    { id: 'install_3', item: 'Condensate drain properly installed', required: true, category: 'installation' as const },
    { id: 'elec_1', item: 'Electrical disconnect installed and labeled', required: true, category: 'electrical' as const },
    { id: 'elec_2', item: 'Proper voltage and amperage verified', required: true, category: 'electrical' as const },
    { id: 'test_1', item: 'System startup completed successfully', required: true, category: 'testing' as const },
    { id: 'test_2', item: 'Customer walkthrough and training completed', required: true, category: 'testing' as const }
  ],
  water_heater: [
    { id: 'equip_1', item: 'Water heater model meets efficiency requirements', required: true, category: 'equipment' as const },
    { id: 'equip_2', item: 'UEF rating verified and documented', required: true, category: 'equipment' as const },
    { id: 'install_1', item: 'Proper venting and clearances maintained', required: true, category: 'installation' as const },
    { id: 'install_2', item: 'Water connections leak-tested', required: true, category: 'installation' as const },
    { id: 'elec_1', item: 'Electrical connections secure and code-compliant', required: true, category: 'electrical' as const },
    { id: 'test_1', item: 'System tested and functioning properly', required: true, category: 'testing' as const }
  ],
  weatherization: [
    { id: 'install_1', item: 'Air sealing completed per specifications', required: true, category: 'installation' as const },
    { id: 'install_2', item: 'Insulation installed to required R-values', required: true, category: 'installation' as const },
    { id: 'test_1', item: 'Blower door test completed (if required)', required: false, category: 'testing' as const },
    { id: 'test_2', item: 'Final inspection passed', required: true, category: 'testing' as const }
  ]
}

export function TechDocumentationManager({
  projectId,
  projectType,
  utilityTerritory,
  onDocumentUpload,
  onChecklistUpdate,
  onSubmitDocumentation,
  className
}: TechDocumentationManagerProps) {
  const [uploadedFiles, setUploadedFiles] = useState<DocumentationFile[]>([])
  const [checklist, setChecklist] = useState<QualityChecklist[]>(
    qualityChecklists[projectType].map(item => ({ ...item, completed: false }))
  )
  const [notes, setNotes] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const photos = requiredPhotos[projectType]
  const completedItems = checklist.filter(item => item.completed).length
  const totalItems = checklist.length
  const completionPercentage = (completedItems / totalItems) * 100

  const requiredPhotosUploaded = photos.filter(photo => 
    uploadedFiles.some(file => file.category === photo.category)
  ).length

  const isDocumentationComplete = requiredPhotosUploaded === photos.length && 
                                 checklist.every(item => !item.required || item.completed)

  const handleFileUpload = (files: FileList) => {
    const newFiles: DocumentationFile[] = Array.from(files).map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'photo' : 'document',
      category: 'General',
      uploadDate: new Date().toISOString(),
      status: 'pending',
      size: file.size,
      geotagged: Math.random() > 0.5 // Mock geotag detection
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    onDocumentUpload(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const updateChecklistItem = (id: string, completed: boolean, notes?: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed, notes } : item
    )
    setChecklist(updatedChecklist)
    onChecklistUpdate(updatedChecklist)
  }

  const deleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Equipment Front View': 'Wind',
      'Equipment Back View': 'Wind',
      'Water Heater Front': 'Droplets',
      'Installation Site': 'Home',
      'Installation Location': 'MapPin',
      'Electrical Connections': 'Zap',
      'Plumbing Connections': 'Droplets'
    }
    return iconMap[category] || 'FileImage'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-green-800 flex items-center">
            <DynamicIcon name="Camera" className="w-5 h-5 mr-2" size={20} />
            Documentation & Compliance
          </h2>
          <p className="text-green-700">Project {projectId} - {projectType.replace('_', ' ').toUpperCase()}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {utilityTerritory.toUpperCase()} Territory
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completion Progress</CardTitle>
          <CardDescription>
            Track your documentation and quality checklist progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Required Photos</span>
                <span>{requiredPhotosUploaded}/{photos.length}</span>
              </div>
              <Progress value={(requiredPhotosUploaded / photos.length) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Quality Checklist</span>
                <span>{completedItems}/{totalItems}</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
          
          {isDocumentationComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-800">
                <DynamicIcon name="CheckCircle" className="w-5 h-5 mr-2" size={20} />
                <span className="font-medium">Documentation Complete!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                All required photos and checklist items have been completed. Ready for submission.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <DynamicIcon name="Upload" className="w-5 h-5 mr-2" size={20} />
            Required Photos
          </CardTitle>
          <CardDescription>
            Upload all required installation photos. Geotagged photos are preferred.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <DynamicIcon name="Upload" className="w-12 h-12 text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</h3>
            <p className="text-gray-600 mb-4">Supports JPG, PNG, PDF files up to 10MB each</p>
            <Input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                <DynamicIcon name="FolderOpen" className="w-4 h-4 mr-2" size={16} />
                Choose Files
              </Button>
            </Label>
          </div>

          {/* Required Photos Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo, index) => {
              const uploaded = uploadedFiles.some(file => file.category === photo.category)
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  uploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <DynamicIcon 
                        name={getCategoryIcon(photo.category)} 
                        className={`w-5 h-5 mr-3 ${uploaded ? 'text-green-600' : 'text-gray-400'}`} 
                        size={20} 
                      />
                      <div>
                        <h4 className={`font-medium ${uploaded ? 'text-green-800' : 'text-gray-900'}`}>
                          {photo.category}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{photo.description}</p>
                        {photo.geotagRequired && (
                          <Badge variant="outline" className="text-xs mt-2">
                            <DynamicIcon name="MapPin" className="w-3 h-3 mr-1" size={12} />
                            Geotag Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    {uploaded && (
                      <DynamicIcon name="CheckCircle" className="w-5 h-5 text-green-600" size={20} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Uploaded Files</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <DynamicIcon 
                        name={file.type === 'photo' ? 'FileImage' : 'File'} 
                        className="w-4 h-4 mr-3 text-gray-500" 
                        size={16} 
                      />
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-gray-600">
                          {formatFileSize(file.size)} • {file.category}
                          {file.geotagged && (
                            <Badge variant="outline" className="text-xs ml-2">
                              <DynamicIcon name="MapPin" className="w-3 h-3 mr-1" size={12} />
                              Geotagged
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        file.status === 'approved' ? 'bg-green-100 text-green-700' :
                        file.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {file.status}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => deleteFile(file.id)}>
                        <DynamicIcon name="Trash2" className="w-4 h-4" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <DynamicIcon name="CheckSquare" className="w-5 h-5 mr-2" size={20} />
            Quality Installation Checklist
          </CardTitle>
          <CardDescription>
            Complete all required installation and quality verification items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['equipment', 'installation', 'electrical', 'testing'].map((category) => {
              const categoryItems = checklist.filter(item => item.category === category)
              if (categoryItems.length === 0) return null
              
              return (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-3 capitalize flex items-center">
                    <DynamicIcon 
                      name={
                        category === 'equipment' ? 'Settings' :
                        category === 'installation' ? 'Wrench' :
                        category === 'electrical' ? 'Zap' :
                        'TestTube'
                      } 
                      className="w-4 h-4 mr-2" 
                      size={16} 
                    />
                    {category} Requirements
                  </h4>
                  <div className="space-y-3">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={item.id}
                          checked={item.completed}
                          onCheckedChange={(checked) => 
                            updateChecklistItem(item.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                            {item.item}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <Textarea
                            placeholder="Add notes (optional)"
                            value={item.notes || ''}
                            onChange={(e) => 
                              updateChecklistItem(item.id, item.completed, e.target.value)
                            }
                            className="mt-2 text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Notes</CardTitle>
          <CardDescription>
            Add any additional information about the installation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter any additional notes about the installation, customer interactions, or special considerations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">Ready to Submit?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ensure all required photos and checklist items are complete before submitting.
              </p>
            </div>
            <Button 
              onClick={onSubmitDocumentation}
              disabled={!isDocumentationComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              <DynamicIcon name="Send" className="w-4 h-4 mr-2" size={16} />
              Submit Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}