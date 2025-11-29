import { Router } from "express";

// Import all controllers
import { NoteController } from "@/controllers/Note.controller";
import { ProjectController } from "@/controllers/Project.controller";
import { TaskController } from "@/controllers/Task.controller";
import { TeamMemberController } from "@/controllers/Team.controller";
// Import all middlewares
import {
  authenticateUser,
  validateRequest,
  projectExists,
  hasProjectAuthorization,
  taskExists,
  hasTaskAuthorization,
  taskBelongsToProject,
  hasTeamAuthorization,
} from "@/middlewares";
// Import all validators
import { noteIdValidator, noteValidator } from "@/validators/note.validator";
import {
  projectIdValidator,
  projectValidator,
  taskIdValidator,
  taskStatusValidator,
  taskValidator,
} from "@/validators/project.validator";
import {
  emailValidator,
  idValidator,
  userIdValidator,
} from "@/validators/team.validator";

const router: Router = Router();

// Project routes
router.use(authenticateUser); // All routes below this line require authentication

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
  hasProjectAuthorization,
  projectValidator,
  validateRequest,
  ProjectController.updateProject,
);

// Delete a project
router.delete(
  "/:projectId",
  hasProjectAuthorization,
  ProjectController.deleteProject,
);

/** Routes for tasks **/

// Create a new task within a specific project
router.post(
  "/:projectId/tasks",
  hasTaskAuthorization,
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
  hasTaskAuthorization,
  taskIdValidator,
  taskValidator,
  validateRequest,
  TaskController.updateTask,
);

// Delete a specific task by ID within a specific project
router.delete(
  "/:projectId/tasks/:taskId",
  hasTaskAuthorization,
  taskIdValidator,
  validateRequest,
  TaskController.deleteTask,
);

// Update task status
router.post(
  "/:projectId/tasks/:taskId/status",
  taskIdValidator,
  taskStatusValidator,
  validateRequest,
  TaskController.updateTaskStatus,
);

/* Routes for teams */

// Get all team members of a project
router.get("/:projectId/team", TeamMemberController.getProjectTeam);

// Find a team member by email
router.post(
  "/:projectId/team/find",
  emailValidator,
  validateRequest,
  TeamMemberController.findMemberByEmail,
);

// Add a user to the project team by user ID
router.post(
  "/:projectId/team",
  hasTeamAuthorization,
  idValidator,
  validateRequest,
  TeamMemberController.addUserById,
);

// Remove a user from the project team by user ID
router.delete(
  "/:projectId/team/:userId",
  hasTeamAuthorization,
  userIdValidator,
  validateRequest,
  TeamMemberController.removeUserById,
);

/* Routes for notes */

// Create a note for a specific task within a project
router.post(
  "/:projectId/tasks/:taskId/notes",
  noteValidator,
  validateRequest,
  NoteController.createNote,
);

// Get all notes for a specific task within a project
router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);

// Edit a specific note by ID within a specific task and project
router.put(
  "/:projectId/tasks/:taskId/notes/:noteId",
  noteIdValidator,
  noteValidator,
  validateRequest,
  NoteController.editNote,
);

// Delete a specific note by ID within a specific task and project
router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  noteIdValidator,
  validateRequest,
  NoteController.deleteNote,
);

export default router;
