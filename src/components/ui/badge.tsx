import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 21st.dev inspired badge variants with NAMC styling
const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-namc-blue-600 text-white hover:bg-namc-blue-700",
        secondary: "border-transparent bg-namc-gray-100 text-namc-gray-900 hover:bg-namc-gray-200",
        destructive: "border-transparent bg-namc-red-500 text-white hover:bg-namc-red-600",
        success: "border-transparent bg-namc-green-600 text-white hover:bg-namc-green-700",
        warning: "border-transparent bg-namc-gold-500 text-white hover:bg-namc-gold-600",
        info: "border-transparent bg-namc-cyan-500 text-white hover:bg-namc-cyan-600",
        outline: "border-namc-gray-300 text-namc-gray-700 bg-transparent hover:bg-namc-gray-50",
        // Status specific variants
        active: "border-transparent bg-namc-green-100 text-namc-green-800",
        inactive: "border-transparent bg-namc-gray-100 text-namc-gray-600",
        pending: "border-transparent bg-namc-gold-100 text-namc-gold-800",
        rejected: "border-transparent bg-namc-red-100 text-namc-red-800",
        approved: "border-transparent bg-namc-green-100 text-namc-green-800",
        // Priority variants
        high: "border-transparent bg-namc-red-100 text-namc-red-800",
        medium: "border-transparent bg-namc-gold-100 text-namc-gold-800",
        low: "border-transparent bg-namc-gray-100 text-namc-gray-700",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

// Specialized badge components for NAMC use cases

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "active" | "inactive" | "pending" | "approved" | "rejected"
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: "active" as const, label: "Active" },
    inactive: { variant: "inactive" as const, label: "Inactive" },
    pending: { variant: "pending" as const, label: "Pending" },
    approved: { variant: "approved" as const, label: "Approved" },
    rejected: { variant: "rejected" as const, label: "Rejected" },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn("", className)}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

interface PriorityBadgeProps extends Omit<BadgeProps, "variant"> {
  priority: "high" | "medium" | "low"
}

function PriorityBadge({ priority, className, ...props }: PriorityBadgeProps) {
  const priorityConfig = {
    high: { variant: "high" as const, label: "High Priority" },
    medium: { variant: "medium" as const, label: "Medium Priority" },
    low: { variant: "low" as const, label: "Low Priority" },
  }

  const config = priorityConfig[priority]

  return (
    <Badge
      variant={config.variant}
      className={cn("", className)}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

interface MemberTypeBadgeProps extends Omit<BadgeProps, "variant"> {
  memberType: "admin" | "regular" | "premium" | "guest"
}

function MemberTypeBadge({ memberType, className, ...props }: MemberTypeBadgeProps) {
  const typeConfig = {
    admin: { variant: "destructive" as const, label: "Admin" },
    regular: { variant: "secondary" as const, label: "Member" },
    premium: { variant: "warning" as const, label: "Premium" },
    guest: { variant: "outline" as const, label: "Guest" },
  }

  const config = typeConfig[memberType]

  return (
    <Badge
      variant={config.variant}
      className={cn("", className)}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

interface CountBadgeProps extends Omit<BadgeProps, "children"> {
  count: number
  maxCount?: number
  showZero?: boolean
}

function CountBadge({ count, maxCount = 99, showZero = false, className, ...props }: CountBadgeProps) {
  if (count === 0 && !showZero) return null

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()

  return (
    <Badge
      variant="destructive"
      size="sm"
      className={cn(
        "h-5 min-w-[20px] px-1 text-xs font-semibold",
        className
      )}
      {...props}
    >
      {displayCount}
    </Badge>
  )
}

export { Badge, StatusBadge, PriorityBadge, MemberTypeBadge, CountBadge, badgeVariants }