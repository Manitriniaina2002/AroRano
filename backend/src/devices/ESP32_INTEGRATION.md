# ESP32 Reservoir Data Integration

## Overview

This document describes the integration for receiving and processing ESP32 sensor data (water level, temperature, humidity, rain detection, pump status, and alerts) from IoT reservoir monitoring devices.

## Database Schema

### ESP32Reading Entity

The `esp32_readings` table stores all sensor data from ESP32 devices:

```
Column                Type        Constraints
------                ----        -----------
id                    uuid        PRIMARY KEY
deviceId              varchar     Indexed, Foreign Key concept
timestamp             timestamp   When data was collected by ESP32
waterLevelCm          float       Water level in centimeters
waterLevelPercent     smallint    Water level percentage (0-100)
temperature           float       Temperature in °C
humidity              smallint    Humidity percentage (0-100)
rainDetected          boolean     Rain detection status
pumpStatus            varchar     'ON' or 'OFF'
alert                 varchar     'NORMAL', 'WARNING', 'CRITICAL'
createdAt             timestamp   Server-side ingestion timestamp
```

**Indexes:**
- `(deviceId, createdAt)` - For efficient time-series queries
- `(deviceId)` - For device-specific lookups

## API Endpoints

### 1. Receive ESP32 Data

**POST** `/api/esp32/data`

Receive real-time sensor data from ESP32 device.

**Request Body:**
```json
{
  "device_id": "reservoir_01",
  "timestamp": "2026-04-19T06:30:00Z",
  "water_level_cm": 35.2,
  "water_level_percent": 68,
  "temperature": 27.5,
  "humidity": 75,
  "rain_detected": false,
  "pump_status": "OFF",
  "alert": "NORMAL"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "deviceId": "reservoir_01",
  "timestamp": "2026-04-19T06:30:00Z",
  "waterLevelCm": 35.2,
  "waterLevelPercent": 68,
  "temperature": 27.5,
  "humidity": 75,
  "rainDetected": false,
  "pumpStatus": "OFF",
  "alert": "NORMAL",
  "createdAt": "2026-04-19T06:30:15Z"
}
```

---

### 2. Get All Devices

**GET** `/api/esp32/devices`

List all devices that have sent data.

**Response:**
```json
{
  "devices": ["reservoir_01", "reservoir_02", "weather_station_01"]
}
```

---

### 3. Get Latest Reading

**GET** `/api/esp32/devices/{deviceId}/latest`

Get the most recent sensor reading from a device.

**Example:** `GET /api/esp32/devices/reservoir_01/latest`

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "deviceId": "reservoir_01",
  "timestamp": "2026-04-19T06:30:00Z",
  "waterLevelCm": 35.2,
  "waterLevelPercent": 68,
  "temperature": 27.5,
  "humidity": 75,
  "rainDetected": false,
  "pumpStatus": "OFF",
  "alert": "NORMAL",
  "createdAt": "2026-04-19T06:30:15Z"
}
```

---

### 4. Get Paginated Readings

**GET** `/api/esp32/devices/{deviceId}/readings?limit=100&offset=0`

Get paginated sensor readings from a device (ordered by most recent first).

**Query Parameters:**
- `limit` (default: 100, max: 1000) - Number of readings to return
- `offset` (default: 0) - Pagination offset

**Example:** `GET /api/esp32/devices/reservoir_01/readings?limit=50&offset=0`

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "deviceId": "reservoir_01",
      "timestamp": "2026-04-19T06:30:00Z",
      "waterLevelCm": 35.2,
      "waterLevelPercent": 68,
      "temperature": 27.5,
      "humidity": 75,
      "rainDetected": false,
      "pumpStatus": "OFF",
      "alert": "NORMAL",
      "createdAt": "2026-04-19T06:30:15Z"
    }
    // ... more readings
  ],
  "total": 1250
}
```

---

### 5. Get Readings by Date Range

**GET** `/api/esp32/devices/{deviceId}/readings/range?startDate=2026-04-18T00:00:00Z&endDate=2026-04-19T23:59:59Z`

Get sensor readings within a specific date range.

**Query Parameters:**
- `startDate` (required) - ISO 8601 format, e.g., `2026-04-19T00:00:00Z`
- `endDate` (required) - ISO 8601 format

**Example:** `GET /api/esp32/devices/reservoir_01/readings/range?startDate=2026-04-18T00:00:00Z&endDate=2026-04-19T23:59:59Z`

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deviceId": "reservoir_01",
    "timestamp": "2026-04-19T06:30:00Z",
    "waterLevelCm": 35.2,
    "waterLevelPercent": 68,
    "temperature": 27.5,
    "humidity": 75,
    "rainDetected": false,
    "pumpStatus": "OFF",
    "alert": "NORMAL",
    "createdAt": "2026-04-19T06:30:15Z"
  }
  // ... more readings
]
```

---

### 6. Get Device Statistics

**GET** `/api/esp32/devices/{deviceId}/stats?hoursBack=24`

Get aggregated statistics for a device over a time period.

**Query Parameters:**
- `hoursBack` (default: 24, range: 1-8760) - Number of hours to look back

**Example:** `GET /api/esp32/devices/reservoir_01/stats?hoursBack=24`

**Response:**
```json
{
  "avgWaterLevelCm": 35.5,
  "avgWaterLevelPercent": 68,
  "avgTemperature": 27.2,
  "avgHumidity": 74,
  "maxWaterLevelCm": 42.1,
  "minWaterLevelCm": 28.3,
  "maxTemperature": 31.5,
  "minTemperature": 22.1,
  "rainDetectedCount": 3,
  "totalReadings": 96,
  "latestAlert": "NORMAL",
  "latestPumpStatus": "OFF"
}
```

---

### 7. Health Check

**GET** `/api/esp32/health`

Simple health check for the ESP32 API.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-04-19T06:30:15Z"
}
```

---

## Real-Time WebSocket Events

When data is received, the system broadcasts events to connected WebSocket clients:

### Device Subscription

Subscribe to device-specific updates:
```javascript
socket.emit('subscribe', { deviceId: 'reservoir_01' });
```

### Events

**`esp32Reading`** - New ESP32 reading for subscribed device
```json
{
  "deviceId": "reservoir_01",
  "reading": { /* ESP32ReadingResponseDto */ },
  "timestamp": "2026-04-19T06:30:15Z"
}
```

**`esp32ReadingGlobal`** - New ESP32 reading (broadcast to all clients)
```json
{
  "deviceId": "reservoir_01",
  "reading": { /* ESP32ReadingResponseDto */ },
  "timestamp": "2026-04-19T06:30:15Z"
}
```

**`deviceAlert`** - Alert from device (broadcast to all clients)
```json
{
  "deviceId": "reservoir_01",
  "alert": "WARNING",
  "timestamp": "2026-04-19T06:30:15Z"
}
```

---

## Data Validation

The API validates incoming data with the following rules:

| Field | Validation |
|-------|-----------|
| `device_id` | Required, string |
| `timestamp` | Required, ISO 8601 date |
| `water_level_cm` | Required, number >= 0 |
| `water_level_percent` | Required, number 0-100 |
| `temperature` | Required, number |
| `humidity` | Required, number 0-100 |
| `rain_detected` | Required, boolean |
| `pump_status` | Required, 'ON' \| 'OFF' |
| `alert` | Required, 'NORMAL' \| 'WARNING' \| 'CRITICAL' |

---

## Usage Examples

### cURL Examples

**Send Data:**
```bash
curl -X POST http://localhost:3001/api/esp32/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "reservoir_01",
    "timestamp": "2026-04-19T06:30:00Z",
    "water_level_cm": 35.2,
    "water_level_percent": 68,
    "temperature": 27.5,
    "humidity": 75,
    "rain_detected": false,
    "pump_status": "OFF",
    "alert": "NORMAL"
  }'
```

**Get Latest Reading:**
```bash
curl http://localhost:3001/api/esp32/devices/reservoir_01/latest
```

**Get Statistics:**
```bash
curl http://localhost:3001/api/esp32/devices/reservoir_01/stats?hoursBack=24
```

### JavaScript/Node.js Example

```typescript
// Send ESP32 data
async function sendESP32Data() {
  const response = await fetch('http://localhost:3001/api/esp32/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_id: 'reservoir_01',
      timestamp: new Date().toISOString(),
      water_level_cm: 35.2,
      water_level_percent: 68,
      temperature: 27.5,
      humidity: 75,
      rain_detected: false,
      pump_status: 'OFF',
      alert: 'NORMAL',
    }),
  });
  
  const data = await response.json();
  console.log('Data stored:', data);
}

// Subscribe to real-time updates
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  socket.emit('subscribe', { deviceId: 'reservoir_01' });
});

socket.on('esp32Reading', (event) => {
  console.log('New reading:', event.reading);
});

socket.on('deviceAlert', (event) => {
  console.log('Alert:', event.alert);
});
```

---

## ESP32 Code Example

Example Arduino code for ESP32 to send data to the backend:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://YOUR_BACKEND_IP:3001/api/esp32/data";
const char* deviceId = "reservoir_01";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("Connected to WiFi");
}

void loop() {
  // Read sensors
  float waterLevelCm = readWaterLevel();
  int waterLevelPercent = (int)(waterLevelCm / 50.0 * 100);
  float temperature = readTemperature();
  int humidity = readHumidity();
  bool rainDetected = checkRain();
  String pumpStatus = isPumpOn() ? "ON" : "OFF";
  String alert = getAlertStatus();
  
  // Create JSON payload
  DynamicJsonDocument doc(256);
  doc["device_id"] = deviceId;
  doc["timestamp"] = getISOTimestamp();
  doc["water_level_cm"] = waterLevelCm;
  doc["water_level_percent"] = waterLevelPercent;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["rain_detected"] = rainDetected;
  doc["pump_status"] = pumpStatus;
  doc["alert"] = alert;
  
  // Send to server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload;
    serializeJson(doc, payload);
    
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data");
    }
    
    http.end();
  }
  
  // Send every 5 minutes
  delay(300000);
}
```

---

## Data Retention Policy

Old readings can be deleted using the `deleteOldReadings` method in the service:

```typescript
// Delete readings older than 30 days
await esp32Service.deleteOldReadings(30);
```

Consider setting up a scheduled job (cron) to periodically clean up old data:

```typescript
// In your cron service
@Cron('0 0 * * *') // Run daily at midnight
async cleanupOldData() {
  await this.esp32Service.deleteOldReadings(30);
}
```

---

## Security Considerations

1. **API Authentication** - Consider adding JWT or API key authentication to the `/api/esp32/data` endpoint
2. **Rate Limiting** - Implement rate limiting to prevent spam
3. **Input Validation** - All input is validated using class-validator
4. **CORS** - Configured to allow requests from frontend domain
5. **WebSocket Authentication** - Secure WebSocket connections with authentication tokens

Example secure endpoint:

```typescript
@Post('data')
@UseGuards(AuthGuard('jwt'))
async receiveData(@Body() dto: CreateESP32ReadingDto): Promise<ESP32Reading> {
  return await this.esp32Service.receiveESP32Data(dto);
}
```

---

## Troubleshooting

### Data not being stored
- Check database connection in environment variables
- Verify device ID format matches expectations
- Check server logs for validation errors

### WebSocket not broadcasting
- Ensure WebSocket server is initialized
- Verify client is subscribed to correct device ID
- Check CORS configuration

### Performance issues
- Increase database indexes
- Implement data archiving for old records
- Consider time-series database (TimescaleDB) for large datasets

