export const ERRORS = {
  NOT_FOUND: { http: 404, msg: "Ruta no encontrada." },
  INTERNAL: { http: 500, msg: "Error interno del servidor." },
  PROJECT_NOT_FOUND: { http: 404, msg: "Proyecto no encontrado." },
  DB_CONSULT_ERROR: { http: 500, msg: "Error consultando la base de datos." },
} as const;
