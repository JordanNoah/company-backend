import {serve} from "@hono/node-server"
import {Hono} from "hono"
import {cors} from "hono/cors"
import {DbSequelize} from "@/infrastructure/database/index"
import appConfig from "@/shared/env"
import AppRoutes from "./routes/routes"

export class Server {
    public readonly app: Hono
    private readonly port: number

    constructor() {
        this.app = new Hono()
        this.port = appConfig.PORT
    }

    public async start(): Promise<void> {
        try {
            console.time('start server')
            await DbSequelize()
            this.cors()
            this.app.route('/', new AppRoutes().routes)
            this.server()
            console.timeEnd('start server')
        } catch (error) {
            console.log(error);
        }
    }

    public cors(): void {
        this.app.use('*', async (c, next) => {
            const corsMiddleware = cors()
            return await corsMiddleware(c, next)
        })
    }

    public server(): void {
        serve({
            fetch: this.app.fetch,
            port: this.port
        }, (info) => {
            console.log(`Server is running on port ${info.port}`);
        })
    }
}
