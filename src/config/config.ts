import dotenv from 'dotenv';

dotenv.config();

type NODE_ENV = 'production' | 'development' | 'test';

interface Config {
    PORT: number;
    NODE_ENV: NODE_ENV;
    SALT_ROUNDS: number;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT_WINDOW_MINUTES: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    JSONWEBTOKEN_SECRET: string;
}

const config: Config = {
    PORT: parseInt(process.env.PORT as string) || 3000,
    NODE_ENV: process.env.NODE_ENV as NODE_ENV || 'development',
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS as string) || 12,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS as string,
    RATE_LIMIT_WINDOW_MINUTES: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES as string) || 15,
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS as string) || 100,
    JSONWEBTOKEN_SECRET: process.env.JSONWEBTOKEN_SECRET as string,
}

export default config;