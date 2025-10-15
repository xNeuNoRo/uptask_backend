import { taskStatus } from "@/models/Task.model";
import { body, param } from "express-validator";

export const projectValidator = [
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description").notEmpty().withMessage("La descripción es obligatoria"),
];

export const projectIdValidator = [
  param("projectId").isMongoId().withMessage("ID de proyecto inválido"),
];

export const taskValidator = [
  body("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
];

export const taskIdValidator = [
  param("taskId").isMongoId().withMessage("ID de tarea inválido"),
];

export const taskStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("El estado de la tarea es obligatorio")
    .isIn(Object.values(taskStatus))
    .withMessage(
      `Estado de tarea inválido, debe ser uno de: ${Object.values(taskStatus).join(", ")}`,
    ),
];
