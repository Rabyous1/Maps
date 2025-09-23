# Dockerfile pour le serveur Pentabell Maps
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads logs dist

# Compiler TypeScript
RUN npm run build

# Exposer le port
EXPOSE 4000

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S pentabell -u 1001

# Changer la propriété des fichiers
RUN chown -R pentabell:nodejs /app
USER pentabell

# Commande de démarrage
CMD ["npm", "run", "start:prod"]