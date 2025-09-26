#!/bin/bash

# Script de déploiement vers Nexus Repository

# Variables
NEXUS_URL="http://localhost:8081"
NEXUS_USER="admin"
NEXUS_PASS="admin123"
REPOSITORY="docker-hosted"

# Build des images Docker
echo "Building Docker images..."
docker-compose build

# Tag des images pour Nexus
echo "Tagging images for Nexus..."
docker tag pentabell-server:latest localhost:8081/pentabell-server:latest
docker tag pentabell-client:latest localhost:8081/pentabell-client:latest

# Push vers Nexus
echo "Pushing images to Nexus..."
docker push localhost:8081/pentabell-server:latest
docker push localhost:8081/pentabell-client:latest

echo "Deployment to Nexus completed!"