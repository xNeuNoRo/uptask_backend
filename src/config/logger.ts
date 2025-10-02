import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isTesting = process.env.NODE_ENV === "test";

export const logger = isProduction
  ? pino({ level: "info" })
  : pino({
      level: isTesting ? "silent" : "debug", // Silent during tests
      transport: {
        target: "pino-pretty", // Pretty print logs in non-production
        options: {
          singleLine: true, // Single line logs for better readability
          colorize: true, // Colorize the output
        },
      },
    });
