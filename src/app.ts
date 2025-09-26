import "dotenv/config";
import express, { type Express } from "express";
import { registerRoutes } from "@/routes";
import { AppError } from "@/utils";
import { error, success } from "@/middlewares";

export function createApp(): Express {
  const app: Express = express();

  // Global middlewares
  app.use(express.json());
  app.use(success);

  // Register routes
  registerRoutes(app);

  // 404 Error => Catches in the below handler
  app.use((_req, _res, next) => {
    next(new AppError("NOT_FOUND"));
  });

  // 500 Error => Handler (throws 500 if not specified)
  app.use(error);

  return app;
}
