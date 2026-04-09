# Docker Configuration & Deployment Guide

Complete Docker setup for AroRano IoT platform with production-ready configurations.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Environment Configuration](#environment-configuration)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## 🚀 Quick Start

### Minimum Requirements
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum (4GB recommended)
- 2GB free disk space

### One-Command Setup

```bash
# Clone and navigate to project
cd AroRano

# Create environment file
cp .env.example .env

# Start all services
docker-compose up --build
```

Wait for output:
```
✅ Application is running in production mode
📡 Local: http://localhost:3000
```

Then open: **http://localhost:3000**

---

## 🏗️ Architecture

### Service Topology

```
┌─────────────────────────────────────────┐
│         Docker Network (Bridge)         │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────┐    ┌────────────┐      │
│  │  Frontend  │    │  Backend   │      │
│  │  :3000     │◄──►│  :3001     │      │
│  └────────────┘    └────────────┘      │
│         ▲                  ▲            │
│         │                  │            │
│         └──────────────┬───┘            │
│                        │                │
│                   ┌────▼─────┐          │
│                   │ PostgreSQL│          │
│                   │  :5432    │          │
│                   └───────────┘          │
│                                         │
└─────────────────────────────────────────┘
```

### Services

| Service | Port | Purpose | Image |
|---------|------|---------|-------|
| **Frontend** | 3000 | Next.js web UI | node:20-alpine |
| **Backend** | 3001 | NestJS REST API | node:20-alpine |
| **Database** | 5432 | PostgreSQL data store | postgres:16-alpine |

---

## 🔧 Environment Configuration

### .env File

Create from template:
```bash
cp .env.example .env
```

**Available Variables:**

```env
# Database Configuration
DB_HOST=postgres              # Docker internal hostname
DB_PORT=5432                  # PostgreSQL port
DB_USERNAME=arorano           # Database user
DB_PASSWORD=arorano_password  # Database password
DB_NAME=arorano               # Database name

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000

# Backend
NODE_ENV=production
```

### Custom Configuration

```bash
# Example: Use external PostgreSQL
DB_HOST=db.example.com
DB_PORT=5432
DB_USERNAME=custom_user
DB_PASSWORD=secure_password
DB_NAME=iot_db

docker-compose up
```

---

## 💻 Development Setup

### Option 1: Full Docker (Recommended for Clean Environment)

```bash
# Start all services including PostgreSQL
docker-compose up --build

# Logs from all services
docker-compose logs -f

# Logs from specific service
docker-compose logs -f backend
```

### Option 2: Database + Local Development

Perfect if you want hot-reload on your machine:

```bash
# Start only PostgreSQL
docker-compose -f docker-compose.dev.yml up

# In another terminal, run locally
cd backend
npm install
npm run dev

# In yet another terminal
cd frontend
npm install
npm run dev
```

### Connect to Database Directly

```bash
# From host machine
psql -h localhost -U arorano -d arorano -p 5432

# Or use Docker
docker exec -it arorano-postgres psql -U arorano -d arorano

# Inside container
\dt              # List tables
\l               # List databases
```

---

## 🌐 Production Deployment

### Pre-Deployment Checklist

```bash
# 1. Test locally
docker-compose up

# 2. Verify health endpoints
curl http://localhost:3001/api/health
curl http://localhost:3000/

# 3. Test WebSocket
curl http://localhost:3001/

# 4. Check database connectivity
docker exec arorano-postgres pg_isready
```

### Build for Production

```bash
# 1. Build images
docker build -t arorano-backend:1.0.0 ./backend
docker build -t arorano-frontend:1.0.0 ./frontend

# 2. Tag for registry
docker tag arorano-backend:1.0.0 myregistry/arorano-backend:1.0.0
docker tag arorano-frontend:1.0.0 myregistry/arorano-frontend:1.0.0

# 3. Push to registry
docker push myregistry/arorano-backend:1.0.0
docker push myregistry/arorano-frontend:1.0.0
```

### Deploy on Server

```bash
# 1. SSH into server
ssh user@server.com

# 2. Clone repository
git clone https://github.com/user/arorano.git
cd arorano

# 3. Configure environment
nano .env
# Set production values and external database

# 4. Start services with restart policy
docker-compose up -d

# 5. Verify services
docker-compose ps
docker-compose logs
```

### Production Environment (.env)

```env
# Use external PostgreSQL (RDS, managed service, etc.)
DB_HOST=db.production.example.com
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=SECURE_PASSWORD_HERE
DB_NAME=arorano_production

# Frontend configuration
NEXT_PUBLIC_API_URL=https://api.example.com
FRONTEND_URL=https://example.com

# Backend
NODE_ENV=production
```

### Reverse Proxy Setup (Nginx)

```nginx
# /etc/nginx/sites-available/arorano

upstream backend {
    server arorano-backend:3001;
}

upstream frontend {
    server arorano-frontend:3000;
}

server {
    listen 80;
    server_name arorano.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name arorano.example.com;
    
    ssl_certificate /etc/letsencrypt/live/arorano.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arorano.example.com/privkey.pem;
    
    # API endpoints
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # WebSocket support
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
```

---

## 🔍 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs

# Inspect specific service
docker-compose logs backend

# Full error trace
docker-compose logs --tail=100
```

### Database Connection Issues

```bash
# 1. Verify PostgreSQL is running
docker ps | grep postgres

# 2. Check PostgreSQL health
docker-compose ps

# 3. Test connectivity from backend
docker exec arorano-backend \
  sh -c 'apt-get update && apt-get install -y postgresql-client && \
  psql -h postgres -U arorano -d arorano -c "SELECT 1"'

# 4. Check environment variables
docker exec arorano-backend env | grep DB_
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Change docker-compose port mapping
# Edit docker-compose.yml:
# ports:
#   - "3001:3001"  # Change to "3002:3001"
```

### Out of Memory

```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limits in Docker Desktop
# Settings → Resources → Memory: 4GB or more

# Or use memory limits in docker-compose.yml:
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 512m
  postgres:
    mem_limit: 1g
```

### WebSocket Connection Fails

```bash
# Verify WebSocket endpoint
curl -v http://localhost:3001/

# Check if socket.io is accessible
curl http://localhost:3001/socket.io/?transport=websocket

# Check browser console for CORS errors
# Add CORS headers to backend if needed
```

---

## 🎛️ Advanced Usage

### Health Checks

```bash
# All services
docker-compose ps

# Individual health check
docker-compose exec backend curl http://localhost:3001/api/health
```

### Database Backup

```bash
# Backup database
docker exec arorano-postgres pg_dump -U arorano -d arorano > backup.sql

# Restore database
cat backup.sql | docker exec -i arorano-postgres psql -U arorano -d arorano
```

### Scale Services (Load Balancing)

```yaml
# docker-compose.yml with scaling
services:
  backend:
    deploy:
      replicas: 3  # Run 3 instances
```

### Update Services

```bash
# Update image and restart
docker-compose pull
docker-compose up -d

# Or selective update
docker-compose up -d backend
```

### Cleanup

```bash
# Stop services
docker-compose down

# Remove volumes (deletes database)
docker-compose down -v

# Remove images
docker rmi arorano-backend arorano-frontend

# Full cleanup
docker system prune -a
```

---

## 📝 Docker Best Practices Used

✅ **Multi-stage builds** - Reduces image size  
✅ **Alpine Linux** - Lightweight base images  
✅ **Health checks** - Container liveness monitoring  
✅ **Signal handling** - Graceful shutdowns with dumb-init  
✅ **Non-root users** - Security best practice  
✅ **Production dependencies only** - Smaller runtime images  
✅ **Environment variables** - Easy configuration  
✅ **Restart policies** - Automatic recovery  

---

## 🔗 Related Documentation

- [README.md](README.md) - Project overview
- [WEBSOCKET_TESTING.md](WEBSOCKET_TESTING.md) - WebSocket testing guide
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
