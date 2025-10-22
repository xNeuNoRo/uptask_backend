# Instalar Node 22 completo para compilar luego
FROM node:22 AS builder

# Directorio principal
WORKDIR /app

# Copiar dependencias y el tsconfig
COPY package*.json pnpm-lock.yaml tsconfig.json ./

# Instalar pnpm y dependencias
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copiar el src al src local
COPY src ./src

# Compilar TS a JS
RUN pnpm run build

# Ahora si instalamos Node mas ligero para ejecucion
FROM node:22-alpine AS runner

# Directorio principal
WORKDIR /app

# Copiar dependencias
COPY package*.json pnpm-lock.yaml ./

# Instalar pnpm y dependencias
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod --config.approve-builds=true

# Copiamos la app compilada de JS del builder
COPY --from=builder /app/dist ./dist

# Puerto del servidor
EXPOSE 4000

# Comandos de arranque
CMD ["pnpm", "run", "build:start"]