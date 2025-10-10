import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import { CorsOptions } from "cors";

let logger = loggerForContext(loggerFor("infra"), {
  component: "api",
});

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const whitelist = [process.env.FRONTEND_URL];

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
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
};
