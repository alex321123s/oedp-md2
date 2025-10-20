import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    message: 'Zu viele Anfragen, bitte versuchen Sie es später erneut',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Zu viele fehlgeschlagene Anmeldeversuche, bitte warten Sie 15 Minuten',
  },
});

export const signatureLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 signatures per minute
  message: {
    success: false,
    message: 'Zu viele Unterschriften in kurzer Zeit',
  },
});
