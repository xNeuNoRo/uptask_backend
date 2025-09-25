import "dotenv/config";
import express, { type Express } from "express";
import { connectDB } from "./config/db";

void connectDB();
const app: Express = express();

export default app;
