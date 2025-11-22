# server/Dockerfile

# Use an official Node.js 18 image as the base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app/server

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your server code
COPY . .

# Your server runs on port 5000 (adjust if different)
EXPOSE 3000

# The command to start your server
CMD [ "npm", "run", "server" ]