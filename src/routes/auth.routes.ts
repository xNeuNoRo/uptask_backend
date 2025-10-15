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

router.post(
  "/register",
  registerValidator,
  validateRequest,
  AuthController.createAccount,
);

router.post(
  "/request-code",
  emailValidator,
  validateRequest,
  AuthController.requestConfirmationCode,
);

router.post(
  "/confirm",
  tokenValidator,
  validateRequest,
  AuthController.confirmAccount,
);

router.post(
  "/forgot-password",
  emailValidator,
  validateRequest,
  AuthController.forgotPassword,
);

router.post(
  "/validate-token",
  tokenValidator,
  validateRequest,
  AuthController.validateToken,
);

router.post(
  "/update-password/:token",
  changePassValidator,
  validateRequest,
  AuthController.updatePasswordWithToken,
);

router.post("/login", loginValidator, validateRequest, AuthController.login);

export default router;
