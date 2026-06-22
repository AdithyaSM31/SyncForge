import rateLimit from 'express-rate-limit';

export const executionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 executions per minute per IP
  message: { error: 'Too many execution requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
