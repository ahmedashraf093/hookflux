# Stage 1: Build the frontend
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Final image
FROM node:20-alpine
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache bash docker-cli curl git openssh-client

COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source and built frontend
COPY src/backend ./src/backend
COPY --from=build-stage /app/src/frontend/dist ./src/frontend/dist
COPY apps.json ./apps.json

# Create logs directory and set permissions
RUN mkdir -p logs && chmod 777 logs

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
