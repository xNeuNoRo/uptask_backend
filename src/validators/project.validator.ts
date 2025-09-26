import { check, param } from "express-validator";

export const projectValidator = [
  check("projectName").notEmpty().withMessage("Project name is required"),
  check("clientName").notEmpty().withMessage("Client name is required"),
  check("description").notEmpty().withMessage("Description is required"),
];

export const projectIdValidator = [
  param("id").isMongoId().withMessage("ID de proyecto inválido"),
];
