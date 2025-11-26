# ---------- build ----------
FROM node:20-slim AS build

# Carpeta de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código
COPY . .

# Crear la versión de producción
RUN npm run build


# ---------- runtime ----------
FROM nginx:1.27-alpine

# Copiar la build al servidor NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto de Nginx
EXPOSE 80

# Ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
