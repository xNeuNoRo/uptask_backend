import crypto from "crypto";
import argon2 from "argon2";
import { HASH_PROFILE } from "@/config/argon";

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
}
