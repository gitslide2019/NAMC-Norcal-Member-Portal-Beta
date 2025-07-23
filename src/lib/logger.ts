import * as winston from 'winston'

// Custom log levels with priorities
const logLevels = {
  error: 0,
  warn: 1,
  audit: 2,
  info: 3,
  http: 4,
  debug: 5,
}

// Color scheme for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  audit: 'magenta',
  info: 'green',
  http: 'cyan',
  debug: 'blue',
}

winston.addColors(logColors)

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, service, userId, requestId, ip, ...meta } = info

    let logMessage = `${timestamp} [${level.toUpperCase()}]`
    
    if (service) logMessage += ` [${service}]`
    if (requestId) logMessage += ` [${requestId}]`
    if (userId) logMessage += ` [User:${userId}]`
    if (ip) logMessage += ` [IP:${ip}]`
    
    logMessage += `: ${message}`

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` | ${JSON.stringify(meta)}`
    }

    return logMessage
  })
)

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, service, requestId, ...meta } = info
    
    let logMessage = `${timestamp} ${level}`
    if (service) logMessage += ` [${service}]`
    if (requestId) logMessage += ` [${requestId}]`
    logMessage += `: ${message}`

    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta, null, 2)}`
    }

    return logMessage
  })
)

// Create transports based on environment
const transports: winston.transport[] = []

// Console transport (always enabled in development)
const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    })
  )
} else {
  // Production console transport (errors only)
  transports.push(
    new winston.transports.Console({
      level: 'error',
      format: logFormat,
    })
  )
}

// File transports for production
if (!isDevelopment) {
  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'info',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  )

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  )

  // Audit log file for security events
  transports.push(
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'audit',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10, // Keep more audit logs
    })
  )
}

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: {
    service: 'namc-portal',
    environment: process.env.NODE_ENV || 'development',
  },
  transports,
  exitOnError: false,
})

// Enhanced logging interface
export interface LogContext {
  requestId?: string
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  duration?: number
  statusCode?: number
  [key: string]: any
}

// Structured logging functions
export const Logger = {
  // Standard log levels
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const meta: any = { ...context }
    
    if (error) {
      if (error instanceof Error) {
        meta.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      } else {
        meta.error = error
      }
    }

    logger.error(message, meta)
  },

  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context)
  },

  info: (message: string, context?: LogContext) => {
    logger.info(message, context)
  },

  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context)
  },

  http: (message: string, context?: LogContext) => {
    logger.http(message, context)
  },

  // Security audit logging
  audit: (message: string, context?: LogContext) => {
    logger.log('audit', message, {
      ...context,
      timestamp: new Date().toISOString(),
      auditEvent: true,
    })
  },

  // Authentication events
  auth: {
    login: (userId: string, email: string, context?: LogContext) => {
      Logger.audit(`User login successful: ${email}`, {
        ...context,
        userId,
        email,
        action: 'USER_LOGIN',
      })
    },

    loginFailed: (email: string, reason: string, context?: LogContext) => {
      Logger.audit(`Login failed for ${email}: ${reason}`, {
        ...context,
        email,
        action: 'LOGIN_FAILED',
        reason,
      })
    },

    logout: (userId: string, email: string, context?: LogContext) => {
      Logger.audit(`User logout: ${email}`, {
        ...context,
        userId,
        email,
        action: 'USER_LOGOUT',
      })
    },

    register: (userId: string, email: string, context?: LogContext) => {
      Logger.audit(`New user registration: ${email}`, {
        ...context,
        userId,
        email,
        action: 'USER_REGISTER',
      })
    },

    passwordReset: (userId: string, email: string, context?: LogContext) => {
      Logger.audit(`Password reset request: ${email}`, {
        ...context,
        userId,
        email,
        action: 'PASSWORD_RESET_REQUEST',
      })
    },

    emailVerification: (userId: string, email: string, success: boolean, context?: LogContext) => {
      Logger.audit(`Email verification ${success ? 'successful' : 'failed'}: ${email}`, {
        ...context,
        userId,
        email,
        action: 'EMAIL_VERIFICATION',
        success,
      })
    },
  },

  // Security events
  security: {
    rateLimited: (identifier: string, endpoint: string, context?: LogContext) => {
      Logger.audit(`Rate limit exceeded: ${identifier} on ${endpoint}`, {
        ...context,
        identifier,
        endpoint,
        action: 'RATE_LIMITED',
      })
    },

    ipBlocked: (ip: string, reason: string, context?: LogContext) => {
      Logger.audit(`IP address blocked: ${ip} - ${reason}`, {
        ...context,
        ip,
        reason,
        action: 'IP_BLOCKED',
      })
    },

    suspiciousActivity: (ip: string, activity: string, context?: LogContext) => {
      Logger.audit(`Suspicious activity detected: ${activity} from ${ip}`, {
        ...context,
        ip,
        activity,
        action: 'SUSPICIOUS_ACTIVITY',
      })
    },

    accessDenied: (userId: string, resource: string, context?: LogContext) => {
      Logger.audit(`Access denied: User ${userId} attempted to access ${resource}`, {
        ...context,
        userId,
        resource,
        action: 'ACCESS_DENIED',
      })
    },
  },

  // Admin actions
  admin: {
    action: (adminId: string, action: string, target: string, context?: LogContext) => {
      Logger.audit(`Admin action: ${action} on ${target} by admin ${adminId}`, {
        ...context,
        adminId,
        action: 'ADMIN_ACTION',
        adminAction: action,
        target,
      })
    },

    userManagement: (adminId: string, action: string, targetUserId: string, context?: LogContext) => {
      Logger.audit(`Admin user management: ${action} for user ${targetUserId} by admin ${adminId}`, {
        ...context,
        adminId,
        targetUserId,
        action: 'ADMIN_USER_MANAGEMENT',
        adminAction: action,
      })
    },
  },

  // API request logging
  request: (method: string, url: string, statusCode: number, duration: number, context?: LogContext) => {
    const level = statusCode >= 400 ? 'warn' : 'http'
    const message = `${method} ${url} ${statusCode} - ${duration}ms`
    
    logger.log(level, message, {
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: 'api_request',
    })
  },

  // Database operations
  database: {
    query: (query: string, duration: number, context?: LogContext) => {
      Logger.debug(`Database Query: ${query} (${duration}ms)`, {
        ...context,
        query,
        duration,
        type: 'database_query',
      })
    },

    error: (query: string, error: Error, context?: LogContext) => {
      Logger.error(`Database Error: ${query}`, error, {
        ...context,
        query,
        type: 'database_error',
      })
    },

    connection: (status: 'connected' | 'disconnected' | 'error', context?: LogContext) => {
      const level = status === 'error' ? 'error' : 'info'
      Logger[level](`Database ${status}`, {
        ...context,
        connectionStatus: status,
        type: 'database_connection',
      })
    },
  },

  // Redis operations
  redis: {
    operation: (operation: string, key: string, success: boolean, context?: LogContext) => {
      const level = success ? 'debug' : 'warn'
      Logger[level](`Redis ${operation}: ${key} - ${success ? 'success' : 'failed'}`, {
        ...context,
        operation,
        key,
        success,
        type: 'redis_operation',
      })
    },

    connection: (status: 'connected' | 'disconnected' | 'error', context?: LogContext) => {
      const level = status === 'error' ? 'error' : 'info'
      Logger[level](`Redis ${status}`, {
        ...context,
        connectionStatus: status,
        type: 'redis_connection',
      })
    },

    fallback: (operation: string, reason: string, context?: LogContext) => {
      Logger.warn(`Redis fallback: ${operation} - ${reason}`, {
        ...context,
        operation,
        reason,
        type: 'redis_fallback',
      })
    },
  },

  // Email operations
  email: {
    sent: (template: string, recipient: string, messageId: string, context?: LogContext) => {
      Logger.info(`Email sent: ${template} to ${recipient}`, {
        ...context,
        template,
        recipient,
        messageId,
        type: 'email_sent',
      })
    },

    failed: (template: string, recipient: string, error: string, context?: LogContext) => {
      Logger.error(`Email failed: ${template} to ${recipient} - ${error}`, undefined, {
        ...context,
        template,
        recipient,
        error,
        type: 'email_failed',
      })
    },

    rateLimited: (recipient: string, context?: LogContext) => {
      Logger.warn(`Email rate limited: ${recipient}`, {
        ...context,
        recipient,
        type: 'email_rate_limited',
      })
    },
  },

  // Performance monitoring
  performance: {
    slow: (operation: string, duration: number, threshold: number, context?: LogContext) => {
      Logger.warn(`Slow operation: ${operation} took ${duration}ms (threshold: ${threshold}ms)`, {
        ...context,
        operation,
        duration,
        threshold,
        type: 'performance_slow',
      })
    },

    memory: (usage: NodeJS.MemoryUsage, context?: LogContext) => {
      Logger.debug('Memory usage', {
        ...context,
        memoryUsage: {
          rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(usage.external / 1024 / 1024)}MB`,
        },
        type: 'performance_memory',
      })
    },
  },
}

// Export winston logger for advanced usage
export { logger }

// Default export
export default Logger