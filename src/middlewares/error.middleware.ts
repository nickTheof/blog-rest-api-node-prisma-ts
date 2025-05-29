import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { buildErrorResponse } from '../utils/errorResponse';
import logger from '../utils/logger';
import {AppError} from "../utils/AppError";

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    // 1. Zod validation errors
    if (err instanceof ZodError) {
        const errors = Object.entries(err.flatten().fieldErrors)
            .flatMap(([field, messages]) =>
                messages?.map(msg => `${field} ${msg}`) ?? []
            );

        logger.warn(`[ZOD] ${req.method} ${req.url}`, { errors });

        res.status(400).json(buildErrorResponse({
            status: 'ValidationError',
            message: 'Invalid input.',
            errors,
        }));
        return;
    }

    // 2. Prisma known DB errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(`[PRISMA-KNOWN] ${req.method} ${req.url} - ${err.code}`, {
            message: err.message,
            meta: err.meta,
        });

        const code = err.code;
        switch (code) {
            case 'P2002':
                res.status(409).json(buildErrorResponse({
                    status: 'EntityAlreadyExists',
                    message: 'Duplicate entry on unique field.',
                }));
                return;
            case 'P2025':
                res.status(404).json(buildErrorResponse({
                    status: 'EntityNotFound',
                    message: 'Record not found.',
                }));
                return;
            case 'P2003':
                res.status(400).json(buildErrorResponse({
                    status: 'ForeignKeyConstraintViolation',
                    message: 'Foreign key constraint failed.',
                }));
                return;
            default:
                res.status(400).json(buildErrorResponse({
                    status: 'PrismaUnknownError',
                    message: `Prisma error (${code})`,
                    errors: [err.message],
                }));
                return;
        }
    }

    // 3. Prisma validation errors
    if (err instanceof Prisma.PrismaClientValidationError) {
        logger.error(`[PRISMA-VALIDATION] ${req.method} ${req.url}`, { message: err.message });

        res.status(400).json(buildErrorResponse({
            status: 'PrismaValidationError',
            message: 'Invalid Prisma client query.',
            errors: [err.message],
        }));
        return;
    }

    // 4. Custom errors
    if (err instanceof AppError) {
        if (err.getCode() === 'EntityNotAuthorized') {
            res.status(401).json(buildErrorResponse({
                status: 'EntityNotAuthorized',
                message: err.message,
                errors: [],
            }))
            return;
        } else if (err.getCode() === 'EntityForbiddenAction') {
            res.status(403).json(buildErrorResponse({
                status: 'EntityForbiddenAction',
                message: err.message,
            }))
            return;
        } else if (err.getCode() === 'EntityNotFound') {
            res.status(404).json(buildErrorResponse({
                status: 'EntityNotFound',
                message: err.message,
            }))
            return;
        }
    }

    // 5. Fallback error
    logger.error(`[UNKNOWN] ${req.method} ${req.url}`, {
        error: err instanceof Error ? err.stack : err,
    });

    res.status(500).json(buildErrorResponse({
        status: 'InternalServerError',
        message: 'Internal Server Error',
        errors: [],
        stack: err instanceof Error ? err.stack : undefined,
    }));
}
