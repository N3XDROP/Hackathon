# ---------- build stage ----------
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

# Copiamos el código fuente
COPY . .

# Compilamos TypeScript a JavaScript
RUN npx tsc

# ---------- runtime stage ----------
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production

# Copiamos los archivos compilados (JavaScript) y dependencias
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

# Ejecutamos el código ya compilado
CMD ["node", "dist/index.js"]
