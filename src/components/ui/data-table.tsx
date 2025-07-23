'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
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
  onPageChange?: (page: number) => void
  onRowClick?: (row: T) => void
  onRowAction?: (action: string, row: T) => void
  sortColumn?: keyof T
  sortDirection?: 'asc' | 'desc'
  actions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (row: T) => void
    variant?: 'default' | 'secondary' | 'destructive'
  }>
  bulkActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (rows: T[]) => void
    variant?: 'default' | 'secondary' | 'destructive'
  }>
  filters?: React.ReactNode
  exportButton?: React.ReactNode
  title?: string
  description?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  pagination,
  loading = false,
  searchValue = '',
  onSearch,
  onSort,
  onPageChange,
  onRowClick,
  onRowAction,
  sortColumn,
  sortDirection,
  actions = [],
  bulkActions = [],
  filters,
  exportButton,
  title,
  description,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
  const [screenReaderMessage, setScreenReaderMessage] = React.useState<string>('')

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

  const selectedRowsData = React.useMemo(() => {
    return data.filter(row => selectedRows.has(row.id))
  }, [data, selectedRows])

  const getSortIcon = (column: keyof T) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-namc-gray-400" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-namc-blue-600" />
      : <ArrowDown className="w-4 h-4 text-namc-blue-600" />
  }

  const handleSort = (column: keyof T) => {
    if (!onSort) return
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column, newDirection)
    setScreenReaderMessage(`Table sorted by ${String(column)} in ${newDirection}ending order`)
  }

  // Update screen reader message when data changes
  React.useEffect(() => {
    if (!loading && data.length > 0) {
      setScreenReaderMessage(`Showing ${data.length} contractor${data.length === 1 ? '' : 's'}${pagination ? ` of ${pagination.total} total` : ''}`)
    }
  }, [data.length, loading, pagination?.total])

  // Update screen reader message when search changes
  React.useEffect(() => {
    if (searchValue && !loading) {
      setScreenReaderMessage(`Search results updated for "${searchValue}"`)
    }
  }, [searchValue, loading])

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
      
      {/* Skip Link for Accessibility */}
      <a 
        href="#data-table-main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-namc-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to data table
      </a>
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

      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              {onSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-namc-gray-400" />
                  <Input
                    placeholder="Search contractors..."
                    value={searchValue}
                    onChange={(e) => onSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {filters}
              {exportButton}
              
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
                      {action.icon}
                      {action.label} ({selectedRows.size})
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" id="data-table-main" role="table" aria-label={title || 'Data table'}>
              <thead className="bg-namc-gray-50 border-y border-namc-gray-200">
                <tr>
                  {/* Bulk Select */}
                  {bulkActions.length > 0 && (
                    <th scope="col" className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === data.length && data.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-namc-gray-300 text-namc-blue-600 focus:ring-namc-blue-500 focus:ring-2 focus:ring-offset-2"
                        aria-label={`Select all ${data.length} rows`}
                      />
                    </th>
                  )}

                  {/* Column Headers */}
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      scope="col"
                      id={`header-${String(column.key)}`}
                      className={cn(
                        "px-4 py-3 text-left text-sm font-medium text-namc-gray-900",
                        column.sortable && "cursor-pointer hover:bg-namc-gray-100 focus:outline-2 focus:outline-namc-blue-600 focus:outline-offset-2",
                        column.className
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                      onKeyDown={(e) => {
                        if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          handleSort(column.key)
                        }
                      }}
                      tabIndex={column.sortable ? 0 : -1}
                      role={column.sortable ? 'button' : undefined}
                      aria-sort={
                        sortColumn === column.key 
                          ? sortDirection === 'asc' ? 'ascending' : 'descending'
                          : column.sortable ? 'none' : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}

                  {/* Actions */}
                  {actions.length > 0 && (
                    <th scope="col" id="actions-header" className="w-24 px-4 py-3 text-center text-sm font-medium text-namc-gray-900">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-namc-gray-200">
                {loading ? (
                  <tr>
                    <td 
                      colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
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
                      colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
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
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleSelectRow(row.id)
                            }}
                            className="rounded border-namc-gray-300 text-namc-blue-600 focus:ring-namc-blue-500 focus:ring-2 focus:ring-offset-2"
                            aria-label={`Select row ${row.id}`}
                          />
                        </td>
                      )}

                      {/* Data Columns */}
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          headers={`header-${String(column.key)}`}
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
                        <td headers="actions-header" className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1" role="group" aria-label="Row actions">
                            {actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.onClick(row)
                                }}
                                className="h-8 w-8 p-0 focus:ring-2 focus:ring-namc-blue-500 focus:ring-offset-2"
                                aria-label={`${action.label} for row ${row.id}`}
                              >
                                {action.icon}
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
                  <ChevronLeft className="w-4 h-4" />
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
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}