# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./
RUN npm ci

# Then copy the rest of the code
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Start Vite dev server
CMD ["npm", "run", "dev"]
