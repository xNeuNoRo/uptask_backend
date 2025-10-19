import type { Request, Response, NextFunction } from "express";

import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import Task, { type ITask } from "@/models/Task.model";
import { AppError } from "@/utils";

declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

const logger = loggerForContext(loggerFor("project"), {
  component: "db",
  entityType: "task",
});

export async function taskExists(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId);
    if (!task) throw new AppError("TASK_NOT_FOUND");
    req.task = task; // Attach task to request object
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    log(
      logger,
      "error",
      "Error validating task existence",
      {
        operation: "read",
        entityId: taskId,
        status: "fail",
        errorCode: "DB_CONSULT_ERROR",
      },
      { err },
    );
    throw new AppError("DB_CONSULT_ERROR");
  }
}

export async function taskBelongsToProject(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.task.project.toString() !== req.project.id.toString())
    throw new AppError("TASK_NOT_FOUND");
  next();
}

// Separate middleware to escalate to escalate the function if needed in the future
export async function hasTaskAuthorization(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.user?.id.toString() !== req.project.manager!.toString())
    throw new AppError("UNAUTHORIZED_ACTION");
  next();
}
