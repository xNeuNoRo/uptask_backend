import crypto from "crypto";
import argon2 from "argon2";
import { HASH_PROFILE } from "@/config/argon";
import { CookieOptions, Request, Response } from "express";

export class AuthUtils {
  static async hashPassword(plain: string) {
    return argon2.hash(plain, HASH_PROFILE.options);
  }

  static async verifyPassword(hash: string, plain: string) {
    return argon2.verify(hash, plain);
  }

  static needsRehash(hash: string) {
    return argon2.needsRehash(hash, HASH_PROFILE.options);
  }

  static generate6DigitToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  static generateToken() {
    const token = crypto.randomBytes(32).toString("hex");
    const hash = this.hashToken(token);
    return { token, hash };
  }

  static setAuthCookie(
    _req: Request,
    res: Response,
    refreshToken: string,
    remember: boolean,
  ) {
    const exp = remember
      ? Number(process.env.REFRESH_TTL_LONG) * 1000
      : Number(process.env.REFRESH_TTL_SHORT) * 1000;

    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: exp,
      path: "/",
      partitioned: true,
    };

    return res.cookie("refresh_token", refreshToken, options);
  }

  static clearAuthCookie(_req: Request, res: Response) {
    return res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      partitioned: true,
    });
  }
}
