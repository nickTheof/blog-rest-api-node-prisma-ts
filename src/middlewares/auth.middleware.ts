import authService from "../service/auth.service";
import {Request, Response, NextFunction} from "express";
import {UserTokenPayload} from "../types/user-auth.types";
import {AppError} from "../utils/AppError";
import {Role} from "@prisma/client";

type MyLocals = {
    user: UserTokenPayload;
}
export type AuthResponse = Response<any, MyLocals>

export const verifyToken = async (req: Request, res: AuthResponse, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return next(new AppError("EntityNotAuthorized",'No token provided'));
    }
    const payload = authService.verifyAccessToken(token);
    if (payload) {
        if (!payload.isVerified) {
            return next(new AppError("EntityNotAuthorized",'Token is not valid'));
        } else {
            res.locals.user = payload.data as UserTokenPayload;
            next();
        }
    }
}

export const verifyRoles = (...allowedRoles: Role[]) => (req: Request, res: AuthResponse, next: NextFunction) => {
    const {user} = res.locals;
    if (!user || !user.role) {
        return next(new AppError("EntityNotAuthorized",'No user provided'));
    }
    if (!allowedRoles.includes(user.role)) {
        return next(new AppError("EntityNotAuthorized",'You are not authorized to perform this action'));
    }
    next();
}