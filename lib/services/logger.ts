type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  component?: string;
  error?: Error;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private shouldLog = process.env.NODE_ENV !== 'test';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(entry: LogEntry): string {
    const context = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
    const component = entry.component ? ` | ${entry.component}` : '';
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${component}${context}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    component?: string,
    error?: Error,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      component,
      error,
    };
  }

  private shouldLogLevel(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.logLevel];
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.shouldLogLevel(entry.level)) return;

    const formattedMessage = this.formatMessage(entry);
    // Only log errors and warnings in production
    if (process.env.NODE_ENV === 'production') {
      switch (entry.level) {
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage, entry.error);
          break;
      }
    } else {
      switch (entry.level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage, entry.error);
          break;
      }
    }
  }

  private logToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // This could be Sentry, LogRocket, or another service
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Send to Sentry
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    component?: string,
    error?: Error,
  ): void {
    if (!this.shouldLog) return;

    const entry = this.createLogEntry(level, message, context, component, error);
    this.logToConsole(entry);
    this.logToExternalService(entry);
  }

  debug(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log('debug', message, context, component);
  }

  info(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log('info', message, context, component);
  }

  warn(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log('warn', message, context, component);
  }

  error(message: string, error: Error, context?: Record<string, unknown>, component?: string): void {
    this.log('error', message, context, component, error);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

export const logger = Logger.getInstance();
