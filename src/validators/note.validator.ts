import { body, param } from "express-validator";

export const noteValidator = [
  body("content")
    .notEmpty()
    .withMessage("El contenido de la nota es obligatorio"),
];

export const noteIdValidator = [
  param("noteId").isMongoId().withMessage("El ID de la nota no es válido"),
];
