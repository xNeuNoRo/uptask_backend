import { existsSync } from "fs";
import { execSync } from "child_process";
import readline from "readline";

// Funciones de color
const dim = (text) => `\x1b[2m${text}\x1b[0m`; // Gris oscuro / separadores
const cyan = (text) => `\x1b[36m${text}\x1b[0m`; // Etapas / info
const green = (text) => `\x1b[32m${text}\x1b[0m`; // Éxito
const yellow = (text) => `\x1b[33m${text}\x1b[0m`; // Advertencia
const red = (text) => `\x1b[31m${text}\x1b[0m`; // Error

function run(command) {
  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

function hasGitRepo() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function hasHusky() {
  return existsSync(".husky");
}

async function setupHusky() {
  if (!hasHusky() || !hasGitRepo()) {
    console.log(dim("\n───────────────────────────────\n"));
    const answer = await ask(
      yellow(
        "⚠️ No se ha detectado configuraciones de Husky, ¿Deseas configurarlo automaticamente? (y/n)   ",
      ),
    );
    console.log(
      yellow(
        "OJO: Se creara automaticamente un repositorio git si no tenias uno previo.\n",
      ),
    );

    if (answer.toLowerCase() === "y") {
      if (!hasGitRepo()) {
        console.log(
          cyan(
            "🔹 No se ha encontrado repositorio Git. Inicializando uno nuevo...",
          ),
        );
        execSync("git init", { stdio: "inherit" });
      } else {
        console.log(cyan("🔹 Se ha detectado un repositorio git."));
      }

      if (!hasHusky()) {
        console.log(
          cyan("🔹 Configurando Husky para chequear cada commit/push...\n\n"),
        );
        execSync("pnpm dlx husky-init", { stdio: "inherit" });
        execSync("pnpm install", { stdio: "inherit" });
        execSync('npx husky add .husky/pre-commit "pnpm lint-staged"', {
          stdio: "inherit",
        });
        console.log(green("\n\n✅ Husky configurado correctamente."));
      } else {
        console.log(green("✅ Husky ya estaba configurado previamente."));
      }
    }
  }
}

async function main() {
  // 1️⃣ Typecheck
  console.log(dim("1️⃣   Typecheck"));
  console.log(dim("───────────────────────────────"));
  console.log(
    cyan(
      "🔹 [Typecheck]: Verificando que todo el codigo sea valido y este listo para compilar...",
    ),
  );
  if (!run("pnpm --silent run typecheck")) {
    const answer = await ask(
      red(
        "❌ [Typecheck]: Se ha detectado errores en tu codigo. Continuar de todos modos? (y/n) ",
      ),
    );
    if (answer.toLowerCase() !== "y") process.exit(1);
  } else
    console.log(
      green(
        "✅ [Typecheck]: No se han detectado errores al simular una compilacion.",
      ),
    );

  // 2️⃣ ESLint
  console.log(dim("\n2️⃣   ESLint"));
  console.log(dim("───────────────────────────────"));
  console.log(
    cyan(
      "🔹 [ESLint]: Analizando código para errores, malas prácticas y estilo de código...",
    ),
  );
  if (!run("pnpm --silent run lint")) {
    const answer = await ask(
      red(
        "❌ [ESLint]: Se detectaron problemas de estilo o errores. ¿Quieres intentar arreglar automáticamente con lint:fix? (y/n) ",
      ),
    );
    if (answer.toLowerCase() === "y") {
      if (!run("pnpm --silent run lint:fix")) {
        console.error(
          red(
            "❌ [ESLint]: No se pudieron corregir todos los problemas. Corrige los errores manualmente.",
          ),
        );
        process.exit(1);
      } else {
        console.log(
          green(
            "✅ [ESLint]: Todos los problemas de estilo y errores fueron corregidos automáticamente.",
          ),
        );
      }
    } else {
      process.exit(1);
    }
  } else
    console.log(
      green(
        "✅ [ESLint]: No se detectaron errores de sintaxis, problemas de buenas prácticas ni problemas de estilo.",
      ) + yellow("\n👉 Si deseas corregir todos los warning's posibles ejecuta `pnpm run lint:fix`"),
    );

  // 3️⃣ Prettier check
  console.log(dim("\n3️⃣   Prettier check"));
  console.log(dim("───────────────────────────────"));
  console.log(
    cyan(
      "🔹 [Prettier]: Verificando formato de código según las reglas definidas...\n",
    ),
  );
  if (!run("pnpm --silent run format")) {
    const answer = await ask(
      yellow(
        "⚠️ [Prettier]: Se encontraron problemas segun el formato especificado en 'prettier.config.cjs'. ¿Deseas intentar corregirlos automáticamente? (y/n) ",
      ),
    );
    if (answer.toLowerCase() === "y") {
      if (!run("pnpm --silent run format:fix")) {
        console.error(
          red(
            "❌ [Prettier]: No se pudieron corregir todos los archivos. Corrigelos manualmente.",
          ),
        );
        process.exit(1);
      } else {
        console.log(
          green("✅ [Prettier]: Archivos formateados automáticamente."),
        );
      }
    } else {
      process.exit(1);
    }
  } else {
    console.log(
      green(
        "\n✅ [Prettier]: Formato de código correcto. No se detectaron problemas.",
      ),
    );
  }

  // 4️⃣ Build
  console.log(dim("\n4️⃣   Build"));
  console.log(dim("───────────────────────────────"));
  const answer = await ask(
    cyan("🔹 [Build]: ¿Deseas compilar el proyecto ahora mismo? (y/n) "),
  );
  if (answer.toLowerCase() === "y") {
    console.log(cyan("🔹 [Build]: Compilando TypeScript a JavaScript..."));
    if (!run("pnpm --silent run build")) {
      console.error(
        red(
          "❌ [Build] La compilación falló. Corrige los errores antes de continuar.",
        ),
      );
      process.exit(1);
    } else
      console.log(
        green(
          "✅ [Build]: Compilación exitosa. Todos los archivos fueron generados en /dist",
        ),
      );
  }

  console.log(
    green(
      "\n🎉 Todo tu codigo se encuentra en perfecto estado para realizar un commit/push!",
    ),
  );

  if (!hasHusky()) setupHusky();
}

main();
