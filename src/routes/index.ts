import { Router, type Express } from "express";

// Import all routes
import Project from "@/routes/project.routes";
import Auth from "@/routes/auth.routes";
import prometheusRegistry from "@/config/metrics";

export function registerRoutes(app: Express) {
  // API v1 routes
  const v1 = Router();

  // Mount the v1 routes
  v1.use("/projects", Project);
  v1.use("/auth", Auth);

  // Metrics endpoint
  v1.use("/metrics", async (_req, res) => {
    const metrics = await prometheusRegistry.metrics();
    res.set("Content-Type", prometheusRegistry.contentType);
    res.send(metrics);
  });
  // Health check endpoint
  v1.use("/health", (_req, res) => {
    res.send("The API is working correctly");
  });

  // Use the v1 routes with the /api/v1 prefix
  app.use("/api/v1", v1);
}
