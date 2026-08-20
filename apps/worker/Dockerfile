# Maxwell AU publishing worker.
# Build from the REPOSITORY ROOT:  docker build -f apps/worker/Dockerfile .

FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/azure/package.json packages/azure/package.json
COPY packages/social/package.json packages/social/package.json
RUN npm ci --ignore-scripts

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S worker -G nodejs

COPY --from=deps /repo/node_modules ./node_modules
COPY package.json ./
COPY apps/web/prisma ./apps/web/prisma
COPY apps/worker ./apps/worker
COPY packages ./packages

# Generate the Prisma client for this platform.
RUN npx prisma generate --schema apps/web/prisma/schema.prisma

USER worker
CMD ["npx", "tsx", "apps/worker/src/index.ts"]
