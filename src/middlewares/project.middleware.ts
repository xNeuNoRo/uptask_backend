import type { Request, Response, NextFunction } from "express";

import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import Project, { type IProject } from "@/models/project.model";
import { AppError } from "@/utils";

declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

const logger = loggerForContext(loggerFor("project"), {
  component: "db",
  entityType: "project",
});

export async function projectExists(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new AppError("PROJECT_NOT_FOUND");
    req.project = project; // Attach project to request object
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    log(
      logger,
      "error",
      "Error validating project existence",
      {
        operation: "read",
        entityId: projectId,
        status: "fail",
        errorCode: "DB_CONSULT_ERROR",
      },
      { err },
    );
    throw new AppError("DB_CONSULT_ERROR");
  }
}
