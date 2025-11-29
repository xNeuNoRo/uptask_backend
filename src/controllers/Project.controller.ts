import type { Request, Response } from "express";

import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import Project, { type ProjectDTO } from "@/models/Project.model";
import { AppError } from "@/utils";

let logger = loggerForContext(loggerFor("infra"), {
  entityType: "user",
  entityTarget: "project",
  component: "controller",
});

export class ProjectController {
  static createProject = async (
    req: Request<
      {},
      {},
      Pick<ProjectDTO, "projectName" | "clientName" | "description">
    >,
    res: Response,
  ) => {
    const start = Date.now();
    const project = new Project(req.body);
    project.manager = req.user!.id;

    try {
      await project.save();
      res.success(null, 201);
      log(logger, "info", `Project created with ID: ${project.id}`, {
        entityId: req.user!.id.toString(),
        entityTargetId: project.id.toString(),
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

  static getAllProjects = async (req: Request, res: Response) => {
    const start = Date.now();
    try {
      const projects = await Project.find({
        // $or operator to include projects where the user is a collaborator too
        $or: [
          { manager: { $in: req.user!.id } },
          { team: { $in: req.user!.id } },
        ],
      });
      res.success(projects);
      log(logger, "info", `Fetched all projects`, {
        entityId: req.user!.id.toString(),
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
          entityId: req.user!.id.toString(),
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
      // Ensure the user is the manager of the project
      // or return 404 to avoid leaking project existence
      if (
        req.project.manager!.toString() !== req.user!.id.toString() &&
        !req.project.team.includes(req.user!.id)
      )
        throw new AppError("PROJECT_NOT_FOUND");

      res.success(req.project);
      log(
        logger,
        "info",
        `Fetched project with ID: ${req.project.id.toString()}`,
        {
          entityId: req.user!.id.toString(),
          entityTargetId: req.project.id.toString(),
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
          entityId: req.user!.id.toString(),
          entityTargetId: req.project.id.toString(),
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
    req: Request<{}, {}, ProjectDTO>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      // Ensure the user is the manager of the project
      // or return 404 to avoid leaking project existence
      if (req.project.manager!.toString() !== req.user!.id.toString())
        throw new AppError("PROJECT_NOT_FOUND");

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
          entityId: req.user!.id.toString(),
          entityTargetId: req.project.id.toString(),
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
          entityId: req.user!.id.toString(),
          entityTargetId: req.project.id.toString(),
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
      // Ensure the user is the manager of the project
      // or return 404 to avoid leaking project existence
      if (req.project.manager!.toString() !== req.user!.id.toString())
        throw new AppError("PROJECT_NOT_FOUND");

      await req.project.deleteOne();
      res.success(null, 204);
      log(
        logger,
        "info",
        `Deleted project with ID: ${req.project.id.toString()}`,
        {
          entityId: req.user!.id.toString(),
          entityTargetId: req.project.id.toString(),
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
          entityId: req.user!.id.toString(),
          entityTargetId: req.project.id.toString(),
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
