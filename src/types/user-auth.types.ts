import {Role} from "@prisma/client";
import {Response} from "express";
export type UserTokenPayload = {
    email: string;
    role: Role;
    isActive: boolean;
    uuid: string;
}

export type UserForTokenVerification = UserTokenPayload & {
    password: string;
}

export type VerifyTokenResponse = {
    isVerified: boolean;
    data: UserTokenPayload | string;
}

export type MyLocals = {
    user: UserTokenPayload;
}
export type AuthResponse = Response<any, MyLocals>
