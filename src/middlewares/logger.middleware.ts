import { randomUUID } from "crypto";
import pinoHttp, { type Options as PinoHttpOptions } from "pino-http";

import { logger as baseLogger } from "@/config/logger";

const isDev = process.env.NODE_ENV !== "production";

// Log only specific request/response properties
const serializers: NonNullable<PinoHttpOptions["serializers"]> = {
  req: (req) => ({
    id: req.id, // This is added by pino-http in the genReqId function
    method: req.method, // HTTP method
    url: req.url, // Request URL
    remoteAddress: req.socket?.remoteAddress, // Client IP address
    ...(isDev && {
      headers: req.headers, // Header information
      query: req.query, // Query parameters
    }),
  }),
  res: (res) => ({
    statusCode: res.statusCode, // HTTP status code
  }),
};

export const httpLogger = pinoHttp({
  logger: baseLogger,
  genReqId: (req) => req.headers["x-request-id"] || randomUUID(), // Use incoming request ID or generate a new one
  autoLogging: {
    ignore: (req) => ["/test"].includes(req.url ?? ""), // Disable logging for specific routes (e.g., health checks
  },
  serializers,
});
