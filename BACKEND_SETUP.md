# AroRano Backend - Real Data Collection Setup

## Overview

The AroRano backend is now fully configured to collect real-time sensor data from physical IoT devices connected to an ESP32 microcontroller. All devices from the water reservoir monitoring system are defined and ready to receive data.

## Device Types Configured

### Sensors
- **Capteur de pluie** (Rain Sensor) - `rainSensor`
  - Expected unit: `mm` (millimeters of rainfall)
  - GPIO Pin: ADC
  
- **Capteur Ultrasonic** (Ultrasonic Water Level) - `ultrasonic`
  - Expected unit: `cm` (centimeters)
  - Pins: GPIO 5 (trigger), GPIO 18 (echo)
  
- **DHT22** (Temperature & Humidity) - `dht22`
  - Expected units: `°C` (temperature), `%` (humidity)
  - GPIO Pin: GPIO 4

### Actuators & Indicators
- **Pompe à eau** (Water Pump) - `waterPump`
- **Relais 1 canal** (1-Channel Relay) - `relay`
- **Buzzer** - `buzzer`
- **LED rouge/vert/jaune** (RGB LED) - `ledRGB`
- **Écran LCD** (LCD Screen) - `lcdScreen`

### Control
- **Bouton poussoir** (Push Button) - `pushButton`

### Microcontroller
- **ESP32** - `esp32`

## Getting Started

### 1. Initialize Database with Devices

Run the seed script to populate the database with all devices:

```bash
cd backend
npm run seed
```

This will create all the devices listed above and populate them with sample data. You should see output like:

```
🌱 Seeding database with AroRano IoT devices...
✅ Created device: Capteur de pluie (rainSensor)
✅ Created device: Capteur Ultrasonic (ultrasonic)
✅ Created device: DHT22 (Temp/Humidité) (dht22)
...
✨ Seeding complete!
```

### 2. Retrieve Device IDs

After seeding, fetch the device list to get the device IDs needed for ESP32 integration:

```bash
curl http://localhost:3001/api/devices
```

This will return a JSON array with all devices and their UUIDs. Note down the device IDs for the sensors you'll use.

### 3. Configure ESP32

Update your ESP32 code with:
- WiFi credentials
- Backend URL (e.g., `http://192.168.X.X:3001`)
- Device IDs from step 2
- Pin configuration (see ESP32_INTEGRATION.md)

See `/backend/src/devices/ESP32_INTEGRATION.md` for complete Arduino code example.

## API Endpoints

### Get All Devices
```bash
GET /api/devices
```

Response:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Capteur Ultrasonic",
    "type": "ultrasonic",
    "location": "Réservoir d'eau",
    "status": "active",
    "metadata": {
      "trigPin": "GPIO_5",
      "echoPin": "GPIO_18",
      "unit": "cm"
    },
    "createdAt": "2026-04-18T10:00:00.000Z",
    "updatedAt": "2026-04-18T10:00:00.000Z"
  },
  ...
]
```

### Send Sensor Reading
```bash
POST /api/devices/{deviceId}/readings
Content-Type: application/json

{
  "value": 125.5,
  "unit": "cm"
}
```

Response:
```json
{
  "id": "reading-uuid",
  "deviceId": "device-uuid",
  "value": 125.5,
  "unit": "cm",
  "timestamp": "2026-04-18T10:30:00.000Z"
}
```

### Get Device Readings
```bash
GET /api/devices/{deviceId}/readings
```

Returns the last 100 readings for the device.

### Get Device Statistics
```bash
GET /api/devices/{deviceId}/stats
```

Response:
```json
{
  "average": 125.2,
  "min": 120.1,
  "max": 130.5,
  "latest": {
    "id": "reading-uuid",
    "deviceId": "device-uuid",
    "value": 125.5,
    "unit": "cm",
    "timestamp": "2026-04-18T10:30:00.000Z"
  }
}
```

## Data Flow

```
ESP32 (Sensors)
    ↓
    ↓ HTTP POST /api/devices/{id}/readings
    ↓
Backend NestJS API
    ↓
    ├─→ Database (PostgreSQL)
    └─→ WebSocket Gateway
         ↓
         ↓ Real-time event
         ↓
Frontend Dashboard
    ↓
Live Visualization
```

## Real-Time Updates

The backend uses WebSocket to push real-time sensor updates to the frontend dashboard. When the ESP32 sends new readings:

1. Backend receives POST request
2. Data is saved to database
3. WebSocket event is broadcast to all connected clients
4. Dashboard updates in real-time

## Monitoring & Troubleshooting

### Check Device Status
```bash
curl http://localhost:3001/api/devices/{deviceId}
```

### Verify ESP32 Connection
Monitor the backend logs:
```bash
docker-compose logs backend -f
```

### Test Sensor Reading Manually
```bash
curl -X POST http://localhost:3001/api/devices/{deviceId}/readings \
  -H "Content-Type: application/json" \
  -d '{"value": 45.5, "unit": "%"}'
```

### View Live Data on Dashboard
Navigate to: `http://localhost:3000/dashboard`

## Common Issues

### Device Not Found
- Verify device ID is correct: `GET /api/devices`
- Check device status is "active"
- Ensure backend is running: `docker-compose ps`

### No Data Appearing on Dashboard
- Check WebSocket connection status (green indicator on dashboard)
- Verify ESP32 has internet connectivity
- Monitor backend logs for errors
- Ensure readings are being sent to correct endpoint

### WiFi Connection Issues
- Verify ESP32 credentials in code
- Check router is accessible from ESP32's location
- Monitor ESP32 Serial output

## Next Steps

1. Flash ESP32 with the provided Arduino code
2. Connect all sensors according to pin configuration
3. Power on ESP32 and verify WiFi connection
4. Observe real-time data on dashboard at `http://localhost:3000/dashboard`
5. Configure alert thresholds and automation rules (future feature)

## Files Reference

- Device types: `/backend/src/devices/device-types.ts`
- Integration guide: `/backend/src/devices/ESP32_INTEGRATION.md`
- Seed script: `/backend/src/seed.ts`
- Frontend dashboard: `/frontend/pages/dashboard.tsx`
