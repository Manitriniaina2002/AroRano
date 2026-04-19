@echo off
REM AroRano Backend Setup Script for Windows
REM Run this to initialize the system with all IoT devices

setlocal enabledelayedexpansion

echo.
echo 🚀 AroRano Backend Setup Script
echo ================================
echo.

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed or not in PATH
    exit /b 1
)

echo 1️⃣ Checking Docker containers...
docker-compose ps | findstr "arorano-backend"
if errorlevel 1 (
    echo ❌ Docker containers not running!
    echo Run: docker-compose up -d
    exit /b 1
)

echo ✅ Docker containers are running
echo.

REM Run seed script
echo 2️⃣ Seeding database with IoT devices...
docker-compose exec -T backend npm run seed

if errorlevel 1 (
    echo ❌ Seeding failed!
    exit /b 1
)

echo.
echo ✨ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Get device IDs: curl http://localhost:3001/api/devices
echo 2. Update ESP32 code with device IDs from step 1
echo 3. Flash ESP32 and power on
echo 4. Open dashboard: http://localhost:3000/dashboard
echo.
echo 🔧 Useful commands:
echo - View logs: docker-compose logs -f backend
echo - Reset database: docker-compose down -v ^&^& docker-compose up -d
echo - Send test reading: curl -X POST http://localhost:3001/api/devices/{id}/readings -H "Content-Type: application/json" -d "{\"value\": 45.5, \"unit\": \"cm\"}"
