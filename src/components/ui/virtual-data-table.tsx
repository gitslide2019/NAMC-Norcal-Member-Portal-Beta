'use client'

import * as React from "react"
import { FixedSizeList as List } from 'react-window'
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

export interface VirtualColumn<T> {
  key: keyof T
  label: string
  width: number
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  className?: string
}

export interface VirtualDataTableProps<T> {
  data: T[]
  columns: VirtualColumn<T>[]
  height?: number
  rowHeight?: number
  loading?: boolean
  searchValue?: string
  onSearch?: (value: string) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  onRowClick?: (row: T) => void
  sortColumn?: keyof T
  sortDirection?: 'asc' | 'desc'
  actions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (row: T) => void
    variant?: 'default' | 'secondary' | 'destructive'
  }>
  title?: string
  description?: string
  overscan?: number
}

interface RowProps<T> {
  index: number
  style: React.CSSProperties
  data: {
    items: T[]
    columns: VirtualColumn<T>[]
    actions: Array<{
      label: string
      icon?: React.ReactNode
      onClick: (row: T) => void
      variant?: 'default' | 'secondary' | 'destructive'
    }>
    onRowClick?: (row: T) => void
  }
}

function VirtualRow<T extends { id: string }>({ index, style, data }: RowProps<T>) {
  const { items, columns, actions, onRowClick } = data
  const row = items[index]

  if (!row) return null

  return (
    <div
      style={style}
      className={cn(
        "flex items-center border-b border-namc-gray-200 hover:bg-namc-gray-50 transition-colors",
        onRowClick && "cursor-pointer"
      )}
      onClick={() => onRowClick?.(row)}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onRowClick(row)
        }
      }}
    >
      {columns.map((column) => (
        <div
          key={String(column.key)}
          className={cn("px-4 py-3 text-sm flex-shrink-0", column.className)}
          style={{ width: column.width }}
          role="cell"
        >
          {column.render 
            ? column.render(row[column.key], row)
            : String(row[column.key] || '')
          }
        </div>
      ))}
      
      {actions.length > 0 && (
        <div className="px-4 py-3 flex-shrink-0" style={{ width: 120 }} role="cell">
          <div className="flex items-center justify-center gap-1" role="group" aria-label="Row actions">
            {actions.map((action, actionIndex) => (
              <Button
                key={actionIndex}
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
        </div>
      )}
    </div>
  )
}

export function VirtualDataTable<T extends { id: string }>({
  data,
  columns,
  height = 400,
  rowHeight = 60,
  loading = false,
  searchValue = '',
  onSearch,
  onSort,
  onRowClick,
  sortColumn,
  sortDirection,
  actions = [],
  title,
  description,
  overscan = 5,
}: VirtualDataTableProps<T>) {
  const [screenReaderMessage, setScreenReaderMessage] = React.useState<string>('')
  const listRef = React.useRef<List>(null)

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
    
    // Scroll to top after sorting
    listRef.current?.scrollToItem(0, 'start')
  }

  // Update screen reader message when data changes
  React.useEffect(() => {
    if (!loading && data.length > 0) {
      setScreenReaderMessage(`Showing ${data.length} contractor${data.length === 1 ? '' : 's'}`)
    }
  }, [data.length, loading])

  // Update screen reader message when search changes
  React.useEffect(() => {
    if (searchValue && !loading) {
      setScreenReaderMessage(`Search results updated for "${searchValue}"`)
    }
  }, [searchValue, loading])

  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0) + (actions.length > 0 ? 120 : 0)

  const rowData = React.useMemo(() => ({
    items: data,
    columns,
    actions,
    onRowClick,
  }), [data, columns, actions, onRowClick])

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
        href="#virtual-table-main" 
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
                    aria-label="Search contractors"
                  />
                </div>
              )}
            </div>

            <div className="text-sm text-namc-gray-600">
              {loading ? 'Loading...' : `${data.length} contractor${data.length === 1 ? '' : 's'}`}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
              <div className="text-namc-gray-500">Loading contractor data...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
              <div className="text-namc-gray-500">No contractors found. Try adjusting your search.</div>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Virtual Table Header */}
              <div 
                className="flex bg-namc-gray-50 border-y border-namc-gray-200 sticky top-0 z-10"
                style={{ width: totalWidth }}
                role="row"
              >
                {columns.map((column) => (
                  <div
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-namc-gray-900 flex-shrink-0",
                      column.sortable && "cursor-pointer hover:bg-namc-gray-100 focus:outline-2 focus:outline-namc-blue-600 focus:outline-offset-2",
                      column.className
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                    onKeyDown={(e) => {
                      if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleSort(column.key)
                      }
                    }}
                    tabIndex={column.sortable ? 0 : -1}
                    role={column.sortable ? 'button columnheader' : 'columnheader'}
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
                  </div>
                ))}
                
                {actions.length > 0 && (
                  <div 
                    className="px-4 py-3 text-center text-sm font-medium text-namc-gray-900 flex-shrink-0" 
                    style={{ width: 120 }}
                    role="columnheader"
                  >
                    Actions
                  </div>
                )}
              </div>

              {/* Virtual List */}
              <div 
                id="virtual-table-main"
                role="table" 
                aria-label={title || 'Virtual data table'}
                aria-rowcount={data.length}
              >
                <List
                  ref={listRef}
                  height={height}
                  itemCount={data.length}
                  itemSize={rowHeight}
                  itemData={rowData}
                  overscanCount={overscan}
                  width={totalWidth}
                >
                  {VirtualRow}
                </List>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}