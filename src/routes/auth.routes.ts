import { AuthController } from "@/controllers/Auth.controller";
import { validateRequest } from "@/middlewares";
import { authenticateUser } from "@/middlewares/auth.middleware";
import {
  loginValidator,
  registerValidator,
  emailValidator,
  tokenValidator,
  passwordValidator,
  changePassTokenValidator,
  profileValidator,
  changePasswordValidator,
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
  changePassTokenValidator,
  validateRequest,
  AuthController.updatePasswordWithToken,
);

// Login to the application
router.post("/login", loginValidator, validateRequest, AuthController.login);

// Refresh access token
router.post("/refresh", AuthController.refreshToken);

// Logout from the application
router.post("/logout", AuthController.logout);

// Get authenticated user info
router.get("/user", authenticateUser, AuthController.getUser);

router.put(
  "/profile",
  authenticateUser,
  profileValidator,
  validateRequest,
  AuthController.updateProfile,
);

router.post(
  "/update-email/:token",
  authenticateUser,
  emailValidator,
  validateRequest,
  AuthController.updateEmail,
);

router.put(
  "/update-password",
  authenticateUser,
  changePasswordValidator,
  validateRequest,
  AuthController.updateCurrentUserPassword,
);

export default router;
