export default {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    //database
    PORT: Number(process.env.PORT) || 3000,
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    DB_USERNAME: process.env.DB_USERNAME ?? '',
    DB_PASSWORD: process.env.DB_PASSWORD ?? '',
    DB_NAME: process.env.DB_NAME ?? '',
}