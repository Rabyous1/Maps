FROM node:22-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm config set strict-ssl false && \
    npm install --legacy-peer-deps --no-audit

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads logs dist

# Compiler TypeScript
RUN npm run build

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pentabell -u 1001

# Changer la propriété des fichiers
RUN chown -R pentabell:nodejs /app
USER pentabell

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
