# --- Build ---
FROM node:18 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# --- Serve ---
FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
