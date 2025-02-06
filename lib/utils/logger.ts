import { env } from '@/env.mjs';

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

class ConsoleLogger implements Logger {
  constructor(private readonly namespace: string) {}

  private formatMessage(level: string, message: string): string {
    return `[${level.toUpperCase()}] ${this.namespace}: ${message}`;
  }

  private formatContext(context?: Record<string, unknown>): string {
    if (!context || Object.keys(context).length === 0) {
      return '';
    }
    return ` ${JSON.stringify(context)}`;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message) + this.formatContext(context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(this.formatMessage('info', message) + this.formatContext(context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage('warn', message) + this.formatContext(context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(this.formatMessage('error', message) + this.formatContext(context));
  }
}

class LoggerFactory {
  error(arg0: string, logError: LogError) {
    throw new Error('Method not implemented.');
  }
  private loggers = new Map<string, Logger>();

  createLogger(namespace: string): Logger {
    let logger = this.loggers.get(namespace);
    if (!logger) {
      logger = new ConsoleLogger(namespace);
      this.loggers.set(namespace, logger);
    }
    return logger;
  }
}

export const logger = new LoggerFactory();
