import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isTesting = process.env.NODE_ENV === "test";

export const logger = isProduction
  ? pino({
      level: "debug",
      transport: {
        targets: [
          {
            target: "pino-loki",
            options: {
              host: process.env.GRAFANA_LOKI_URL!,
              basicAuth: {
                username: process.env.GRAFANA_LOKI_STACK_ID!,
                password: process.env.GRAFANA_TOKEN!,
              },
              batching: true,
              interval: 5,
              labels: { app: "p10-uptask-server" },
            },
            level: "info",
          },
        ],
      },
    })
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
