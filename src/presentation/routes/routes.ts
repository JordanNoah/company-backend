import { Hono } from "hono";
import { V1Routes } from "./v1/routes";

export default class AppRoutes {
    public get routes(): Hono {
        const routes = new Hono();
        routes.get("/", (c) => {
            return c.json({
                status: "success",
                info: {
                    Title: 'Core Delegate Service',
                    Version: '2.0.0',
                    Author: 'Teaching Management',
                }
            });
        });
        routes.route("/api/v1", new V1Routes().routes)
        return routes;
    }
}
