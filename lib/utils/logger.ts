import { env } from '@/env.mjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

interface LoggerOptions {
  name: string
  level?: LogLevel
  context?: Record<string, unknown>
}

class Logger {
  private static instance: Logger
  private logLevel: LogLevel = 'info'
  private name: string
  private defaultContext?: Record<string, unknown>

  private constructor(options: LoggerOptions) {
    this.name = options.name
    this.defaultContext = options.context

    if (env.NODE_ENV === 'development') {
      this.logLevel = 'debug'
    }

    if (options.level) {
      this.logLevel = options.level
    }
  }

  public static getInstance(options: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options)
    }
    return Logger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private formatMessage(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
    return `[${entry.timestamp}] ${entry.level.toUpperCase()} [${this.name}]: ${entry.message}${contextStr}`
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...this.defaultContext,
        ...context,
      },
    }
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      const entry = this.createLogEntry('debug', message, context)
      console.debug(this.formatMessage(entry))
    }
  }

  public info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      const entry = this.createLogEntry('info', message, context)
      console.info(this.formatMessage(entry))
    }
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      const entry = this.createLogEntry('warn', message, context)
      console.warn(this.formatMessage(entry))
    }
  }

  public error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      const entry = this.createLogEntry('error', message, context)
      console.error(this.formatMessage(entry))

      // Send to error reporting service in production
      if (env.NODE_ENV === 'production') {
        // TODO: Implement error reporting service integration
      }
    }
  }

  public extend(name: string, context?: Record<string, unknown>): Logger {
    return Logger.getInstance({
      name: `${this.name}:${name}`,
      level: this.logLevel,
      context: {
        ...this.defaultContext,
        ...context,
      },
    })
  }
}

export function createLogger(name: string, options: Partial<LoggerOptions> = {}): Logger {
  return Logger.getInstance({
    name,
    ...options,
  })
}

export const logger = createLogger('app')
