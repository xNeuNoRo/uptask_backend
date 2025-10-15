import fs from "fs";
import path from "path";
import crypto from "crypto";

// Pasar siempre el path del src de primero y el de out de segundo
const [srcArg = "src/public/raw", outArg = "src/public/assets"] =
  process.argv.slice(2);
const SRC = path.resolve(srcArg);
const OUT = path.resolve(outArg);
const manifest: Record<string, string> = {}; // Esto tendra el mapeo del nombre del archivo normal al hasheado

function hashFile(filePath: string) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
}

function hashAll(dir: string) {
  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name);

    // Comprobacion para iterar recursivamente si es directorio
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      hashAll(fullPath);
      continue;
    }

    // Si termina en html,env,DS_Store,map no me interesa hashearlos
    if (
      name.endsWith(".html") ||
      name.endsWith(".env") ||
      name === ".DS_Store" ||
      name.endsWith(".map")
    )
      continue;

    // Calcula la ruta relativa
    // Ej: SRC = "/proyecto/public" y full = "/proyecto/public/css/app.css"
    // Devolveria => "css/app.css", basicamente el extra con respecto a SRC
    const relative = path.relative(SRC, fullPath).replace(/\\/g, "/"); // Normalizar reemplazando "\" a "/"
    const fileExtension = path.extname(name);
    const fileBasename = path.basename(name, fileExtension);
    // Literalmente hashear el contenido y recortarlo a 8 caracteres
    const hashedPath = hashFile(fullPath); // De esa forma, aseguramos q cada nuevo archivo tenga hash unico dependiendo de su buffer
    const hashedName = `${fileBasename}.${hashedPath}${fileExtension}`;

    // Copiamos el archivo alla
    const outDir = path.join(OUT, path.dirname(relative)); // Ej: public/assets/css
    fs.mkdirSync(outDir, { recursive: true }); // Creamos todas las carpetas recursivamente similar a todo como este en /raw

    const destDir = path.join(outDir, hashedName); // Salida + el nombre hasheado
    fs.copyFileSync(fullPath, destDir);

    // Lo guardamos en el manifest, reemplazando el nombre original por el hasheado
    manifest[relative] = relative.replace(name, hashedName); // "css/app.css" => "css/app.3f1a9c2b.css"
  }
}

// Hasheamos todo en SRC
hashAll(SRC);
// Guardamos el manifest
fs.writeFileSync(
  path.join(OUT, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  `[HASH_STATIC]: Se convirtieron en hash todos los archivos de ${SRC} exitosamente.`,
);
console.log(
  `[HASH_STATIC]: Se genero exitosamente el manifiesto con ${Object.keys(manifest).length} entradas`,
);
