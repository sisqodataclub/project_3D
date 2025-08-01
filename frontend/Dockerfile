# Dockerfile
FROM node:18 AS build

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Build Tailwind & React app
RUN npm run build

# Production NGINX setup
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf


