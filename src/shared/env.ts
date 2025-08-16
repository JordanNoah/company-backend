require('dotenv').config();

export default {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    //database
    PORT: Number(process.env.PORT) || 3000,
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    DB_USERNAME: process.env.DB_USERNAME ?? '',
    DB_PASSWORD: process.env.DB_PASSWORD ?? '',
    DB_NAME: process.env.DB_NAME ?? '',
    DEFAULT_TTL_MS: Number(process.env.DEFAULT_TTL_MS) || 1000 * 60 * 60 * 24 * 30,
    ACCESS_TTL_MIN: Number(process.env.ACCESS_TTL_MIN) || 60,
    JWT_SECRET: process.env.JWT_SECRET ?? 'secretillo',
    REFRESH_COOKIE_PATH: process.env.REFRESH_COOKIE_PATH ?? '/refresh_token',
    REFRESH_MAX_AGE: Number(process.env.REFRESH_MAX_AGE) || 60 * 60 * 24 * 30
}