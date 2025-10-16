import { Request, Response } from "express";
import User from "@/models/User.model";
import { AppError } from "@/utils";

export class TeamMemberController {
  static async getProjectTeam(req: Request, res: Response) {
    try {
      await req.project.populate({ path: "team", select: "id name email" });
      res.success({ team: req.project.team }, 200);
    } catch (err) {
      throw new AppError("DB_CONSULT_ERROR");
    }
  }

  static async findMemberByEmail(
    req: Request<{}, {}, { email: string }>,
    res: Response,
  ) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email }).select("id name email");
      if (!user) throw new AppError("USER_NOT_FOUND");
      res.success({ user }, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  }

  static async addUserById(
    req: Request<{}, {}, { id: string }>,
    res: Response,
  ) {
    const { id } = req.body;

    try {
      if (id === req.project.manager!.toString())
        throw new AppError("CANNOT_ADD_MANAGER_TO_TEAM");

      if (req.project.team!.some((team) => team?.toString() === id))
        throw new AppError("USER_ALREADY_IN_TEAM");

      const user = await User.findById(id).select("id");
      if (!user) throw new AppError("USER_NOT_FOUND");

      req.project.team.push(user.id);
      await req.project.save();
      res.success({ project: req.project }, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  }

  static async removeUserById(
    req: Request<{}, {}, { id: string }>,
    res: Response,
  ) {
    const { id } = req.body;

    try {
      if (!req.project.team!.some((team) => team?.toString() === id))
        throw new AppError("USER_NOT_IN_TEAM");

      req.project.team = req.project.team.filter(
        (team) => team?.toString() !== id,
      );
      await req.project.save();

      res.success(null, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  }
}
