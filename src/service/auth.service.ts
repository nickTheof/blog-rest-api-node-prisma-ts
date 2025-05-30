import jwt from "jsonwebtoken";
import config from "../config/config";
import userService from "./user.service";
import SecUtil from "../utils/SecUtil";
import {LoginDTOSchema, RegisterDTOSchema} from "../types/zod-schemas.types";
import {UserTokenPayload, UserForTokenVerification, VerifyTokenResponse} from "../types/user-auth.types";
import {formatUser} from "../utils/helpers/response.helpers";
import {User} from "@prisma/client";


const generateAccessToken = (user: UserTokenPayload): string => {
    const secret: jwt.Secret = config.JSONWEBTOKEN_SECRET;
    const options: jwt.SignOptions = {
        expiresIn: config.JWT_EXPIRATION_TIME,
    }
    const serializableTokenPayload = {
        ...user,
        id: user.id.toString(),
    }
    return  jwt.sign(serializableTokenPayload, secret, options);
}

const verifyAccessToken = async (token: string) : Promise<VerifyTokenResponse> => {
    const secret: jwt.Secret = config.JSONWEBTOKEN_SECRET;
    try {
        const payload = jwt.verify(token, secret);
        const userTokenPayload = payload as UserTokenPayload;
        const currentUser: User | null =  await userService.getById(userTokenPayload.id);
        if (!currentUser || !currentUser.isActive) {
            return {
                isVerified: false,
                data: "User is not active"
            }
        }
        return {
            isVerified: true,
            data: payload as UserTokenPayload,
        }
    } catch (err: unknown) {
        if (err instanceof jwt.JsonWebTokenError) {
            return {
                isVerified: false,
                data: err.message
            }
        } else {
            return {
                isVerified: false,
                data: "Error in verification token"
            }
        }
    }
}

const loginUser = async (loginDto: LoginDTOSchema): Promise<{ status: string, data?: string, message?: string }> => {
    const user: UserForTokenVerification | null = await userService.getByEmail(loginDto.email);
    if (!user || !user.isActive) {
        return {
            status: "error",
            message: "User not found",
        }
    } else {
        const isPasswordValid = await SecUtil.verifyPassword(loginDto.password, user.password);
        if (isPasswordValid) {
            return {
                status: 'success',
                data: generateAccessToken(user),
            }
        } else {
            return {
                status: 'error',
                message: 'Invalid credentials',
            }
        }
    }
}

const registerUser = async (data: RegisterDTOSchema) => {
    const user: User = await userService.create({
        email: data.email,
        password: data.password,
    });
    return {
        status: 'success',
        data: formatUser(user)
    }
}

export default {
    generateAccessToken,
    verifyAccessToken,
    loginUser,
    registerUser,
}