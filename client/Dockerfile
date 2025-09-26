<<<<<<< HEAD
# Dockerfile pour le client Pentabell Maps
FROM node:22-alpine as build
=======
# Dockerfile pour le client Pentabell Maps (Next.js)
FROM node:22-alpine AS base
>>>>>>> 7f49a31349d77d4c05153f0a0ea7088f48f03a5e

# Installer les dépendances seulement quand nécessaire
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installer les dépendances
<<<<<<< HEAD
RUN npm install --legacy-peer-deps --no-audit
=======
COPY package*.json ./
RUN npm config set strict-ssl false && \
    npm install --legacy-peer-deps --no-audit && \
    npm install emoji-mart @emoji-mart/data @emoji-mart/react --legacy-peer-deps
>>>>>>> 7f49a31349d77d4c05153f0a0ea7088f48f03a5e

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

<<<<<<< HEAD
# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
=======
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
>>>>>>> 7f49a31349d77d4c05153f0a0ea7088f48f03a5e
