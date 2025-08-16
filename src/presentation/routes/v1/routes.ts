import { Hono } from "hono";
import CompanyRoutes from "@/presentation/routes/v1/company/routes";
import AuthRoutes from "./auth/routes";

export class V1Routes {
    public get routes(): Hono{
        const routes = new Hono();
        routes.route('/company', new CompanyRoutes().routes);
        routes.route('/auth', new AuthRoutes().routes);
        return routes;
    }
}