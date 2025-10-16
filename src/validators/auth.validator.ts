import { body, param } from "express-validator";

export const emailValidator = [
  body("email").isEmail().withMessage("El email no es válido"),
];

export const passwordValidator = [
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

export const registerValidator = [
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  ...emailValidator,
  ...passwordValidator,
];

export const tokenValidator = [
  body("token").notEmpty().withMessage("El token es obligatorio"),
];

export const changePassValidator = [
  param("token").isNumeric().withMessage("Token no válido"),
  ...passwordValidator,
];

export const loginValidator = [
  body("email").isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("El password es obligatorio"),
  body("remember").isBoolean().withMessage("El campo 'remember' no es válido"),
];
