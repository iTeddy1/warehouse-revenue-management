# ─────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first for optimal layer caching
COPY package*.json ./
COPY prisma ./prisma

# Install ALL deps (dev + prod) needed to compile TypeScript
RUN npm ci && npm cache clean --force

# Generate Prisma client before compiling
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Production image
# ─────────────────────────────────────────────
FROM node:20-alpine AS production

# Runtime tools: curl (healthcheck) + postgresql-client (pg_dump / psql for backup & restore)
RUN apk add --no-cache curl postgresql-client

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production manifests, then install prod deps
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production && npm cache clean --force

# Regenerate Prisma client for the production environment
RUN npx prisma generate

# Copy compiled output and startup script from builder
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./

# Fix line endings and make entrypoint executable
RUN dos2unix docker-entrypoint.sh && chmod +x docker-entrypoint.sh

# Create persistent data directories and assign ownership to appuser
RUN mkdir -p uploads backups && chown -R appuser:appgroup uploads backups

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]