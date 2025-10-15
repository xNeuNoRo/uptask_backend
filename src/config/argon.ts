export const HASH_PROFILE = {
  version: Number(process.env.HASH_VERSION), // Subir la version cuando cambie parametros
  options:
    process.env.NODE_ENV === "production"
      ? {
          // En prod: mucho mas seguro pero un poco mas lento
          memoryCost: Number(process.env.HASH_MEMORYCOST) * 1024, // 64 MiB
          timeCost: Number(process.env.HASH_TIMECOST),
          parallelism: Number(process.env.HASH_PARALLELISM),
        }
      : {
          // dev/test: config default (mucho mas rapido)
        },
} as const;
