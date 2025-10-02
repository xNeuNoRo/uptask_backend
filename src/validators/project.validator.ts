import { taskStatus } from "@/models/task.model";
import { check, param } from "express-validator";

export const projectValidator = [
  check("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  check("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  check("description").notEmpty().withMessage("La descripción es obligatoria"),
];

export const projectIdValidator = [
  param("projectId").isMongoId().withMessage("ID de proyecto inválido"),
];

export const taskValidator = [
  check("name").notEmpty().withMessage("El nombre de la tarea es obligatorio"),
  check("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
];

export const taskIdValidator = [
  param("taskId").isMongoId().withMessage("ID de tarea inválido"),
];

export const taskStatusValidator = [
  check("status")
    .notEmpty()
    .withMessage("El estado de la tarea es obligatorio")
    .isIn(Object.values(taskStatus))
    .withMessage(
      `Estado de tarea inválido, debe ser uno de: ${Object.values(taskStatus).join(", ")}`,
    ),
];
