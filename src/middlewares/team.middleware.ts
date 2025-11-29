import type { Request, Response, NextFunction } from "express";

import { AppError } from "@/utils";

// Separate middleware to escalate to escalate the function if needed in the future
export async function hasTeamAuthorization(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.user?.id.toString() !== req.project.manager!.toString())
    throw new AppError("UNAUTHORIZED_ACTION");
  next();
}
