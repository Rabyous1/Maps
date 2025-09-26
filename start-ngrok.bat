@echo off
echo Démarrage de Pentabell Maps avec ngrok...

echo Arrêt des conteneurs existants...
docker-compose down

echo Démarrage des services...
docker-compose up -d

echo Attente du démarrage des services...
timeout /t 10

echo Services démarrés!
echo Interface ngrok: http://localhost:4040
echo Consultez les URLs publiques sur l'interface ngrok

pause