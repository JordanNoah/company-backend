import { Hono } from "hono";
import CompanyRoutes from "@/presentation/routes/v1/company/routes";

export class V1Routes {
    public get routes(): Hono{
        const routes = new Hono();
        routes.route('/company', new CompanyRoutes().routes);
        return routes;
    }
}