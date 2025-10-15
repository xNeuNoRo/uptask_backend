import { AuthController } from "@/controllers/Auth.controller";
import { validateRequest } from "@/middlewares";
import {
  loginValidator,
  registerValidator,
  requestCodeValidator,
  tokenValidator,
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
  requestCodeValidator,
  validateRequest,
  AuthController.requestConfirmationCode,
);

router.post(
  "/confirm",
  tokenValidator,
  validateRequest,
  AuthController.confirmAccount,
);

router.post("/login", loginValidator, validateRequest, AuthController.login);

export default router;
