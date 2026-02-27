#!/bin/bash

echo "🚀 Building and starting Money Management Application..."

# Stop and remove existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down

# Build and start all services
echo "🏗️ Building and starting services..."
docker-compose up --build -d

echo "📋 Container Status:"
docker-compose ps

echo "📝 Logs (press Ctrl+C to exit):"
docker-compose logs -f
