import dotenv from 'dotenv';
import type {NODE_ENV, Config} from "../types/config.types";

dotenv.config();

const config: Config = {
    PORT: parseInt(process.env.PORT as string) || 3000,
    NODE_ENV: process.env.NODE_ENV as NODE_ENV || 'development',
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS as string) || 12,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS as string,
    RATE_LIMIT_WINDOW_MINUTES: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES as string) || 15,
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS as string) || 100,
    JSONWEBTOKEN_SECRET: process.env.JSONWEBTOKEN_SECRET as string,
    JWT_EXPIRATION_TIME: parseInt(process.env.JWT_EXPIRATION_TIME as string) || 3600,
}

export default config;