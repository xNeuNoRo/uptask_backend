import type { Request, Response } from "express";

import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import Project, { type ProjectDTO } from "@/models/project.model";
import { AppError } from "@/utils";

let logger = loggerForContext(loggerFor("infra"), {
  entityType: "project",
  component: "controller",
});

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const start = Date.now();
    const project = new Project(req.body);
    try {
      await project.save();
      res.success(null, 201);
      log(logger, "info", `Project created with ID: ${project.id}`, {
        entityId: project.id,
        operation: "create",
        status: "success",
        durationMs: Date.now() - start,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error creating project",
        {
          operation: "create",
          durationMs: Date.now() - start,
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static getAllProjects = async (_req: Request, res: Response) => {
    const start = Date.now();
    try {
      const projects = await Project.find();
      res.success(projects);
      log(logger, "info", "Fetched all projects", {
        operation: "list",
        status: "success",
        durationMs: Date.now() - start,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error fetching projects",
        {
          operation: "list",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    const start = Date.now();
    try {
      res.success(req.project);
      log(
        logger,
        "info",
        `Fetched project with ID: ${req.project.id.toString()}`,
        {
          entityId: req.project.id.toString(),
          operation: "read",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error fetching project by ID",
        {
          entityId: req.project.id.toString(),
          operation: "read",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static updateProject = async (
    req: Request<{}, object, ProjectDTO>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      req.project.clientName = req.body.clientName;
      req.project.projectName = req.body.projectName;
      req.project.description = req.body.description;
      await req.project.save();
      res.success(req.project);
      log(
        logger,
        "info",
        `Updated project with ID: ${req.project.id.toString()}`,
        {
          entityId: req.project.id.toString(),
          operation: "update",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error updating project",
        {
          entityId: req.project.id.toString(),
          operation: "update",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    const start = Date.now();

    try {
      await req.project.deleteOne();
      res.success(null, 204);
      log(
        logger,
        "info",
        `Deleted project with ID: ${req.project.id.toString()}`,
        {
          entityId: req.project.id.toString(),
          operation: "delete",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error deleting project",
        {
          entityId: req.project.id.toString(),
          operation: "delete",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };
}
