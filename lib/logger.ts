import { z } from 'zod';

// Log level schema
export const LogLevel = z.enum(['debug', 'info', 'warn', 'error']);
export type LogLevel = z.infer<typeof LogLevel>;

// Log metadata schema
export const LogMetadata = z.record(z.unknown());
export type LogMetadata = z.infer<typeof LogMetadata>;

// Log entry schema
export const LogEntry = z.object({
  level: LogLevel,
  message: z.string(),
  timestamp: z.date(),
  metadata: LogMetadata.optional(),
});
export type LogEntry = z.infer<typeof LogEntry>;

class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    const entry = LogEntry.parse({
      level,
      message,
      timestamp: new Date(),
      metadata,
    });

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Log to console in development
    // Use process.stdout for direct logging in development
    if (process.env.NODE_ENV === 'development') {
      process.stdout.write(
        `[${entry.timestamp.toISOString()}] ${level.toUpperCase()}: ${message}${metadata ? '\nMetadata: ' + JSON.stringify(metadata, null, 2) : ''}\n`,
      );
    }

    // TODO: Add production logging (e.g., to a service like Sentry or CloudWatch)
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: LogMetadata): void {
    this.log('error', message, metadata);
  }

  getRecentLogs(count = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  clearLogs(): void {
    this.logBuffer = [];
  }
}

export const logger = Logger.getInstance();
