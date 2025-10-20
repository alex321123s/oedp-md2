import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Ein unerwarteter Fehler ist aufgetreten';
  let errors: any[] | undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validierungsfehler';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // Handle custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Ungültiges Token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token abgelaufen';
  }
  // Handle database errors
  else if (err.name === 'QueryFailedError') {
    statusCode = 400;
    message = 'Datenbankfehler';
    logger.error('Database query failed:', err);
  }
  // Default error
  else {
    logger.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err.message,
    }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route nicht gefunden',
    path: req.path,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
