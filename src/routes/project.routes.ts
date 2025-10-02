import { Router } from "express";

// Import all controllers
import { ProjectController } from "@/controllers/Project.controller";
import { TaskController } from "@/controllers/Task.controller";
import { validateRequest, projectExists, taskExists } from "@/middlewares";
import {
  projectIdValidator,
  projectValidator,
  taskIdValidator,
  taskStatusValidator,
  taskValidator,
} from "@/validators/project.validator";
import { taskBelongsToProject } from "@/middlewares/task.middleware";

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

// Middleware that only executes when projectId is present to validate projectId
// and existence for routes with :projectId
router.param("projectId", async (req, _res, next, _val) => {
  for (const chain of projectIdValidator) await chain.run(req); // Validate the projectId param
  validateRequest(req, _res, next); // Ensure validation results are checked
});
router.param("projectId", projectExists);

// Get a project by ID
router.get("/:projectId", ProjectController.getProjectById);

// Update a project
router.put(
  "/:projectId",
  projectValidator,
  validateRequest,
  ProjectController.updateProject,
);

// Delete a project
router.delete("/:projectId", ProjectController.deleteProject);

/** Routes for tasks **/

// Create a new task within a specific project
router.post(
  "/:projectId/tasks",
  taskValidator,
  validateRequest,
  TaskController.createTask,
); // Nested resource routing

// Get all tasks for a specific project
router.get("/:projectId/tasks", TaskController.getProjectTasks);

// Middleware that only executes when taskId is present to validate taskId
router.param("taskId", taskExists);
// Middleware to check if the task belongs to the project
router.param("taskId", taskBelongsToProject);

// Get a specific task by ID within a specific project
router.get(
  "/:projectId/tasks/:taskId",
  taskIdValidator,
  validateRequest,
  TaskController.getTaskById,
);

// Update a specific task by ID within a specific project
router.put(
  "/:projectId/tasks/:taskId",
  taskIdValidator,
  taskValidator,
  validateRequest,
  TaskController.updateTask,
);

// Delete a specific task by ID within a specific project
router.delete(
  "/:projectId/tasks/:taskId",
  taskIdValidator,
  validateRequest,
  TaskController.deleteTask,
);

router.post(
  "/:projectId/tasks/:taskId/status",
  taskIdValidator,
  taskStatusValidator,
  validateRequest,
  TaskController.updateTaskStatus,
);

export default router;
