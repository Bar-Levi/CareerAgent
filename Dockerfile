# Stage 1: Build frontend
FROM node:16-alpine AS build-frontend
WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./ 
RUN npm install 

# Build the frontend
COPY frontend/ ./ 
RUN npm run build

# Stage 2: Setup backend
FROM node:16-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./ 
RUN npm install 

# Copy backend source code
COPY backend/ ./ 

# Copy built frontend assets into backend's public folder
COPY --from=build-frontend /app/frontend/build ./public

# Install nodemon globally for live reload
RUN npm install -g nodemon

# Expose backend port
EXPOSE 3001

# Use nodemon for hot reloading
CMD ["nodemon", "server.js"]
