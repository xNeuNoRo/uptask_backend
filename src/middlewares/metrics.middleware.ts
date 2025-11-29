import type { NextFunction, Request, Response } from "express";
import { Counter, type Registry } from "prom-client";

import prometheusRegistry from "@/config/metrics";

declare global {
  namespace Express {
    interface Request {
      metrics: {
        registry: Registry;
        counters: {
          userSignups: Counter;
        };
      };
    }
  }
}

const userSignups = new Counter({
  name: "user_signups_total",
  help: "Total number of user signups",
  registers: [prometheusRegistry],
});

export const metrics = (req: Request, _res: Response, next: NextFunction) => {
  req.metrics = {
    registry: prometheusRegistry,
    counters: {
      userSignups,
    },
  };

  next();
};
