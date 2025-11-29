import type { CorsOptions } from "cors";

import { log, loggerFor, loggerForContext } from "@/lib/loggers";

let logger = loggerForContext(loggerFor("infra"), {
  component: "api",
});

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const whitelist = [process.env.FRONTEND_URL, "http://localhost:5173"]; // Includes localhost for development purposes

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      if (!origin && process.env.NODE_ENV === "development")
        return callback(null, true);
      callback(null, false);
      log(
        logger,
        "warn",
        "CORS origin denied",
        {
          status: "fail",
        },
        { origin },
      );
    }
  },
  credentials: true,
};
