import {Options} from 'sequelize'
import env from "@/shared/env";

export const config: Options = {
    host: env.DB_HOST,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    logging: false,
    port: env.DB_PORT,
    database: env.DB_NAME,
    dialect: 'mysql'
}