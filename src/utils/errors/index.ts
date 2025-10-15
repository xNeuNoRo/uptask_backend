export const ERRORS = {
  NOT_FOUND: { http: 404, msg: "Ruta no encontrada" },
  INTERNAL: { http: 500, msg: "Error interno del servidor" },
  PROJECT_NOT_FOUND: { http: 404, msg: "Proyecto no encontrado" },
  TASK_NOT_FOUND: { http: 404, msg: "Tarea no encontrada" },
  DB_CONSULT_ERROR: { http: 503, msg: "Error consultando la base de datos" },
  USER_ALREADY_EXISTS: { http: 409, msg: "El usuario ya existe" },
  USER_ALREADY_CONFIRMED: {
    http: 403,
    msg: "Ese usuario ya se encuentra verificado",
  },
  USER_NOT_FOUND: { http: 404, msg: "Usuario no encontrado" },
  USER_NOT_CONFIRMED: {
    http: 403,
    msg: "Usuario no verificado. Se ha enviado un nuevo correo de verificacion, revisa tu bandeja de entrada",
  },
  ASSET_NOT_FOUND: { http: 404, msg: "Asset no encontrado" },
  TOKEN_NOT_FOUND: { http: 404, msg: "Token no encontrado" },
  TOKEN_NOT_PROVIDED: { http: 401, msg: "Token no proporcionado" },
  INVALID_TOKEN: { http: 401, msg: "Token inválido o expirado" },
  INVALID_CREDENTIALS: { http: 401, msg: "Credenciales inválidas" },
  UNATHORIZED: { http: 401, msg: "No autorizado" },
} as const;
