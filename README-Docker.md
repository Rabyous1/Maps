# Docker Setup - Pentabell Maps

## 🐳 Architecture Docker

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80)    │    │  Client (3000)  │    │ Server (5000)   │
│  Reverse Proxy  │◄──►│   React App     │◄──►│   Node.js API   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Swagger (8080)  │    │ PostgreSQL      │    │   Redis (6379)  │
│ Documentation   │    │   (5432)        │    │     Cache       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Démarrage Rapide

### 1. Prérequis
```bash
# Installer Docker et Docker Compose
docker --version
docker-compose --version
```

### 2. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables selon vos besoins
nano .env
```

### 3. Lancement
```bash
# Construire et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

## 📋 Services Disponibles

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Application React |
| **API** | http://localhost:4000 | Backend Node.js |
| **PostgreSQL** | localhost:5432 | Base de données |

## 🔧 Commandes Utiles

### Gestion des Services
```bash
# Démarrer un service spécifique
docker-compose up server

# Redémarrer un service
docker-compose restart server

# Voir le statut des services
docker-compose ps

# Voir les logs d'un service
docker-compose logs server
```

### Base de Données
```bash
# Accéder à PostgreSQL
docker-compose exec postgres psql -U pentabell_user -d pentabell_maps

# Backup de la base
docker-compose exec postgres pg_dump -U pentabell_user pentabell_maps > backup.sql

# Restaurer la base
docker-compose exec -T postgres psql -U pentabell_user pentabell_maps < backup.sql
```

### Développement
```bash
# Reconstruire un service après modification
docker-compose build server
docker-compose up -d server

# Mode développement avec volumes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 🛠️ Configuration Avancée

### Variables d'Environnement
Modifiez le fichier `.env` pour personnaliser :
- Ports des services
- Credentials de base de données
- Configuration SMTP
- URLs et secrets

### Volumes Persistants
- `postgres_data` : Données PostgreSQL
- `redis_data` : Cache Redis
- `./server/uploads` : Fichiers uploadés
- `./server/logs` : Logs du serveur

### Réseau Docker
Tous les services communiquent via le réseau `pentabell-network`.

## 🔒 Sécurité

### Production
```bash
# Utiliser HTTPS
# Décommenter la section SSL dans nginx/nginx.conf
# Ajouter vos certificats dans nginx/ssl/

# Variables sensibles
# Changer JWT_SECRET et SESSION_SECRET
# Utiliser des mots de passe forts pour PostgreSQL
```

### Monitoring
```bash
# Health checks intégrés
docker-compose ps  # Voir l'état de santé

# Logs centralisés
docker-compose logs --tail=100 -f
```

## 🐛 Dépannage

### Problèmes Courants
```bash
# Port déjà utilisé
docker-compose down
sudo lsof -i :5000  # Vérifier les ports

# Problème de permissions
sudo chown -R $USER:$USER ./server/uploads

# Base de données non accessible
docker-compose restart postgres
docker-compose logs postgres
```

### Nettoyage
```bash
# Supprimer les containers
docker-compose down --volumes

# Nettoyer les images
docker system prune -a

# Supprimer les volumes
docker volume prune
```

## 📊 Monitoring et Logs

### Swagger Documentation
- URL : http://localhost:8080
- Fichier : `server/swagger.yaml`
- Auto-refresh lors des modifications

### Health Checks
- Server : http://localhost:5000/health
- Client : http://localhost:3000
- Vérifications automatiques toutes les 30s

### Logs Structurés
```bash
# Logs en temps réel
docker-compose logs -f server

# Logs avec timestamps
docker-compose logs -t server

# Filtrer les logs
docker-compose logs server | grep ERROR
```