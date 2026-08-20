# Maxwell AU web — multi-stage build for Azure Container Apps.
# Build from the REPOSITORY ROOT:  docker build -f apps/web/Dockerfile .

# --- deps: install the full workspace once ---------------------------------
FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/azure/package.json packages/azure/package.json
COPY packages/social/package.json packages/social/package.json
RUN npm ci --ignore-scripts

# --- build ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
# Prisma client for the runtime platform, then the standalone Next build.
RUN npx --workspace=@maxwellau/web prisma generate \
  && npm run build --workspace=@maxwellau/web

# --- runtime ----------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user per container hardening baseline.
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Standalone output contains the server and pruned node_modules.
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
