# AroRano - IoT Device Management & Monitoring Platform

A modern **full-stack IoT application** built with **Next.js** (frontend) and **NestJS** (backend) for managing and monitoring IoT devices and sensor data.

## 🎯 Features

- ✅ IoT Device Management (Create, Read, Update, Delete)
- ✅ Sensor Data Collection and Storage
- ✅ Device Monitoring Dashboard
- ✅ Real-time Device Statistics
- ✅ **WebSocket Real-Time Data Streaming** 🚀
- ✅ **Malagasy dataset scraping and export**
- ✅ **Reservoir fill command from the dashboard**
- ✅ PostgreSQL Database Integration
- ✅ TypeORM ORM Support
- ✅ RESTful API with Swagger Documentation
- ✅ CORS Enabled for Development
- ✅ Type-Safe Frontend & Backend (TypeScript)

## 🧰 Matériel utilisé

Le système IoT réel d'AroRano utilise les composants suivants :

- Capteur de pluie
- Buzzer
- LED rouge, verte et jaune
- Pompe à eau
- Relais 1 canal
- ESP32
- DHT22
- Bouton poussoir
- Capteur ultrason
- Écran LCD

Ces éléments permettent de mesurer l'état du réservoir, d'afficher les informations locales et de déclencher les actions physiques (pompe, alertes, indication visuelle).

## 📐 Architecture

```
AroRano/
├── frontend/              # Next.js + React Application
│   ├── pages/
│   │   ├── index.tsx      # Welcome page
│   │   └── dashboard.tsx  # IoT monitoring dashboard
│   ├── lib/
│   │   └── api.ts         # API client with device endpoints
│   └── package.json
│
├── backend/               # NestJS API Server
│   ├── src/
│   │   ├── main.ts        # Entry point with Swagger setup
│   │   ├── app.module.ts  # Main module with TypeORM
│   │   └── devices/       # Device management module
│   │       ├── device.entity.ts
│   │       ├── sensor-reading.entity.ts
│   │       ├── devices.service.ts
│   │       ├── devices.controller.ts
│   │       ├── devices.module.ts
│   │       └── dto/
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (or use Docker)
- npm/yarn/pnpm

### 1. Setup Database (PostgreSQL)

**Option A: Local PostgreSQL**
```bash
# Create database
createdb arorano_iot
```

**Option B: Docker**
```bash
docker run --name postgres-iot -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=arorano_iot -p 5432:5432 -d postgres:15
```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install --legacy-peer-deps
```

### 3. Configure Environment

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=arorano_iot
```

**Frontend (.env.local):**
```bash
cp frontend/.env.example frontend/.env.local
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

## � Docker Setup

### Prerequisites
- Docker & Docker Compose installed
- No need for local Node.js or PostgreSQL installation

### Quick Start with Docker

**1. Create `.env` file:**
```bash
cp .env.example .env
```

**2. Build and run all services:**
```bash
# Production mode (includes frontend, backend, and PostgreSQL)
docker-compose up --build

# Development mode (only PostgreSQL, run Node locally)
docker-compose -f docker-compose.dev.yml up
```

**3. Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- PostgreSQL: localhost:5432

### Reservoir Fill Command

Use the dashboard to send a fill command to a reservoir device.

- `POST /api/esp32/devices/:deviceId/fill` - queue a fill reservoir command
- `GET /api/esp32/devices/:deviceId/commands/latest` - read the latest command
- `GET /api/esp32/devices/:deviceId/commands` - list command history

The command is broadcast over Socket.IO as `esp32Command`, so the dashboard can update immediately.

### Docker Commands

```bash
# View running containers
docker ps

# View logs for a service
docker-compose logs backend
docker-compose logs frontend

# Stop all services
docker-compose down

# Remove volumes (including database data)
docker-compose down -v

# Rebuild services after dependency changes
docker-compose up --build

# Run specific service
docker-compose up backend

# Execute command in running container
docker exec arorano-backend npm run seed
```

### Environment Variables for Docker

Edit `.env` to customize:
```env
DB_USERNAME=arorano
DB_PASSWORD=arorano_password
DB_NAME=arorano
DB_PORT=5432
```

### Production Deployment

```bash
# Build images with production tag
docker build -t arorano-backend:latest ./backend
docker build -t arorano-frontend:latest ./frontend

# Push to registry (e.g., Docker Hub)
docker tag arorano-backend:latest username/arorano-backend:latest
docker push username/arorano-backend:latest

# Deploy using docker-compose.yml
docker-compose up -d
```

### Render Deployment

To deploy only the backend and database on Render, create these two resources manually:

1. A Postgres instance for the database.
2. A Web Service for the NestJS backend.

Recommended backend settings:

- Root directory: `backend`
- Build command: `npm install --legacy-peer-deps --include=dev && npm run build`
- Start command: `npm run start:prod`
- Environment variables:
  - `NODE_ENV=production`
  - `DATABASE_URL` from your Render Postgres connection string, such as the one you provided
  - `JWT_SECRET` generated by Render
  - `HOST=0.0.0.0` if you want to set it explicitly

Optional environment variables:

- `CORS_ORIGINS` if you will call the backend from another frontend
- `FRONTEND_URL` if you want the API root response to point to a public frontend URL

The backend already supports `DATABASE_URL`, so it can connect to Render Postgres without any code changes during deploy. For Render Postgres, keep the connection string in `DATABASE_URL` and leave the local `DB_*` variables unset on the deployed service.

## �🔗 Access Points

- **Frontend:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard
- **API Root:** http://localhost:3001/api
- **API Docs:** http://localhost:3001/api/docs (Swagger UI)
- **Health Check:** http://localhost:3001/api/health
- **ESP32 Ingest:** `http://YOUR_PC_IP:3001/api/esp32/data`

## ESP32 On Local Network

To let the ESP32 send data to this backend over Wi-Fi:

1. Run the backend so it listens on `0.0.0.0`.
2. Use your computer's Wi-Fi IPv4 address as the ESP32 target host.
3. Post sensor data to `http://YOUR_PC_IP:3001/api/esp32/data`.

Example on this machine:

```text
http://192.168.88.16:3001/api/esp32/data
```

The ESP32 and this computer must be on the same Wi-Fi network, and Windows Firewall must allow inbound TCP traffic on port `3001`.

## Scraper Module

The backend also includes a dataset scraping module for building Malagasy translation corpora.

- `POST /api/scraper/jobs` - create and start a scraping job
- `GET /api/scraper/jobs` - list scraping jobs
- `GET /api/scraper/entries` - view dataset entries
- `POST /api/scraper/entries` - add a manual translation example
- `GET /api/scraper/export?format=json|csv|jsonl` - export the dataset

The frontend scraper workspace is available at `http://localhost:3000/scraper`.

## 📡 API Endpoints

### Devices
- `GET /api/devices` - Get all devices
- `POST /api/devices` - Create device
- `GET /api/devices/:id` - Get device by ID
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/:id/stats` - Get device statistics
- `POST /api/devices/:id/readings` - Add sensor reading
- `GET /api/devices/:id/readings` - Get sensor readings

### Example: Create Device
```bash
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Living Room Temp",
    "type": "temperature",
    "location": "Living Room",
    "status": "active"
  }'
```

### Example: Add Sensor Reading
```bash
curl -X POST http://localhost:3001/api/devices/{deviceId}/readings \
  -H "Content-Type: application/json" \
  -d '{
    "value": 22.5,
    "unit": "°C"
  }'
```

## 📊 Database Schema

### Devices Table
- `id` - UUID (Primary Key)
- `name` - Device name
- `type` - Device type (temperature, humidity, motion, etc.)
- `location` - Device location
- `status` - Device status (active, inactive, error)
- `metadata` - JSON metadata
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Sensor Readings Table
- `id` - UUID (Primary Key)
- `deviceId` - Device FK
- `value` - Sensor reading value
- `unit` - Measurement unit (°C, %, RPM, etc.)
- `timestamp` - Reading timestamp

## 🔌 WebSocket Real-Time Streaming

The platform uses WebSockets for instant sensor data updates:

### Live Features
- 📡 **Real-Time Sensor Data**: Stream sensor readings instantly to connected clients
- 🔄 **Auto-Subscribe**: Automatically subscribe to device data
- 📊 **Live Statistics**: Watch min/max/average update in real-time
- 🆕 **Device Events**: Get notified when devices are created/updated/deleted
- 🔗 **Automatic Reconnection**: Handles disconnections gracefully

### Quick Test
```bash
# Add a sensor reading and watch the dashboard update in real-time
curl -X POST http://localhost:3001/api/devices/{DEVICE_ID}/readings \
  -H "Content-Type: application/json" \
  -d '{"value": 22.5, "unit": "°C"}'
```

For detailed testing guide, see [WEBSOCKET_TESTING.md](WEBSOCKET_TESTING.md)

## 🛠️ Available Scripts

### Backend
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run debug    # Start in debug mode
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🔐 Environment Variables

### Backend
- `NODE_ENV` - Environment (development, production)
- `PORT` - Server port
- `DATABASE_URL` - Hosted Postgres connection string, preferred on Render
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 📚 Project Structure

### Backend Structure
- **Entities:** Device and SensorReading models
- **Services:** Business logic for device management
- **Controllers:** API endpoints
- **DTOs:** Data transfer objects for validation
- **Modules:** Organized feature modules

### Frontend Structure
- **Pages:** Next.js pages (index, dashboard)
- **Components:** Reusable React components
- **Lib:** API client and utilities
- **Styles:** Inline styles (can be moved to CSS modules)

## 🚀 Production Deployment

### Backend
```bash
npm install
npm run build
NODE_ENV=production npm start
```

### Frontend
```bash
npm install
npm run build
npm start
```

## 🐛 Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check connection credentials in `.env`
- Ensure database exists

### Port Already in Use
- Backend: `lsof -i :3001` or `netstat -ano | findstr :3001` (Windows)
- Frontend: `lsof -i :3000` or `netstat -ano | findstr :3000` (Windows)

### CORS Errors
- Ensure backend CORS is configured with frontend URL
- Check `FRONTEND_URL` in backend `.env`

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Swagger/OpenAPI](https://swagger.io)

## 📝 License

UNLICENSED

## 🤝 Contributing

Feel free to extend this project with:
- User authentication (JWT, OAuth)
- Advanced analytics and reporting
- Device groups and hierarchies
- Alert and notification system
- Mobile app integration
- Grafana/Prometheus integration
- Time-series data optimization (InfluxDB)
- Multi-tenant support
