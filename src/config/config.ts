import dotenv from 'dotenv';

dotenv.config();

interface Config {
    PORT: number;
    NODE_ENV: string;
}

const config: Config = {
    PORT: parseInt(process.env.PORT as string) || 3000,
    NODE_ENV: process.env.NODE_ENV as string || 'development'
}

export default config;