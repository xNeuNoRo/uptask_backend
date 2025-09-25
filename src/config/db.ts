import mongoose from "mongoose";
import { red, green, bold } from "colorette";

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DB_URI!);
    console.log(
      bold(
        green(
          `MongoDB connected to: \"${connection.name}\" database successfully\n[${connection.host}:${connection.port}]`,
        ),
      ),
    );
  } catch (err) {
    console.log(red("An error occurred while trying to connect to MongoDB"));
    console.log(err);
    process.exit(1);
  }
};
