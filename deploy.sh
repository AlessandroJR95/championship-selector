cd champion-selector-deploy
docker volume create --name=front-assets
docker-compose down
docker-compose up