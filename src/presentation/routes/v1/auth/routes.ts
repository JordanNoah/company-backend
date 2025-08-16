import { Hono } from "hono";
import AuthController from "./controller";

export default class AuthRoutes {
    public get routes(): Hono {
        const routes = new Hono();
        const controller = new AuthController();
        routes.post('/refresh', controller.refreshToken);
        return routes;
    }
}