# Agregar el agente que se encargara de enviar las metricas a Grafana Cloud
FROM grafana/agent:latest AS agent

# Instalar Node 22 completo para compilar luego
FROM node:24 AS builder

# Directorio principal
WORKDIR /app

# Copiar dependencias y el tsconfig
COPY package*.json bun.lock tsconfig.json ./

# Instalar pnpm y dependencias
RUN npm install -g bun
RUN bun install --frozen-lockfile

# Copiar el src al src local
COPY src ./src

# Compilar TS a JS
RUN bun run build

# Ahora si instalamos Node mas ligero para ejecucion
FROM node:24 AS runner

# Directorio principal
WORKDIR /app

# Copiar dependencias
COPY package*.json bun.lock ./

# Instalar pnpm y dependencias
RUN npm install -g bun
RUN bun install --frozen-lockfile --production

# Copiamos la app compilada de JS del builder
COPY --from=builder /app/dist ./dist

# Copiar el agente para enviar metricas
COPY --from=agent /usr/bin/grafana-agent /usr/local/bin/grafana-agent

# Copiar el archivo de configuracion del agente
COPY agent.yaml ./agent.yaml

# Puerto del servidor
EXPOSE 4000

# Comandos de arranque
CMD ["sh", "-c", "grafana-agent -config.expand-env --config.file=./agent.yaml & bun run build:start"]