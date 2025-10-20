import { Request, Response } from "express";
import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import { AppError, AuthUtils, JwtUtils } from "@/utils";
import User, { UserDTO } from "@/models/User.model";
import Token, { TokenDTO } from "@/models/Token.model";
import { sendVerificationEmail } from "@/emails/builders/Verification.builder";
import { sendChangePassEmail } from "@/emails/builders/ChangePass.builder";
import { sendChangeEmailCodeEmail } from "@/emails/builders/ChangeEmail.builder";

let logger = loggerForContext(loggerFor("auth"), {
  entityType: "user",
  component: "controller",
});

export class AuthController {
  static createAccount = async (
    req: Request<{}, {}, Pick<UserDTO, "email" | "password">>,
    res: Response,
  ) => {
    const start = Date.now();
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

      log(logger, "info", "User created with ID: " + user.id, {
        entityId: user.id.toString(),
        operation: "create",
        status: "success",
        durationMs: Date.now() - start,
      });
      res.success(null, 201);

      sendVerificationEmail({
        to: user.email,
        verificationLink: `${process.env.FRONTEND_URL}/auth/confirm`,
        sixDigitCode,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error creating user account",
        {
          operation: "create",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static requestConfirmationCode = async (
    req: Request<{}, {}, Pick<UserDTO, "email">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) throw new AppError("USER_NOT_FOUND");
      if (user.confirmed) throw new AppError("USER_ALREADY_CONFIRMED");

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

      log(logger, "info", "Verification code sent to user ID: " + user.id, {
        entityId: user.id.toString(),
        operation: "create",
        status: "success",
        durationMs: Date.now() - start,
      });
      res.success(null, 200);

      sendVerificationEmail({
        to: user.email,
        verificationLink: `${process.env.FRONTEND_URL}/auth/confirm`,
        sixDigitCode,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error sending verification code",
        {
          operation: "create",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static forgotPassword = async (
    req: Request<{}, {}, Pick<UserDTO, "email">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) throw new AppError("USER_NOT_FOUND");
      if (!user.confirmed) throw new AppError("USER_NOT_CONFIRMED");

      // Delete all resetPassword tokens for this user
      await Token.deleteMany({
        user: user.id,
        type: "resetPassword",
      });

      const sixDigitCode = AuthUtils.generate6DigitToken();
      const token = new Token({
        token: sixDigitCode,
        type: "resetPassword",
        user: user.id,
        expiresAt: Date.now() + 1800000, // 30 minutes
      });
      await token.save();

      log(logger, "info", "Password reset code sent to user ID: " + user.id, {
        entityId: user.id.toString(),
        operation: "send",
        status: "success",
        durationMs: Date.now() - start,
      });
      res.success(null, 200);

      sendChangePassEmail({
        to: user.email,
        name: user.name,
        changePassLink: `${process.env.FRONTEND_URL}/auth/new-password`,
        sixDigitCode,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error sending change password instructions",
        {
          operation: "send",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static confirmAccount = async (
    req: Request<{}, {}, Pick<TokenDTO, "token">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({
        token,
        type: "verifyEmail",
      });
      if (!tokenExists) throw new AppError("INVALID_TOKEN");

      const user = await User.findById(tokenExists.user);
      if (!user) throw new AppError("USER_NOT_FOUND");
      user.confirmed = true;
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      log(logger, "info", "User confirmed account with ID: " + user.id, {
        entityId: user.id.toString(),
        operation: "update",
        status: "success",
        durationMs: Date.now() - start,
      });
      res.success(null, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error confirming account",
        {
          operation: "update",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static validateToken = async (
    req: Request<{}, {}, Pick<TokenDTO, "token">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({
        token,
      });
      if (!tokenExists) throw new AppError("INVALID_TOKEN");

      log(logger, "info", "Token validated for user ID: " + tokenExists.user, {
        entityId: tokenExists.user.toString(),
        operation: "read",
        status: "success",
        durationMs: Date.now() - start,
      });
      res.success(null, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error validating token",
        {
          operation: "read",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static updatePasswordWithToken = async (
    req: Request<Pick<TokenDTO, "token">, {}, Pick<UserDTO, "password">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { token } = req.params;
      const { password } = req.body;
      const tokenExists = await Token.findOne({
        token,
      });
      if (!tokenExists) throw new AppError("INVALID_TOKEN");

      const user = await User.findById(tokenExists.user);
      if (!user) throw new AppError("USER_NOT_FOUND");

      user.password = await AuthUtils.hashPassword(password);
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      log(logger, "info", "User updated password with ID: " + user.id, {
        entityId: user.id.toString(),
        operation: "update",
        status: "success",
        durationMs: Date.now() - start,
      });
      res.success(null, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error updating password with token",
        {
          operation: "update",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static login = async (
    req: Request<
      {},
      {},
      Pick<UserDTO, "email" | "password"> & { remember: boolean }
    >,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { email, password, remember } = req.body;

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
          verificationLink: `${process.env.FRONTEND_URL}/auth/confirm`,
          sixDigitCode,
        });

        throw new AppError("USER_NOT_CONFIRMED");
      }

      const isValidPassword = await AuthUtils.verifyPassword(
        user.password,
        password,
      );
      if (!isValidPassword) throw new AppError("INVALID_CREDENTIALS");

      const accessToken = JwtUtils.generateToken(
        { user_id: user.id, type: "access" },
        "access",
      );

      const refreshTTL = remember ? "refresh_long" : "refresh_short";
      const refreshToken = JwtUtils.generateToken(
        { user_id: user.id, type: refreshTTL },
        refreshTTL,
      );

      AuthUtils.setAuthCookie(req, res, refreshToken, remember);
      log(logger, "info", "User logged in with ID: " + user.id, {
        entityId: user.id.toString(),
        operation: "read",
        status: "success",
        durationMs: Date.now() - start,
      });
      res.success({ accessToken }, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error during login attempt",
        {
          operation: "read",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static refreshToken = async (req: Request, res: Response) => {
    const start = Date.now();
    try {
      const token = req.cookies?.refresh_token;
      if (!token) throw new AppError("TOKEN_NOT_PROVIDED");

      const decoded = JwtUtils.verifyToken(token);
      if (!decoded || !decoded.user_id) throw new AppError("INVALID_TOKEN");

      const user = await User.findById(decoded.user_id).select("_id");
      if (!user) throw new AppError("USER_NOT_FOUND");

      const accessToken = JwtUtils.generateToken(
        { user_id: user.id, type: "access" },
        "access",
      );
      const refreshToken = JwtUtils.generateToken(
        { user_id: user.id, type: decoded.type },
        decoded.type ?? "refresh_short",
      );

      AuthUtils.setAuthCookie(
        req,
        res,
        refreshToken,
        decoded.remember ?? false,
      );
      log(logger, "info", "Refreshed tokens for user ID: " + user.id, {
        entityId: user.id.toString(),
        operation: "read",
        status: "success",
      });
      res.success({ accessToken }, 200);
    } catch (err) {
      AuthUtils.clearAuthCookie(req, res);
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        "Error refreshing access token",
        {
          operation: "read",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static logout = async (req: Request, res: Response) => {
    AuthUtils.clearAuthCookie(req, res);
    log(logger, "info", "User logged out with ID: " + req.user?.id, {
      entityId: req.user?.id.toString(),
      operation: "delete",
      status: "success",
    });
    res.success(null, 200);
  };

  static getUser = async (req: Request, res: Response) => {
    log(logger, "info", "Fetched authenticated user info", {
      entityId: req.user?.id.toString(),
      operation: "read",
      status: "success",
    });
    res.success({ user: req.user }, 200);
  };

  static updateProfile = async (
    req: Request<{}, {}, Pick<UserDTO, "name" | "email">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { name, email } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists && userExists.id !== req.user!.id)
        throw new AppError("USER_ALREADY_EXISTS");

      req.user!.name = name;
      await req.user!.save();

      log(logger, "info", "Updated user profile with ID: " + req.user?.id, {
        entityId: req.user?.id.toString(),
        operation: "update",
        status: "success",
        durationMs: Date.now() - start,
      });

      res.success({ user: req.user }, 200);

      // Only send change email code if the email has changed
      if (email !== req.user!.email) {
        // Delete all changeEmail tokens for this user
        await Token.deleteMany({
          user: req.user?.id,
          type: "changeEmail",
        });

        const sixDigitCode = AuthUtils.generate6DigitToken();
        const token = new Token({
          token: sixDigitCode,
          type: "changeEmail",
          user: req.user?.id,
          expiresAt: Date.now() + 1800000, // 30 minutes
        });
        await token.save();

        sendChangeEmailCodeEmail({
          to: email,
          name: req.user!.name,
          sixDigitCode,
        });

        log(
          logger,
          "info",
          `Sent change email code to ${email} for user ID: ${req.user?.id}`,
          {
            entityId: req.user?.id.toString(),
            operation: "send",
            status: "success",
            durationMs: Date.now() - start,
          },
        );
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error updating user profile with ID: ${req.user?.id}`,
        {
          operation: "update",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static updateEmail = async (
    req: Request<Pick<TokenDTO, "token">, {}, Pick<UserDTO, "email">>,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { token } = req.params;
      const { email } = req.body;

      const tokenExists = await Token.findOne({
        token,
      });
      if (!tokenExists) throw new AppError("INVALID_TOKEN");

      req.user!.email = email;
      await Promise.allSettled([req.user!.save(), tokenExists.deleteOne()]);

      log(logger, "info", "Updated user email with ID: " + req.user?.id, {
        entityId: req.user?.id.toString(),
        operation: "update",
        status: "success",
        durationMs: Date.now() - start,
      });

      res.success({ user: req.user }, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error updating user email with ID: ${req.user?.id}`,
        {
          operation: "update",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };

  static updateCurrentUserPassword = async (
    req: Request<
      {},
      {},
      {
        currentPassword: UserDTO["password"];
        password: UserDTO["password"];
      }
    >,
    res: Response,
  ) => {
    const start = Date.now();
    try {
      const { currentPassword, password } = req.body;

      const user = await User.findById(req.user!.id);
      if (!user) throw new AppError("USER_NOT_FOUND");

      const isValidPassword = await AuthUtils.verifyPassword(
        user.password,
        currentPassword,
      );
      if (!isValidPassword) throw new AppError("INVALID_CURRENT_PASSWORD");

      user.password = await AuthUtils.hashPassword(password);
      await user.save();

      log(logger, "info", `Updated password for user ID: ${req.user?.id}`, {
        entityId: req.user!.id.toString(),
        operation: "update",
        status: "success",
        durationMs: Date.now() - start,
      });

      res.success(null, 200);
    } catch (err) {
      if (err instanceof AppError) throw err;
      log(
        logger,
        "error",
        `Error updating password for user ID: ${req.user?.id}`,
        {
          operation: "update",
          status: "fail",
          errorCode: "DB_CONSULT_ERROR",
          durationMs: Date.now() - start,
        },
        { err },
      );
      throw new AppError("DB_CONSULT_ERROR");
    }
  };
}
