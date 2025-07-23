'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { cn } from '@/lib/utils'

export interface SavedView {
  id: string
  name: string
  description?: string
  filters: Record<string, any>
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  visibleColumns: string[]
  isDefault?: boolean
  isPublic?: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  tags?: string[]
}

export interface SavedViewsManagerProps {
  savedViews: SavedView[]
  currentView?: SavedView | null
  onLoadView: (view: SavedView) => void
  onSaveView: (view: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateView: (viewId: string, updates: Partial<SavedView>) => void
  onDeleteView: (viewId: string) => void
  onSetDefault: (viewId: string) => void
  currentFilters: Record<string, any>
  currentSort?: { column: string; direction: 'asc' | 'desc' }
  currentColumns: string[]
  availableColumns: Array<{ key: string; label: string }>
  className?: string
}

const SaveViewDialog = ({
  isOpen,
  onClose,
  onSave,
  currentFilters,
  currentSort,
  currentColumns,
  availableColumns,
  editingView,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (view: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt'>) => void
  currentFilters: Record<string, any>
  currentSort?: { column: string; direction: 'asc' | 'desc' }
  currentColumns: string[]
  availableColumns: Array<{ key: string; label: string }>
  editingView?: SavedView | null
}) => {
  const [name, setName] = React.useState(editingView?.name || '')
  const [description, setDescription] = React.useState(editingView?.description || '')
  const [isPublic, setIsPublic] = React.useState(editingView?.isPublic || false)
  const [tags, setTags] = React.useState(editingView?.tags?.join(', ') || '')

  const handleSave = () => {
    if (!name.trim()) return

    const view: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      description: description.trim() || undefined,
      filters: currentFilters,
      sortColumn: currentSort?.column,
      sortDirection: currentSort?.direction,
      visibleColumns: currentColumns,
      isDefault: false,
      isPublic,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
    }

    onSave(view)
    onClose()
    setName('')
    setDescription('')
    setIsPublic(false)
    setTags('')
  }

  React.useEffect(() => {
    if (editingView) {
      setName(editingView.name)
      setDescription(editingView.description || '')
      setIsPublic(editingView.isPublic || false)
      setTags(editingView.tags?.join(', ') || '')
    }
  }, [editingView])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingView ? 'Update View' : 'Save Current View'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="view-name" className="text-sm font-medium text-namc-gray-700 mb-2 block">
              View Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="view-name"
              placeholder="e.g., Active Contractors in Bay Area"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="view-description" className="text-sm font-medium text-namc-gray-700 mb-2 block">
              Description
            </label>
            <Input
              id="view-description"
              placeholder="Optional description for this view"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="view-tags" className="text-sm font-medium text-namc-gray-700 mb-2 block">
              Tags
            </label>
            <Input
              id="view-tags"
              placeholder="e.g., urgent, bay-area, electrical"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-namc-gray-500 mt-1">Separate multiple tags with commas</p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-namc-gray-300 text-namc-blue-600 focus:ring-namc-blue-500"
            />
            <label htmlFor="is-public" className="text-sm text-namc-gray-700">
              Share with other team members
            </label>
          </div>

          {/* Current Settings Summary */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-namc-gray-900 mb-2">Current Settings</h4>
            <div className="space-y-2 text-xs text-namc-gray-600">
              <div>
                <strong>Filters:</strong> {Object.keys(currentFilters).length > 0 ? Object.keys(currentFilters).length + ' active' : 'None'}
              </div>
              <div>
                <strong>Sort:</strong> {currentSort ? `${currentSort.column} (${currentSort.direction})` : 'None'}
              </div>
              <div>
                <strong>Columns:</strong> {currentColumns.length} of {availableColumns.length} visible
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {editingView ? 'Update View' : 'Save View'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SavedViewsManager({
  savedViews,
  currentView,
  onLoadView,
  onSaveView,
  onUpdateView,
  onDeleteView,
  onSetDefault,
  currentFilters,
  currentSort,
  currentColumns,
  availableColumns,
  className,
}: SavedViewsManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false)
  const [showViewsPanel, setShowViewsPanel] = React.useState(false)
  const [editingView, setEditingView] = React.useState<SavedView | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')

  const defaultView = savedViews.find(view => view.isDefault)
  const publicViews = savedViews.filter(view => view.isPublic && !view.isDefault)
  const privateViews = savedViews.filter(view => !view.isPublic && !view.isDefault)

  const filteredViews = savedViews.filter(view =>
    view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    view.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    view.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleEditView = (view: SavedView) => {
    setEditingView(view)
    setShowSaveDialog(true)
  }

  const handleSaveNewView = (viewData: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingView) {
      onUpdateView(editingView.id, viewData)
      setEditingView(null)
    } else {
      onSaveView(viewData)
    }
  }

  const hasCurrentChanges = React.useMemo(() => {
    if (!currentView) return Object.keys(currentFilters).length > 0 || currentSort !== undefined
    
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(currentView.filters)
    const sortChanged = currentSort?.column !== currentView.sortColumn || currentSort?.direction !== currentView.sortDirection
    const columnsChanged = JSON.stringify(currentColumns.sort()) !== JSON.stringify(currentView.visibleColumns.sort())
    
    return filtersChanged || sortChanged || columnsChanged
  }, [currentView, currentFilters, currentSort, currentColumns])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Current View Display */}
      {currentView && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <DynamicIcon name="Eye" size={14} />
            {currentView.name}
            {currentView.isDefault && (
              <DynamicIcon name="Star" size={12} className="text-namc-gold-500" />
            )}
          </Badge>
          {hasCurrentChanges && (
            <Badge variant="secondary" className="text-xs">
              Modified
            </Badge>
          )}
        </div>
      )}

      {/* Load Views */}
      <Dialog open={showViewsPanel} onOpenChange={setShowViewsPanel}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <DynamicIcon name="FolderOpen" size={16} />
            Views
            {savedViews.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {savedViews.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saved Views</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <DynamicIcon 
                name="Search" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-namc-gray-400" 
                size={16}
              />
              <Input
                placeholder="Search views..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Views List */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {/* Default View */}
              {defaultView && (
                <div>
                  <h4 className="text-sm font-medium text-namc-gray-900 mb-2 flex items-center gap-2">
                    <DynamicIcon name="Star" size={16} className="text-namc-gold-500" />
                    Default View
                  </h4>
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-namc-gray-900">{defaultView.name}</h5>
                          <Badge variant="outline" size="sm">Default</Badge>
                        </div>
                        {defaultView.description && (
                          <p className="text-sm text-namc-gray-600 mt-1">{defaultView.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-namc-gray-500">
                          <span>{Object.keys(defaultView.filters).length} filters</span>
                          <span>{defaultView.visibleColumns.length} columns</span>
                          {defaultView.tags && defaultView.tags.length > 0 && (
                            <div className="flex gap-1">
                              {defaultView.tags.map(tag => (
                                <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLoadView(defaultView)}
                          className="h-8 w-8 p-0"
                        >
                          <DynamicIcon name="Play" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditView(defaultView)}
                          className="h-8 w-8 p-0"
                        >
                          <DynamicIcon name="Edit" size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Public Views */}
              {publicViews.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-namc-gray-900 mb-2 flex items-center gap-2">
                    <DynamicIcon name="Users" size={16} />
                    Shared Views
                  </h4>
                  <div className="space-y-2">
                    {publicViews.filter(view => 
                      searchQuery === '' || 
                      view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      view.description?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(view => (
                      <Card key={view.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-namc-gray-900">{view.name}</h5>
                              <Badge variant="outline" size="sm">Shared</Badge>
                            </div>
                            {view.description && (
                              <p className="text-sm text-namc-gray-600 mt-1">{view.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-namc-gray-500">
                              <span>{Object.keys(view.filters).length} filters</span>
                              <span>{view.visibleColumns.length} columns</span>
                              {view.tags && view.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {view.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLoadView(view)}
                              className="h-8 w-8 p-0"
                            >
                              <DynamicIcon name="Play" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSetDefault(view.id)}
                              className="h-8 w-8 p-0"
                            >
                              <DynamicIcon name="Star" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditView(view)}
                              className="h-8 w-8 p-0"
                            >
                              <DynamicIcon name="Edit" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteView(view.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <DynamicIcon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Private Views */}
              {privateViews.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-namc-gray-900 mb-2 flex items-center gap-2">
                    <DynamicIcon name="Lock" size={16} />
                    My Views
                  </h4>
                  <div className="space-y-2">
                    {privateViews.filter(view => 
                      searchQuery === '' || 
                      view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      view.description?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(view => (
                      <Card key={view.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-namc-gray-900">{view.name}</h5>
                              <Badge variant="outline" size="sm">Private</Badge>
                            </div>
                            {view.description && (
                              <p className="text-sm text-namc-gray-600 mt-1">{view.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-namc-gray-500">
                              <span>{Object.keys(view.filters).length} filters</span>
                              <span>{view.visibleColumns.length} columns</span>
                              {view.tags && view.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {view.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLoadView(view)}
                              className="h-8 w-8 p-0"
                            >
                              <DynamicIcon name="Play" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSetDefault(view.id)}
                              className="h-8 w-8 p-0"
                            >
                              <DynamicIcon name="Star" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditView(view)}
                              className="h-8 w-8 p-0"
                            >
                              <DynamicIcon name="Edit" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteView(view.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <DynamicIcon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredViews.length === 0 && searchQuery && (
                <div className="text-center py-8 text-namc-gray-500">
                  <DynamicIcon name="Search" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No views found matching "{searchQuery}"</p>
                </div>
              )}

              {savedViews.length === 0 && (
                <div className="text-center py-8 text-namc-gray-500">
                  <DynamicIcon name="FolderOpen" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No saved views yet</p>
                  <p className="text-sm">Save your first view to get started!</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Current View */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSaveDialog(true)}
        className="flex items-center gap-2"
        disabled={!hasCurrentChanges && !currentView}
      >
        <DynamicIcon name="Save" size={16} />
        Save View
      </Button>

      {/* Save View Dialog */}
      <SaveViewDialog
        isOpen={showSaveDialog}
        onClose={() => {
          setShowSaveDialog(false)
          setEditingView(null)
        }}
        onSave={handleSaveNewView}
        currentFilters={currentFilters}
        currentSort={currentSort}
        currentColumns={currentColumns}
        availableColumns={availableColumns}
        editingView={editingView}
      />
    </div>
  )
}