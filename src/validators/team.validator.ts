import { body, param } from "express-validator";

export const emailValidator = [
  body("email").isEmail().withMessage("El email no es válido"),
];

export const idValidator = [
  body("id").isMongoId().withMessage("ID de usuario no válido"),
];

export const userIdValidator = [
  param("userId").isMongoId().withMessage("ID de usuario no válido"),
];
