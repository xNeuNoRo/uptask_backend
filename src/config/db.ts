import mongoose from "mongoose";

import { log, loggerFor, loggerForContext } from "@/lib/loggers";

const logger = loggerForContext(loggerFor("infra"), { component: "db" });

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DB_URI!);
    log(
      logger,
      "info",
      `MongoDB connected to \"${connection.name}\" database successfully`,
      {
        status: "success",
      },
    );
  } catch (err) {
    log(
      logger,
      "fatal",
      "MongoDB connection error",
      {
        status: "fail",
      },
      { err },
    );
    process.exit(1);
  }
};
