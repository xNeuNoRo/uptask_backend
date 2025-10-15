import { AuthController } from "@/controllers/Auth.controller";
import { validateRequest } from "@/middlewares";
import {
  loginValidator,
  registerValidator,
  emailValidator,
  tokenValidator,
  passwordValidator,
  changePassValidator,
} from "@/validators/auth.validator";
import { Router } from "express";

const router: Router = Router();

// Create a new account
router.post(
  "/register",
  registerValidator,
  validateRequest,
  AuthController.createAccount,
);

// Request account confirmation code
router.post(
  "/request-code",
  emailValidator,
  validateRequest,
  AuthController.requestConfirmationCode,
);

// Confirm account using token
router.post(
  "/confirm",
  tokenValidator,
  validateRequest,
  AuthController.confirmAccount,
);

// Request password reset instructions
router.post(
  "/forgot-password",
  emailValidator,
  validateRequest,
  AuthController.forgotPassword,
);

// Validate password reset token
router.post(
  "/validate-token",
  tokenValidator,
  validateRequest,
  AuthController.validateToken,
);

// Update password using reset token
router.post(
  "/update-password/:token",
  changePassValidator,
  validateRequest,
  AuthController.updatePasswordWithToken,
);

router.post("/login", loginValidator, validateRequest, AuthController.login);

export default router;
