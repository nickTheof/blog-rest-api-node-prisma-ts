export type NODE_ENV = 'development' | 'production' | 'test';

export type Config = {
    PORT: number;
    NODE_ENV: NODE_ENV;
    SALT_ROUNDS: number;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT_WINDOW_MINUTES: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    JSONWEBTOKEN_SECRET: string;
    JWT_EXPIRATION_TIME: number;
}