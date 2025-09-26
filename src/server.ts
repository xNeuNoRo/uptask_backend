import { cyan, red, bold } from "colorette";
import { createApp } from "@/app";
import { connectDB } from "@/config/db";

async function initApp() {
  try {
    // Connect to the database
    await connectDB();

    // Create the Express application
    const app = createApp();
    const port = process.env.PORT || 4000;

    // Start the server
    app.listen(port, () => {
      console.log(bold(cyan(`[APP] REST API running on port ${port}`)));
    });
  } catch (err) {
    console.log(bold(red(`[APP ERROR]: ${(err as Error).message}`)));
    process.exit(1);
  }
}

// Start the application
void initApp();
