import {NextFunction, Request, Response} from 'express';
import {z} from "zod";

export const validateBody =
    (schema: z.Schema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = schema.parse(req.body);
        next()
    } catch (err) {
        next(err)
    }
}

export const validateQuery =
    (schema: z.Schema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        res.locals.validatedQuery = schema.parse(req.query);
        next()
    } catch (err) {
        next(err)
    }
}

export const validateParams =
    (schema: z.Schema) => (req: Request, res: Response, next: NextFunction) => {
        try {
            res.locals.validatedParams = schema.parse(req.params);
            next()
        } catch (err) {
            next(err)
        }
    }

