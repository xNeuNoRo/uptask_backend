import "@/config/tracing";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import path from "node:path";

import { error, success, httpLogger } from "@/middlewares";
import { registerRoutes } from "@/routes";
import { AppError } from "@/utils";

import { corsConfig } from "./config/cors";
import { metrics } from "./middlewares/metrics.middleware";

export function createApp(): Express {
  const app: Express = express();

  app.use(cors(corsConfig));

  // Static middleware to serve hashed assets for emails
  app.use(
    "/static",
    express.static(path.join(__dirname, "public/assets"), {
      fallthrough: true,
      maxAge: "1y",
      etag: false,
      dotfiles: "ignore",
      index: false,
      setHeaders(res, filePath) {
        // Detecta el patron file.<hash>.ext
        const isHashed = /\.[0-9a-f]{8}\./i.test(filePath);
        if (isHashed) {
          // Este header sirve para cachear por 1y
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    }),
  );

  // Middleware 404 especifico para asset
  app.use("/static", (_req, _res, next) => {
    next(new AppError("ASSET_NOT_FOUND"));
  });

  // Global middlewares
  app.use(httpLogger);
  app.use(express.json());
  app.use(cookieParser());
  app.use(success);
  app.use(metrics);

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
