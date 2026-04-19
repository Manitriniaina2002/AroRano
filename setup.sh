#!/bin/bash
# AroRano Backend Setup Script
# Run this to initialize the system with all IoT devices

set -e  # Exit on error

echo "🚀 AroRano Backend Setup Script"
echo "================================"
echo ""

# Check if docker-compose is running
echo "1️⃣ Checking Docker containers..."
docker-compose ps | grep -E "arorano-(backend|postgres)" || {
  echo "❌ Docker containers not running!"
  echo "Run: docker-compose up -d"
  exit 1
}

echo "✅ Docker containers are running"
echo ""

# Run database migrations
echo "2️⃣ Running database migrations..."
docker-compose exec -T backend npm run typeorm migration:run || {
  echo "⚠️  No pending migrations or migration error (this may be normal)"
}

echo "✅ Migrations completed"
echo ""

# Run seed script
echo "3️⃣ Seeding database with IoT devices..."
docker-compose exec -T backend npm run seed

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get device IDs: curl http://localhost:3001/api/devices"
echo "2. Update ESP32 code with device IDs from step 1"
echo "3. Flash ESP32 and power on"
echo "4. Open dashboard: http://localhost:3000/dashboard"
echo ""
echo "🔧 Useful commands:"
echo "- View logs: docker-compose logs -f backend"
echo "- Reset database: docker-compose down -v && docker-compose up -d"
echo "- Send test reading: curl -X POST http://localhost:3001/api/devices/{id}/readings -H 'Content-Type: application/json' -d '{\"value\": 45.5, \"unit\": \"cm\"}'"
