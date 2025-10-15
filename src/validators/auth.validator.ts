import { body, param } from "express-validator";

export const registerValidator = [
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("El email no es válido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password debe ser de al menos 8 caracteres"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("El password de confirmacion es obligatorio")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Las contraseñas no coinciden");
      return true;
    }),
];

export const requestCodeValidator = [
  body("email").isEmail().withMessage("El email no es válido"),
];

export const tokenValidator = [
  body("token").notEmpty().withMessage("El token es obligatorio"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("El password es obligatorio"),
];
