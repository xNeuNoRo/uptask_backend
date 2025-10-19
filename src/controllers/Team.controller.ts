import { Request, Response } from "express";
import User, { UserDTO } from "@/models/User.model";
import { AppError } from "@/utils";
import { log, loggerFor, loggerForContext } from "@/lib/loggers";

const logger = loggerForContext(loggerFor("team"), {
  component: "controller",
  entityType: "teamMember",
});

export class TeamMemberController {
  static async getProjectTeam(req: Request, res: Response) {
    const start = Date.now();
    try {
      await req.project.populate({ path: "team", select: "id name email" });
      log(
        logger,
        "info",
        `User ${req.user?.id} fetched team members for project ID: ${req.project.id}`,
        {
          entityId: req.project.id,
          operation: "list",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
      res.success({ team: req.project.team }, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error fetching team members for project ID: ${req.project.id}`,
        {
          entityId: req.project.id,
          operation: "list",
          status: "fail",
          durationMs: Date.now() - start,
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  }

  static async findMemberByEmail(
    req: Request<{}, {}, Pick<UserDTO, "email">>,
    res: Response,
  ) {
    const start = Date.now();
    const { email } = req.body;

    try {
      const user = await User.findOne({ email }).select("id name email");
      if (!user) throw new AppError("USER_NOT_FOUND");

      log(
        logger,
        "info",
        `User ${req.user?.id} found user by email: ${email}`,
        {
          entityId: user.id,
          operation: "read",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
      res.success({ user }, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error finding user by email: ${email}`,
        {
          operation: "read",
          status: "fail",
          durationMs: Date.now() - start,
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  }

  static async addUserById(
    req: Request<{}, {}, { id: string }>,
    res: Response,
  ) {
    const start = Date.now();
    const { id } = req.body;

    try {
      if (id === req.project.manager!.toString())
        throw new AppError("CANNOT_ADD_MANAGER_TO_TEAM");

      if (req.project.team!.some((team) => team?.toString() === id))
        throw new AppError("USER_ALREADY_IN_TEAM");

      const user = await User.findById(id).select("id");
      if (!user) throw new AppError("USER_NOT_FOUND");

      log(
        logger,
        "info",
        `User ${req.user?.id} added user ID: ${id} to project ID: ${req.project.id}`,
        {
          entityId: id,
          entityTargetId: req.project.id,
          operation: "create",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
      req.project.team.push(user.id);
      await req.project.save();
      res.success({ project: req.project }, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error adding user ID: ${id} to project ID: ${req.project.id}`,
        {
          entityTargetId: req.project.id,
          operation: "create",
          status: "fail",
          durationMs: Date.now() - start,
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  }

  static async removeUserById(req: Request<{ userId: string }>, res: Response) {
    const start = Date.now();
    const { userId } = req.params;

    try {
      if (!req.project.team!.some((team) => team?.toString() === userId))
        throw new AppError("USER_NOT_IN_TEAM");

      req.project.team = req.project.team.filter(
        (team) => team?.toString() !== userId,
      );
      await req.project.save();

      log(
        logger,
        "info",
        `User ${req.user?.id} removed user ID: ${userId} from project ID: ${req.project.id}`,
        {
          entityId: userId,
          entityTargetId: req.project.id,
          operation: "delete",
          status: "success",
          durationMs: Date.now() - start,
        },
      );
      res.success(null, 204);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error removing user ID: ${userId} from project ID: ${req.project.id}`,
        {
          entityTargetId: req.project.id,
          operation: "delete",
          status: "fail",
          durationMs: Date.now() - start,
          errorCode: "DB_CONSULT_ERROR",
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  }
}
