import User, { IUser } from "@/models/User.model";
import { AppError } from "@/utils";
import { JwtUtils } from "@/utils/Jwt";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

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
    throw new AppError("INVALID_TOKEN");
  }
};
