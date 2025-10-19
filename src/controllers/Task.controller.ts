import type { Request, Response } from "express";

import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import Task, { type TaskDTO } from "@/models/Task.model";
import { AppError } from "@/utils";
import { use } from "react";

const logger = loggerForContext(loggerFor("tasks"), {
  component: "controller",
  entityType: "task",
});

export class TaskController {
  static createTask = async (
    req: Request<object, object, Pick<TaskDTO, "name" | "description">>,
    res: Response,
  ) => {
    const start = Date.now();
    const { project } = req;
    try {
      const task = new Task(req.body);
      task.project = project.id;
      project.tasks.push(task.id);
      await Promise.allSettled([task.save(), project.save()]);
      res.success(null, 201);
      log(logger, "info", `Task created with ID: ${task.id}`, {
        entityId: task.id,
        operation: "create",
        status: "success",
        durationMs: Date.now() - start,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error creating task",
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

  static getProjectTasks = async (req: Request, res: Response) => {
    const start = Date.now();
    const { project } = req;
    try {
      const tasks = await Task.find({ project: project.id }).populate(
        "project", // We need pass the key of the schema to populate
      );
      res.success(tasks);
      log(logger, "info", `Fetched tasks for project ID: ${project.id}`, {
        entityId: project.id,
        operation: "list",
        status: "success",
        durationMs: Date.now() - start,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error fetching tasks",
        {
          operation: "list",
          durationMs: Date.now() - start,
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    const start = Date.now();
    try {
      const task = await Task.findById(req.task.id).populate({
        path: "changes.user",
        select: "_id name email",
      });
      res.success(task);
      log(logger, "info", `Fetched task with ID: ${req.task.id.toString()}`, {
        entityId: req.task.id.toString(),
        operation: "read",
        status: "success",
        durationMs: Date.now() - start,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error fetching task by ID",
        {
          entityId: req.task.id.toString(),
          operation: "read",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static updateTask = async (
    req: Request<{}, object, Pick<TaskDTO, "name" | "description">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      await req.task.save();
      res.success(req.task);
      log(logger, "info", `Updated task with ID: ${req.task.id}`, {
        entityId: req.task.id,
        operation: "update",
        status: "success",
        durationMs: Date.now() - start,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error updating task",
        {
          entityId: req.task.id,
          operation: "update",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    const start = Date.now();
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task?.toString() !== req.task.id.toString(),
      );
      Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.success(null, 204);
      log(logger, "info", `Deleted task with ID: ${req.task.id.toString()}`, {
        entityId: req.task.id.toString(),
        operation: "delete",
        status: "success",
        durationMs: Date.now() - start,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error deleting task",
        {
          entityId: req.task.id.toString(),
          operation: "delete",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static updateTaskStatus = async (
    req: Request<{}, object, { status: TaskDTO["status"] }>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { status } = req.body;
      req.task.status = status;

      const data = {
        user: req.user?.id,
        status,
        changedAt: new Date(),
      };
      req.task.changes.push(data);
      if (req.task.changes.length > 50) req.task.changes.shift();

      await req.task.save();
      res.success(req.task);
      log(
        logger,
        "info",
        `Updated status for task ID: ${req.task.id.toString()}`,
        {
          entityId: req.task.id.toString(),
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
        "Error updating task status",
        {
          entityId: req.task.id.toString(),
          operation: "update",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };
}
