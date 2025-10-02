export const ERRORS = {
  NOT_FOUND: { http: 404, msg: "Ruta no encontrada." },
  INTERNAL: { http: 500, msg: "Error interno del servidor." },
  PROJECT_NOT_FOUND: { http: 404, msg: "Proyecto no encontrado." },
  TASK_NOT_FOUND: { http: 404, msg: "Tarea no encontrada." },
  DB_CONSULT_ERROR: { http: 503, msg: "Error consultando la base de datos." },
} as const;
