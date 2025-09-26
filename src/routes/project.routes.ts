import { Router } from "express";

// Import all controllers
import {
  projectIdValidator,
  projectValidator,
} from "@/validators/project.validator";
import { validateRequest } from "@/middlewares";
import { ProjectController } from "@/controllers/Project.controller";

const router: Router = Router();

// Project routes

// Create a new project
router.post(
  "/",
  projectValidator,
  validateRequest,
  ProjectController.createProject,
);

// Get all projects
router.get("/", ProjectController.getAllProjects);

// Get a project by ID
router.get(
  "/:id",
  projectIdValidator,
  validateRequest,
  ProjectController.getProjectById,
);

// Update a project
router.put(
  "/:id",
  projectIdValidator,
  projectValidator,
  validateRequest,
  ProjectController.updateProject,
);

// Delete a project
router.delete(
  "/:id",
  projectIdValidator,
  validateRequest,
  ProjectController.deleteProject,
);

export default router;
