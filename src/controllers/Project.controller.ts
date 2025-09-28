import Project from "@/models/project.model";
import { AppError } from "@/utils";
import { Request, Response } from "express";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
    try {
      await project.save();
      res.success(null, 201);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.log(err);
      throw new AppError("DB_CONSULT_ERROR");
    }
  };
  static getAllProjects = async (_req: Request, res: Response) => {
    try {
      const projects = await Project.find();
      res.success(projects);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.log(err);
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static getProjectById = async (
    req: Request<{ id: string }>,
    res: Response,
  ) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) throw new AppError("PROJECT_NOT_FOUND");
      res.success(project);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.log(err);
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static updateProject = async (
    req: Request<{ id: string }>,
    res: Response,
  ) => {
    const { id } = req.params;
    try {
      const project = await Project.findByIdAndUpdate(id, req.body);
      if (!project) throw new AppError("PROJECT_NOT_FOUND");
      await project.save();
      res.success(project);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.log(err);
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static deleteProject = async (
    req: Request<{ id: string }>,
    res: Response,
  ) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) throw new AppError("PROJECT_NOT_FOUND");
      await project.deleteOne();
      res.success(null, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.log(err);
      throw new AppError("DB_CONSULT_ERROR");
    }
  };
}
