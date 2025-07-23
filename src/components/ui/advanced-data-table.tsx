'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { cn } from "@/lib/utils"

export interface AdvancedColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'select' | 'multiselect' | 'date' | 'number' | 'boolean'
  filterOptions?: Array<{ value: string; label: string }>
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  exportable?: boolean
  width?: number
}

export interface FilterState {
  [key: string]: {
    type: 'text' | 'select' | 'multiselect' | 'date' | 'number' | 'boolean'
    value: any
    operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte'
  }
}

export interface ExportFormat {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  label: string
  icon: string
}

export interface SavedView {
  id: string
  name: string
  filters: FilterState
  sortColumn?: keyof any
  sortDirection?: 'asc' | 'desc'
  visibleColumns: string[]
  isDefault?: boolean
}

export interface AdvancedDataTableProps<T> {
  data: T[]
  columns: AdvancedColumn<T>[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  loading?: boolean
  searchValue?: string
  onSearch?: (value: string) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  onFilter?: (filters: FilterState) => void
  onPageChange?: (page: number) => void
  onRowClick?: (row: T) => void
  onExport?: (format: string, data: T[], columns: AdvancedColumn<T>[]) => void
  sortColumn?: keyof T
  sortDirection?: 'asc' | 'desc'
  filters?: FilterState
  actions?: Array<{
    label: string
    icon?: string
    onClick: (row: T) => void
    variant?: 'default' | 'secondary' | 'destructive'
  }>
  bulkActions?: Array<{
    label: string
    icon?: string
    onClick: (rows: T[]) => void
    variant?: 'default' | 'secondary' | 'destructive'
  }>
  exportFormats?: ExportFormat[]
  savedViews?: SavedView[]
  onSaveView?: (view: Omit<SavedView, 'id'>) => void
  onLoadView?: (view: SavedView) => void
  onDeleteView?: (viewId: string) => void
  title?: string
  description?: string
  allowColumnToggle?: boolean
}

const DEFAULT_EXPORT_FORMATS: ExportFormat[] = [
  { format: 'csv', label: 'CSV', icon: 'FileText' },
  { format: 'excel', label: 'Excel', icon: 'FileSpreadsheet' },
  { format: 'pdf', label: 'PDF Report', icon: 'FileDown' },
  { format: 'json', label: 'JSON Data', icon: 'Code' },
]

export function AdvancedDataTable<T extends { id: string }>({
  data,
  columns,
  pagination,
  loading = false,
  searchValue = '',
  onSearch,
  onSort,
  onFilter,
  onPageChange,
  onRowClick,
  onExport,
  sortColumn,
  sortDirection,
  filters = {},
  actions = [],
  bulkActions = [],
  exportFormats = DEFAULT_EXPORT_FORMATS,
  savedViews = [],
  onSaveView,
  onLoadView,
  onDeleteView,
  title,
  description,
  allowColumnToggle = true,
}: AdvancedDataTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = React.useState(false)
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    new Set(columns.map(col => String(col.key)))
  )
  const [screenReaderMessage, setScreenReaderMessage] = React.useState<string>('')

  const filterableColumns = columns.filter(col => col.filterable)
  const exportableColumns = columns.filter(col => col.exportable !== false)
  const selectedRowsData = React.useMemo(() => {
    return data.filter(row => selectedRows.has(row.id))
  }, [data, selectedRows])

  const handleSelectAll = React.useCallback(() => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map(row => row.id)))
    }
  }, [data, selectedRows.size])

  const handleSelectRow = React.useCallback((id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }, [selectedRows])

  const handleSort = (column: keyof T) => {
    if (!onSort) return
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column, newDirection)
    setScreenReaderMessage(`Table sorted by ${String(column)} in ${newDirection}ending order`)
  }

  const handleFilterChange = (columnKey: string, value: any, operator = 'contains') => {
    if (!onFilter) return
    const column = columns.find(col => String(col.key) === columnKey)
    if (!column) return

    const newFilters = { ...filters }
    if (value === '' || value === null || value === undefined) {
      delete newFilters[columnKey]
    } else {
      newFilters[columnKey] = {
        type: column.filterType || 'text',
        value,
        operator,
      }
    }
    onFilter(newFilters)
    setScreenReaderMessage(`Filter applied to ${column.label}`)
  }

  const handleExport = (format: string) => {
    if (!onExport) return
    const exportData = selectedRows.size > 0 ? selectedRowsData : data
    const exportCols = exportableColumns.filter(col => visibleColumns.has(String(col.key)))
    onExport(format, exportData, exportCols)
    setScreenReaderMessage(`Exporting ${exportData.length} rows as ${format.toUpperCase()}`)
  }

  const handleColumnToggle = (columnKey: string) => {
    const newVisible = new Set(visibleColumns)
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey)
    } else {
      newVisible.add(columnKey)
    }
    setVisibleColumns(newVisible)
  }

  const visibleColumnsArray = columns.filter(col => visibleColumns.has(String(col.key)))

  // Update screen reader message when data changes
  React.useEffect(() => {
    if (!loading && data.length > 0) {
      setScreenReaderMessage(`Showing ${data.length} contractor${data.length === 1 ? '' : 's'}${pagination ? ` of ${pagination.total} total` : ''}`)
    }
  }, [data.length, loading, pagination?.total])

  return (
    <div className="space-y-6">
      {/* Screen Reader Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {screenReaderMessage}
      </div>

      {/* Header */}
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-namc-gray-900 mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-namc-gray-600">{description}</p>
          )}
        </div>
      )}

      {/* Advanced Toolbar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            {/* Primary Actions Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                {onSearch && (
                  <div className="relative">
                    <DynamicIcon 
                      name="Search" 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-namc-gray-400" 
                      size={16}
                    />
                    <Input
                      placeholder="Search contractors..."
                      value={searchValue}
                      onChange={(e) => onSearch(e.target.value)}
                      className="pl-10"
                      aria-label="Search contractors"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Filter Toggle */}
                {filterableColumns.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <DynamicIcon name="Filter" size={16} />
                    Filters
                    {Object.keys(filters).length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {Object.keys(filters).length}
                      </Badge>
                    )}
                  </Button>
                )}

                {/* Column Toggle */}
                {allowColumnToggle && (
                  <Select>
                    <SelectTrigger className="w-[140px]">
                      <DynamicIcon name="Columns" size={16} className="mr-2" />
                      <SelectValue placeholder="Columns" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <div className="text-sm font-medium mb-2">Toggle Columns</div>
                        {columns.map((column) => (
                          <div key={String(column.key)} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`column-${String(column.key)}`}
                              checked={visibleColumns.has(String(column.key))}
                              onCheckedChange={() => handleColumnToggle(String(column.key))}
                            />
                            <label 
                              htmlFor={`column-${String(column.key)}`}
                              className="text-sm"
                            >
                              {column.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                )}

                {/* Export */}
                {onExport && exportFormats.length > 0 && (
                  <Select onValueChange={handleExport}>
                    <SelectTrigger className="w-[120px]">
                      <DynamicIcon name="Download" size={16} className="mr-2" />
                      <SelectValue placeholder="Export" />
                    </SelectTrigger>
                    <SelectContent>
                      {exportFormats.map((format) => (
                        <SelectItem key={format.format} value={format.format}>
                          <div className="flex items-center gap-2">
                            <DynamicIcon name={format.icon} size={16} />
                            {format.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Bulk Actions */}
                {bulkActions.length > 0 && selectedRows.size > 0 && (
                  <div className="flex gap-2">
                    {bulkActions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'secondary'}
                        size="sm"
                        onClick={() => action.onClick(selectedRowsData)}
                        className="flex items-center gap-2"
                      >
                        {action.icon && <DynamicIcon name={action.icon} size={16} />}
                        {action.label} ({selectedRows.size})
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && filterableColumns.length > 0 && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterableColumns.map((column) => (
                    <div key={String(column.key)} className="space-y-2">
                      <label className="text-sm font-medium text-namc-gray-700">
                        {column.label}
                      </label>
                      {column.filterType === 'select' && column.filterOptions ? (
                        <Select
                          value={filters[String(column.key)]?.value || ''}
                          onValueChange={(value) => handleFilterChange(String(column.key), value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Filter ${column.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            {column.filterOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder={`Filter ${column.label}...`}
                          value={filters[String(column.key)]?.value || ''}
                          onChange={(e) => handleFilterChange(String(column.key), e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                {Object.keys(filters).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFilter?.({})}
                      className="flex items-center gap-2"
                    >
                      <DynamicIcon name="X" size={16} />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Results Info */}
          <div className="px-4 py-2 bg-namc-gray-50 border-y text-sm text-namc-gray-600">
            {loading ? (
              'Loading contractor data...'
            ) : (
              <>
                Showing {data.length} contractor{data.length === 1 ? '' : 's'}
                {pagination && ` of ${pagination.total} total`}
                {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
              </>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label={title || 'Advanced data table'}>
              <thead className="bg-namc-gray-50 border-b border-namc-gray-200">
                <tr>
                  {/* Bulk Select */}
                  {bulkActions.length > 0 && (
                    <th scope="col" className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selectedRows.size === data.length && data.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label={`Select all ${data.length} rows`}
                      />
                    </th>
                  )}

                  {/* Column Headers */}
                  {visibleColumnsArray.map((column) => (
                    <th
                      key={String(column.key)}
                      scope="col"
                      className={cn(
                        "px-4 py-3 text-left text-sm font-medium text-namc-gray-900",
                        column.sortable && "cursor-pointer hover:bg-namc-gray-100",
                        column.className
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                      role={column.sortable ? 'button' : undefined}
                      tabIndex={column.sortable ? 0 : -1}
                      aria-sort={
                        sortColumn === column.key 
                          ? sortDirection === 'asc' ? 'ascending' : 'descending'
                          : column.sortable ? 'none' : undefined
                      }
                      style={{ width: column.width }}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && (
                          <DynamicIcon 
                            name={
                              sortColumn === column.key 
                                ? sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'
                                : 'ArrowUpDown'
                            }
                            className={
                              sortColumn === column.key 
                                ? 'w-4 h-4 text-namc-blue-600'
                                : 'w-4 h-4 text-namc-gray-400'
                            }
                            size={16}
                          />
                        )}
                      </div>
                    </th>
                  ))}

                  {/* Actions */}
                  {actions.length > 0 && (
                    <th scope="col" className="w-24 px-4 py-3 text-center text-sm font-medium text-namc-gray-900">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-namc-gray-200">
                {loading ? (
                  <tr>
                    <td 
                      colSpan={visibleColumnsArray.length + (bulkActions.length > 0 ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                      className="px-4 py-8 text-center text-namc-gray-500"
                      role="status"
                      aria-live="polite"
                    >
                      Loading contractor data...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={visibleColumnsArray.length + (bulkActions.length > 0 ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                      className="px-4 py-8 text-center text-namc-gray-500"
                      role="status"
                      aria-live="polite"
                    >
                      No contractors found. Try adjusting your search or filters.
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "hover:bg-namc-gray-50 transition-colors",
                        onRowClick && "cursor-pointer",
                        selectedRows.has(row.id) && "bg-namc-blue-50"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {/* Bulk Select */}
                      {bulkActions.length > 0 && (
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRows(prev => new Set(prev).add(row.id))
                              } else {
                                setSelectedRows(prev => {
                                  const newSet = new Set(prev)
                                  newSet.delete(row.id)
                                  return newSet
                                })
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select row ${row.id}`}
                          />
                        </td>
                      )}

                      {/* Data Columns */}
                      {visibleColumnsArray.map((column) => (
                        <td
                          key={String(column.key)}
                          className={cn("px-4 py-3 text-sm", column.className)}
                        >
                          {column.render 
                            ? column.render(row[column.key], row)
                            : String(row[column.key] || '')
                          }
                        </td>
                      ))}

                      {/* Row Actions */}
                      {actions.length > 0 && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.onClick(row)
                                }}
                                className="h-8 w-8 p-0"
                                aria-label={`${action.label} for row ${row.id}`}
                              >
                                {action.icon && <DynamicIcon name={action.icon} size={16} />}
                                <span className="sr-only">{action.label}</span>
                              </Button>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-namc-gray-200">
              <div className="text-sm text-namc-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <DynamicIcon name="ChevronLeft" size={16} />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange?.(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <DynamicIcon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}