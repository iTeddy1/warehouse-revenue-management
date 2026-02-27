import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../exceptions/app-error.js';
import { MSG } from '../constants/messages.vi.js';
import { ZodError } from 'zod';

/**
 * Global error handler middleware for Fastify
 */
export async function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error for debugging
  request.log.error(error);

  // Handle known AppError instances
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors = error.issues.map((err: any) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    return reply.status(400).send({
      success: false,
      message: MSG.ERROR.BAD_REQUEST,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      errors,
    });
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return reply.status(409).send({
        success: false,
        message: MSG.ERROR.EXISTS,
        code: 'CONFLICT',
        statusCode: 409,
      });
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return reply.status(404).send({
        success: false,
        message: MSG.ERROR.NOT_FOUND,
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    }
  }

  // Default internal server error
  return reply.status(500).send({
    success: false,
    message: MSG.ERROR.INTERNAL_SERVER,
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  });
}
