FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies) for building
RUN npm ci && \
    npm cache clean --force

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Remove build dependencies and devDependencies
RUN npm prune --production && \
    apk del python3 make g++

# Expose port
EXPOSE 5000

# Health check (simple curl-based)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

# Set environment
ENV NODE_ENV=production
ENV RAILWAY_ENVIRONMENT_NAME=production

# Run application with increased timeout
CMD ["node", "--max-old-space-size=512", "dist/index.cjs"]
