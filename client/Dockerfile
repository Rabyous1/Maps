# Dockerfile pour le client Pentabell Maps (Next.js)
FROM node:22-alpine AS base

# Installer les dépendances seulement quand nécessaire
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm config set strict-ssl false && \
    npm install --legacy-peer-deps --no-audit

# Rebuild le code source seulement quand nécessaire
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Installer sharp pour l'optimisation d'images
RUN npm install sharp

# Build Next.js
RUN npm run build

# Image de production, copier tous les fichiers et lancer next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copier les fichiers buildés
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]