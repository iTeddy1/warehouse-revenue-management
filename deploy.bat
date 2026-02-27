@echo off
echo 🚀 Building and starting Money Management Application...

echo 🧹 Cleaning up existing containers...
docker-compose down

echo 🏗️ Building and starting services...
docker-compose up --build -d

echo 📋 Container Status:
docker-compose ps

echo 📝 Logs (press Ctrl+C to exit):
docker-compose logs -f
