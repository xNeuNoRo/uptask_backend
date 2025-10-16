import { body } from "express-validator";

export const emailValidator = [
  body("email").isEmail().withMessage("El email no es válido"),
];

export const userIdValidator = [
  body("id").isMongoId().withMessage("ID de usuario no válido"),
];
