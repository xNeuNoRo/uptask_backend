import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import User, { IUser } from "@/models/User.model";
import { AppError, JwtUtils } from "@/utils";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const logger = loggerForContext(loggerFor("auth"), {
  component: "api",
  entityType: "user",
});

export const authenticateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    throw new AppError("UNATHORIZED");

  const [, token] = authHeader.split(" ");
  if (!token) throw new AppError("TOKEN_NOT_PROVIDED");

  try {
    const decoded = JwtUtils.verifyToken(token);

    const user = await User.findById(decoded.user_id).select("_id name email");
    if (!user) throw new AppError("USER_NOT_FOUND");

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    log(
      logger,
      "error",
      "Error authenticating user",
      { operation: "read", status: "fail", errorCode: "INVALID_TOKEN" },
      { err },
    );
    throw new AppError("INVALID_TOKEN");
  }
};
