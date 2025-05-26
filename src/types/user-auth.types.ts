export type UserTokenPayload = {
    email: string;
    role: ('USER' | 'EDITOR' | 'ADMIN');
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