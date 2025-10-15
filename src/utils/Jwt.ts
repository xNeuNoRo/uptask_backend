import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const expiresType = {
  access: parseInt(process.env.ACCESS_TTL!),
  refresh_short: parseInt(process.env.REFRESH_TTL_SHORT!),
  refresh_long: parseInt(process.env.REFRESH_TTL_LONG!),
} as const;

const secret = process.env.JWT_SECRET;

type UserPayload = {
  user_id: Types.ObjectId;
};

export class JwtUtils {
  static generateToken(
    payload: UserPayload,
    expire: keyof typeof expiresType,
  ): string {
    return jwt.sign(payload, secret!, {
      expiresIn: expiresType[expire],
    });
  }

  static verifyToken(token: string): UserPayload {
    return jwt.verify(token, secret!) as UserPayload;
  }
}
