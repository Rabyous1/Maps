#!/bin/bash

# Script de configuration ngrok

echo "Configuration de ngrok pour Pentabell Maps..."

# Vérifier si le token ngrok est fourni
if [ -z "$NGROK_AUTH_TOKEN" ]; then
    echo "Erreur: NGROK_AUTH_TOKEN non défini"
    echo "Obtenez votre token sur: https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
fi

# Remplacer le token dans le fichier de configuration
sed -i "s/YOUR_NGROK_AUTH_TOKEN/$NGROK_AUTH_TOKEN/g" ngrok.yml

echo "Configuration ngrok terminée!"
echo "Démarrez avec: docker-compose up -d"
echo "Interface ngrok: http://localhost:4040"