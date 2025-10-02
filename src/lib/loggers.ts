import type { Request } from "express";
import type { Logger, Bindings } from "pino";

import { logger as baseLogger } from "@/config/logger";
import type { ModuleName, LogContext } from "@/types/logger";

// Extend Express Request interface to include a log property
declare module "express" {
  interface Request {
    log?: Logger;
  }
}

// Create a map to cache loggers for different modules
const moduleCache = new Map<ModuleName, Logger>();

// Return a cached logger if it exists, otherwise create and cache a new one
// logger.child() creates a child logger with additional bindings/object properties
export function loggerFor(module: ModuleName): Logger {
  if (!moduleCache.has(module))
    moduleCache.set(module, baseLogger.child({ module }));

  return moduleCache.get(module)!;
}

// Merge request-specific info into the base logger's bindings
export function loggerForRequest(req: Request, base: Logger): Logger {
  const baseBindings: Bindings = base.bindings();
  return req?.log ? req.log.child(baseBindings) : base.child(baseBindings);
}

// Add context-specific info to a logger's bindings
export function loggerForContext(base: Logger, ctx: LogContext): Logger {
  return base.child(ctx);
}

// Combine all three: module-specific, request-specific, and context-specific
export function loggerForRequestContext(
  req: Request,
  module: ModuleName,
  ctx?: LogContext,
): Logger {
  const base = loggerFor(module);
  let logger = loggerForRequest(req, base);
  if (ctx) logger = loggerForContext(logger, ctx);
  return logger;
}

export function log(
  logger: Logger,
  method: "info" | "debug" | "warn" | "error" | "fatal",
  message: string,
  ctx: LogContext = {},
  extra: object = {},
) {
  switch (method) {
    case "info":
      return logger.info({ ...ctx, ...extra }, message);
    case "debug":
      return logger.debug({ ...ctx, ...extra }, message);
    case "warn":
      return logger.warn({ ...ctx, ...extra }, message);
    case "error":
      return logger.error({ ...ctx, ...extra }, message);
    case "fatal":
      return logger.fatal({ ...ctx, ...extra }, message);
  }
}
