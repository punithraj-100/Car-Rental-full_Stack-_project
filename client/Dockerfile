# client/Dockerfile

# --- Build Stage ---
FROM node:22-alpine AS build

WORKDIR /app/client

COPY package*.json ./
RUN npm install

COPY . .
# This creates the optimized 'dist' folder
RUN npm run build

# --- Serve Stage ---
# Use a lightweight Nginx server
FROM nginx:stable-alpine

# Copy the built files from the 'build' stage to Nginx's public folder
COPY --from=build /app/client/dist /usr/share/nginx/html

# Copy your custom nginx config to replace the default one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on port 80 by default
EXPOSE 80

# Command to start the Nginx server
CMD ["nginx", "-g", "daemon off;"]