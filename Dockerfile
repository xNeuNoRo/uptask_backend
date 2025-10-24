# Agregar el agente que se encargara de enviar las metricas a Grafana Cloud
FROM grafana/agent:latest AS agent

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
FROM node:22 AS runner

# Directorio principal
WORKDIR /app

# Copiar dependencias
COPY package*.json pnpm-lock.yaml ./

# Instalar pnpm y dependencias
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod --config.approve-builds=true

# Copiamos la app compilada de JS del builder
COPY --from=builder /app/dist ./dist

# Copiar el agente para enviar metricas
COPY --from=agent /usr/bin/grafana-agent /usr/local/bin/grafana-agent

# Copiar el archivo de configuracion del agente
COPY agent.yaml ./agent.yaml

# Puerto del servidor
EXPOSE 4000

# Comandos de arranque
CMD ["sh", "-c", "grafana-agent -config.expand-env --config.file=./agent.yaml & pnpm run build:start"]