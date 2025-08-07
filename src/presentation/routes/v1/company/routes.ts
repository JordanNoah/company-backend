import { Hono } from "hono";
import CompanyController from "./controller";

export default class CompanyRoutes {
    public get routes(): Hono {
        const routes = new Hono();
        const controller = new CompanyController();

        routes.post('/', controller.upsert);
        return routes;
    }
}