import { Request, Response } from "express";
import { loggerFor, loggerForContext } from "@/lib/loggers";
import { AppError, AuthUtils } from "@/utils";
import User from "@/models/User.model";
import Token from "@/models/Token.model";
import { sendVerificationEmail } from "@/emails/builders/Verification.builder";

// let logger = loggerForContext(loggerFor("auth"), {
//   entityType: "user",
//   component: "controller",
// });

export class AuthController {
  static createAccount = async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response,
  ) => {
    try {
      const { email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) throw new AppError("USER_ALREADY_EXISTS");

      const user = new User(req.body);
      user.password = await AuthUtils.hashPassword(password);

      const sixDigitCode = AuthUtils.generate6DigitToken();
      const token = new Token({
        token: sixDigitCode,
        type: "verifyEmail",
        user: user.id,
        expiresAt: Date.now() + 1800000, // 30 minutes
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.success(null, 201);

      // Simular de momento el correo verificado
      sendVerificationEmail({
        to: user.email,
        verificationLink: `${process.env.FRONTEND_URL}/confirm`,
        sixDigitCode,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static confirmAccount = async (
    req: Request<{}, {}, { token: string }>,
    res: Response,
  ) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({
        token,
        type: "verifyEmail",
      });
      if (!tokenExists) throw new AppError("TOKEN_NOT_FOUND");

      const user = await User.findById(tokenExists.user);
      if (!user) throw new AppError("USER_NOT_FOUND");
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.success(null, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static login = async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response,
  ) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) throw new AppError("USER_NOT_FOUND");
      if (!user.confirmed) {
        // Delete all verifyEmail tokens for this user
        await Token.deleteMany({
          user: user.id,
          type: "verifyEmail",
        });

        const sixDigitCode = AuthUtils.generate6DigitToken();
        const token = new Token({
          token: sixDigitCode,
          type: "verifyEmail",
          user: user.id,
          expiresAt: Date.now() + 1800000, // 30 minutes
        });
        await token.save();
        sendVerificationEmail({
          to: user.email,
          verificationLink: `${process.env.FRONTEND_URL}/confirm`,
          sixDigitCode,
        });

        throw new AppError("USER_NOT_CONFIRMED");
      }

      const isValidPassword = await AuthUtils.verifyPassword(
        user.password,
        password,
      );
      if (!isValidPassword) throw new AppError("INVALID_CREDENTIALS");
      res.success(null, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("DB_CONSULT_ERROR");
    }
  };
}
