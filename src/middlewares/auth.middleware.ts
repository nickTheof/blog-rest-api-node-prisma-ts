import {Request, NextFunction} from "express";
import authService from "../service/auth.service";
import {AppError} from "../utils/AppError";
import {UserTokenPayload} from "../types/user-auth.types";
import {Role} from "@prisma/client";
import {AuthResponse} from "../types/user-auth.types";

export const verifyToken = async (req: Request, res: AuthResponse, next: NextFunction): Promise<void> => {
    const authHeader: string| undefined = req.headers.authorization;
    const token: string| undefined = authHeader && authHeader.split(' ')[1];
    if (!token) {
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