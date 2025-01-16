import { env } from '@/env.mjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

class Logger {
  private static instance: Logger
  private logLevel: LogLevel = 'info'

  private constructor() {
    // Set log level from environment if available
    if (env.NODE_ENV === 'development') {
      this.logLevel = 'debug'
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private formatMessage(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return

    const formattedMessage = this.formatMessage(entry)

    /* eslint-disable no-console */
    switch (entry.level) {
      case 'debug':
        console.debug(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
    }
    /* eslint-enable no-console */

    // In production, you might want to send logs to a service
    if (env.NODE_ENV === 'production') {
      // TODO: Implement production logging service integration
      // e.g., send to logging service, error tracking service, etc.
    }
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('debug', message, context))
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('info', message, context))
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('warn', message, context))
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('error', message, context))
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }
}

export const logger = Logger.getInstance()
