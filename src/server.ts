import "dotenv/config";
import { createApp } from "@/app";
import { connectDB } from "@/config/db";
import { log, loggerFor, loggerForContext } from "@/lib/loggers";

const logger = loggerForContext(loggerFor("infra"), { component: "api" });

async function initApp() {
  const start = Date.now();
  try {
    // Connect to the database
    await connectDB();

    // Create the Express application
    const app = createApp();
    const port = process.env.PORT || 4000;

    // Start the server
    app.listen(port, () => {
      log(logger, "info", `REST API running on port ${port}`, {
        status: "success",
        operation: "start",
        durationMs: Date.now() - start,
      });
    });
  } catch (err) {
    log(
      logger,
      "fatal",
      "Failed to start application",
      {
        status: "fail",
        operation: "start",
        durationMs: Date.now() - start,
      },
      { err },
    );
    process.exit(1);
  }
}

// Start the application
void initApp();
