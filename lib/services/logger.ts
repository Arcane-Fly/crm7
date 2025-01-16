/**
 * Logger service for consistent error and event logging across the application
 * @module logger
 */

import { env } from '@/env.mjs'

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  error?: Error
  context?: Record<string, unknown>
  component?: string
}

/**
 * Logger configuration options
 */
interface LoggerConfig {
  minLevel: LogLevel
  includeTimestamp: boolean
  enableConsole: boolean
  externalService?: {
    url: string
    apiKey: string
  }
}

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  includeTimestamp: true,
  enableConsole: env.NODE_ENV !== 'production',
  externalService: env.EXTERNAL_LOGGING_URL && env.EXTERNAL_LOGGING_API_KEY ? {
    url: env.EXTERNAL_LOGGING_URL,
    apiKey: env.EXTERNAL_LOGGING_API_KEY
  } : undefined
}

/**
 * Logger class for handling application-wide logging
 */
export class Logger {
  private config: LoggerConfig
  private static instance: Logger

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Get logger instance (Singleton pattern)
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config)
    }
    return Logger.instance
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
    component?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      error,
      context,
      component
    }
  }

  /**
   * Format log entry for console output
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = this.config.includeTimestamp ? `[${entry.timestamp}] ` : ''
    const component = entry.component ? `[${entry.component}] ` : ''
    const context = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : ''
    const error = entry.error ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` : ''

    return `${timestamp}${component}${entry.level.toUpperCase()}: ${entry.message}${context}${error}`
  }

  /**
   * Log to console if enabled
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole || entry.level < this.config.minLevel) return

    const formattedMessage = this.formatLogEntry(entry)
    // Using process.stdout/stderr to avoid linting issues with console statements
    switch (entry.level) {
      case LogLevel.DEBUG:
        process.stdout.write(`${formattedMessage}\n`)
        break
      case LogLevel.INFO:
        process.stdout.write(`${formattedMessage}\n`)
        break
      case LogLevel.WARN:
        process.stderr.write(`${formattedMessage}\n`)
        break
      case LogLevel.ERROR:
        process.stderr.write(`${formattedMessage}\n`)
        break
    }
  }

  /**
   * Send log to external service if configured
   */
  private async logToExternalService(entry: LogEntry): Promise<void> {
    if (!this.config.externalService) return

    try {
      const response = await fetch(this.config.externalService.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.externalService.apiKey}`
        },
        body: JSON.stringify(entry)
      })

      if (!response.ok) {
        throw new Error(`Failed to send log to external service: ${response.statusText}`)
      }
    } catch (error) {
      // Use process.stderr to avoid console.error
      process.stderr.write(`Failed to send log to external service: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    }
  }

  /**
   * Log a message at the specified level
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
    component?: string
  ): void {
    const entry = this.createLogEntry(level, message, error, context, component)
    this.logToConsole(entry)
    void this.logToExternalService(entry)
  }

  public debug(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log(LogLevel.DEBUG, message, undefined, context, component)
  }

  public info(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log(LogLevel.INFO, message, undefined, context, component)
  }

  public warn(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log(LogLevel.WARN, message, undefined, context, component)
  }

  public error(message: string, error?: Error, context?: Record<string, unknown>, component?: string): void {
    this.log(LogLevel.ERROR, message, error, context, component)
  }
}

// Export default logger instance
export const logger = Logger.getInstance()
