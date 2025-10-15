import fs from "fs";
import path from "path";
import { ASSET_BASE_URL } from "@/emails/core/env.config";

const OUT = path.resolve("src/public/assets");

// Funcion para resolver del archivo sin hashear al hasheado usando el manifest
let cached: Record<string, string> | null = null;

export function asset(relativePath: string) {
  // Normalizar los "\" a "/"
  const key = relativePath.replace(/\\/g, "/");

  if (!cached) {
    const manifestPath = path.join(OUT, "manifest.json");
    cached = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
      : {};
  }
  // el "assets" ya lo incluye el manifest
  // p.ej: "css/app.css" → "/static/assets/css/app.3f1a9c2b.css"
  return new URL("/static/" + (cached![key] ?? key), ASSET_BASE_URL).href;
}
