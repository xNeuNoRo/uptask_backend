import { Router, type Express } from "express";

// Import all routes
import Project from "./project.routes";

export function registerRoutes(app: Express) {
  // API v1 routes
  const v1 = Router();

  // Mount the v1 routes
  v1.use("/projects", Project);
  v1.use("/test", (_req, res) => {
    res.send("The API is working correctly");
  });

  // Use the v1 routes with the /api/v1 prefix
  app.use("/api/v1", v1);
}
