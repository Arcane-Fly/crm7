import winston from 'winston';

interface LogMetadata {
  [key: string]: unknown;
}

type LogMessage = string | Error;

interface TypedLogger {
  error: (message: LogMessage, meta?: LogMetadata) => void;
  warn: (message: LogMessage, meta?: LogMetadata) => void;
  info: (message: LogMessage, meta?: LogMetadata) => void;
  debug: (message: LogMessage, meta?: LogMetadata) => void;
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// Type-safe logger wrapper
const typedLogger: TypedLogger = {
  error: (message: LogMessage, meta?: LogMetadata) => {
    if (message instanceof Error) {
      logger.error(message.message, {
        ...meta,
        error: { message: message.message, stack: message.stack },
      });
    } else {
      logger.error(message: unknown, meta);
    }
  },
  warn: (message: LogMessage, meta?: LogMetadata) => {
    if (message instanceof Error) {
      logger.warn(message.message, {
        ...meta,
        error: { message: message.message, stack: message.stack },
      });
    } else {
      logger.warn(message: unknown, meta);
    }
  },
  info: (message: LogMessage, meta?: LogMetadata) => {
    if (message instanceof Error) {
      logger.info(message.message, {
        ...meta,
        error: { message: message.message, stack: message.stack },
      });
    } else {
      logger.info(message: unknown, meta);
    }
  },
  debug: (message: LogMessage, meta?: LogMetadata) => {
    if (message instanceof Error) {
      logger.debug(message.message, {
        ...meta,
        error: { message: message.message, stack: message.stack },
      });
    } else {
      logger.debug(message: unknown, meta);
    }
  },
};

export default typedLogger;
