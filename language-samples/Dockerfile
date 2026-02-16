# Dockerfile sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

FROM node:18-alpine AS builder

LABEL maintainer="barbrickdesign@gmail.com"
LABEL description="BarbrickDesign Language Samples"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Run application
CMD ["node", "dist/index.js"]
