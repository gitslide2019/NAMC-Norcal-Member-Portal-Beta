import Redis from 'ioredis'
import Logger from './logger'

// Redis configuration interface
interface RedisConfig {
  host: string
  port: number
  password?: string
  db: number
  maxRetriesPerRequest: number
  retryDelayOnFailover: number
  enableOfflineQueue: boolean
  lazyConnect: boolean
}

// Redis connection status
export enum RedisStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

class RedisClient {
  private client: Redis | null = null
  private status: RedisStatus = RedisStatus.DISCONNECTED
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeClient()
  }

  private getConfig(): RedisConfig {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 500,
      enableOfflineQueue: false, // Don't queue commands when disconnected
      lazyConnect: true // Don't connect immediately
    }
  }

  private initializeClient(): void {
    const config = this.getConfig()
    
    this.client = new Redis(config)
    
    // Event handlers
    this.client.on('connect', () => {
      this.status = RedisStatus.CONNECTING
      Logger.info('Redis connecting', { type: 'redis_connection', status: 'connecting' })
    })

    this.client.on('ready', () => {
      this.status = RedisStatus.CONNECTED
      this.reconnectAttempts = 0
      Logger.redis.connection('connected')
      this.startHealthCheck()
    })

    this.client.on('error', (error) => {
      this.status = RedisStatus.ERROR
      Logger.redis.connection('error', { error: error.message })
      
      // Stop health check on error
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval)
        this.healthCheckInterval = null
      }
    })

    this.client.on('close', () => {
      this.status = RedisStatus.DISCONNECTED
      Logger.redis.connection('disconnected')
      
      // Stop health check on close
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval)
        this.healthCheckInterval = null
      }
    })

    this.client.on('reconnecting', () => {
      this.reconnectAttempts++
      Logger.info(`Redis reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`, {
        reconnectAttempts: this.reconnectAttempts,
        maxReconnectAttempts: this.maxReconnectAttempts
      })
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        Logger.error('Redis max reconnection attempts reached', undefined, {
          maxReconnectAttempts: this.maxReconnectAttempts
        })
        this.client?.disconnect()
      }
    })
  }

  private startHealthCheck(): void {
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.ping()
      } catch (error) {
        Logger.redis.operation('healthCheck', 'ping', false, { error })
      }
    }, 30000)
  }

  // Connect to Redis
  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized')
    }

    if (this.status === RedisStatus.CONNECTED) {
      return
    }

    try {
      await this.client.connect()
    } catch (error) {
      Logger.error('Redis connection failed', error, { operation: 'connect' })
      throw error
    }
  }

  // Disconnect from Redis
  async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    if (this.client) {
      await this.client.disconnect()
      this.status = RedisStatus.DISCONNECTED
    }
  }

  // Check if Redis is available
  isAvailable(): boolean {
    return this.status === RedisStatus.CONNECTED && this.client !== null
  }

  // Get connection status
  getStatus(): RedisStatus {
    return this.status
  }

  // Ping Redis server
  async ping(): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }
    return await this.client!.ping()
  }

  // Health check with detailed information
  async healthCheck(): Promise<{
    status: RedisStatus
    connected: boolean
    latency?: number
    memory?: string
    uptime?: number
  }> {
    const result = {
      status: this.status,
      connected: this.isAvailable()
    }

    if (!this.isAvailable()) {
      return result
    }

    try {
      // Measure latency
      const start = Date.now()
      await this.client!.ping()
      const latency = Date.now() - start

      // Get server info
      const info = await this.client!.info('memory')
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/)
      const memory = memoryMatch ? memoryMatch[1] : undefined

      const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/)
      const uptime = uptimeMatch ? parseInt(uptimeMatch[1]) : undefined

      return {
        ...result,
        latency,
        memory,
        uptime
      }
    } catch (error) {
      Logger.redis.operation('healthCheck', 'info', false, { error })
      return result
    }
  }

  // Get Redis client instance (for direct operations)
  getClient(): Redis | null {
    return this.isAvailable() ? this.client : null
  }

  // Set operation with expiration
  async set(key: string, value: string, expireInSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      if (expireInSeconds) {
        const result = await this.client!.setex(key, expireInSeconds, value)
        return result === 'OK'
      } else {
        const result = await this.client!.set(key, value)
        return result === 'OK'
      }
    } catch (error) {
      Logger.redis.operation('set', key, false, { error, expireInSeconds })
      throw error
    }
  }

  // Get operation
  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.get(key)
    } catch (error) {
      Logger.redis.operation('get', key, false, { error })
      throw error
    }
  }

  // Delete operation
  async del(key: string): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.del(key)
    } catch (error) {
      Logger.redis.operation('del', key, false, { error })
      throw error
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      const result = await this.client!.exists(key)
      return result === 1
    } catch (error) {
      Logger.redis.operation('exists', key, false, { error })
      throw error
    }
  }

  // Set expiration for existing key
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      const result = await this.client!.expire(key, seconds)
      return result === 1
    } catch (error) {
      Logger.redis.operation('expire', key, false, { error, seconds })
      throw error
    }
  }

  // Get time to live for key
  async ttl(key: string): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.ttl(key)
    } catch (error) {
      Logger.redis.operation('ttl', key, false, { error })
      throw error
    }
  }

  // Increment operation (for counters)
  async incr(key: string): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.incr(key)
    } catch (error) {
      Logger.redis.operation('incr', key, false, { error })
      throw error
    }
  }

  // Hash operations for structured data
  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.hset(key, field, value)
    } catch (error) {
      Logger.redis.operation('hset', key, false, { error, field })
      throw error
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.hget(key, field)
    } catch (error) {
      Logger.redis.operation('hget', key, false, { error, field })
      throw error
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.hgetall(key)
    } catch (error) {
      Logger.redis.operation('hgetall', key, false, { error })
      throw error
    }
  }

  // Set operations for collections
  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.sadd(key, ...members)
    } catch (error) {
      Logger.redis.operation('sadd', key, false, { error, members })
      throw error
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      const result = await this.client!.sismember(key, member)
      return result === 1
    } catch (error) {
      Logger.redis.operation('sismember', key, false, { error, member })
      throw error
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available')
    }

    try {
      return await this.client!.srem(key, ...members)
    } catch (error) {
      Logger.redis.operation('srem', key, false, { error, members })
      throw error
    }
  }
}

// Singleton Redis client instance
const redisClient = new RedisClient()

// Helper functions for graceful fallback
export const withRedis = async <T>(
  operation: () => Promise<T>,
  fallback: () => T,
  operationName: string = 'Redis operation'
): Promise<T> => {
  if (!redisClient.isAvailable()) {
    Logger.redis.fallback(operationName, 'Redis not available')
    return fallback()
  }

  try {
    return await operation()
  } catch (error) {
    Logger.redis.fallback(operationName, error instanceof Error ? error.message : 'Unknown error')
    return fallback()
  }
}

// Export singleton instance and utilities
export { redisClient, RedisClient }
export default redisClient