import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format without icons/emojis
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we are not in production, log to the console with colorized output
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    })
  );
}

export default logger;
