/**
 * ESP32 Integration Guide for AroRano IoT System
 * 
 * This file provides documentation for integrating the ESP32 microcontroller
 * with the AroRano backend API.
 */

// ============================================================================
// 1. API ENDPOINTS FOR SENDING SENSOR DATA
// ============================================================================

/**
 * POST /api/devices/{deviceId}/readings
 * Add a sensor reading to a device
 * 
 * Request Body:
 * {
 *   "value": 45.5,        // Numeric sensor value
 *   "unit": "%"            // Unit of measurement (%, °C, cm, mm, etc.)
 * }
 * 
 * Response:
 * {
 *   "id": "uuid",
 *   "deviceId": "uuid",
 *   "value": 45.5,
 *   "unit": "%",
 *   "timestamp": "2026-04-18T10:30:00.000Z"
 * }
 * 
 * Example cURL:
 * curl -X POST http://localhost:3001/api/devices/{deviceId}/readings \
 *   -H "Content-Type: application/json" \
 *   -d '{"value": 45.5, "unit": "%"}'
 */

// ============================================================================
// 2. DEVICE TYPES AND THEIR EXPECTED UNITS
// ============================================================================

const DEVICE_UNITS = {
  rainSensor: 'mm',              // Millimeters of rainfall
  ultrasonic: 'cm',             // Centimeters (water level distance)
  dht22: '°C / %',              // Temperature (°C) or Humidity (%)
  waterPump: 'state',           // ON/OFF (1/0)
  relay: 'state',               // ON/OFF (1/0)
  buzzer: 'state',              // ON/OFF (1/0)
  ledRGB: 'color',              // Color code (e.g., "RED", "GREEN", "YELLOW")
  lcdScreen: 'display',         // Text content
  pushButton: 'state',          // PRESSED/RELEASED (1/0)
  waterLevel: '%',              // Percentage (0-100)
};

// ============================================================================
// 3. ESP32 EXAMPLE CODE (Arduino)
// ============================================================================

const ESP32_EXAMPLE_CODE = `
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// WiFi Credentials
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

// Backend Configuration
const char* backendUrl = "http://192.168.X.X:3001";
String deviceIds[10]; // Store device IDs from backend

// Pins
#define DHT_PIN 4
#define ULTRASONIC_TRIG 5
#define ULTRASONIC_ECHO 18
#define RAIN_SENSOR_PIN 34  // ADC pin

DHT dht22(DHT_PIN, DHT22);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\\nConnected!");
  Serial.println("IP: " + WiFi.localIP().toString());
  
  // Initialize sensors
  dht22.begin();
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  
  // Fetch device list from backend
  fetchDeviceIds();
}

void loop() {
  // Read DHT22 (Temperature)
  float temp = dht22.readTemperature();
  if (!isnan(temp)) {
    sendSensorReading("dht22", temp, "°C");
  }
  
  // Read DHT22 (Humidity)
  float humidity = dht22.readHumidity();
  if (!isnan(humidity)) {
    sendSensorReading("dht22", humidity, "%");
  }
  
  // Read Ultrasonic Water Level
  float distance = measureUltrasonicDistance();
  if (distance > 0) {
    sendSensorReading("ultrasonic", distance, "cm");
  }
  
  // Read Rain Sensor
  int rainValue = analogRead(RAIN_SENSOR_PIN);
  float rainfall = rainValue * (500.0 / 4095.0); // Convert ADC to mm
  sendSensorReading("rainSensor", rainfall, "mm");
  
  delay(5000); // Send readings every 5 seconds
}

void sendSensorReading(const char* deviceType, float value, const char* unit) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected!");
    return;
  }
  
  // Find device ID by type
  String deviceId = getDeviceIdByType(deviceType);
  if (deviceId.isEmpty()) {
    Serial.println("Device not found: " + String(deviceType));
    return;
  }
  
  HTTPClient http;
  String url = String(backendUrl) + "/api/devices/" + deviceId + "/readings";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  String payload = "{\"value\":" + String(value) + ",\"unit\":\"" + String(unit) + "\"}";
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✓ Sent " + String(deviceType) + ": " + String(value) + unit);
    Serial.println("Response: " + response);
  } else {
    Serial.println("✗ HTTP Error: " + String(httpResponseCode));
  }
  
  http.end();
}

float measureUltrasonicDistance() {
  // Send trigger pulse
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);
  
  // Measure echo time
  long duration = pulseIn(ULTRASONIC_ECHO, HIGH);
  float distance = (duration * 0.034) / 2; // Convert to cm
  
  return distance;
}

void fetchDeviceIds() {
  HTTPClient http;
  String url = String(backendUrl) + "/api/devices";
  
  http.begin(url);
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    // Parse JSON and store device IDs (use ArduinoJson library for proper parsing)
    Serial.println("Devices fetched from backend");
  }
  
  http.end();
}

String getDeviceIdByType(const char* deviceType) {
  // This would be implemented with proper JSON parsing
  // For now, return a placeholder
  return "device-uuid-here";
}
`;

// ============================================================================
// 4. HTTP REQUEST EXAMPLES
// ============================================================================

const REQUEST_EXAMPLES = {
  // Get all devices
  getAllDevices: {
    method: 'GET',
    url: 'http://localhost:3001/api/devices',
    response: [
      {
        id: 'uuid-1',
        name: 'Capteur Ultrasonic',
        type: 'ultrasonic',
        location: 'Réservoir d\'eau',
        status: 'active',
      },
    ],
  },

  // Send ultrasonic reading (water level)
  sendUltrasonicReading: {
    method: 'POST',
    url: 'http://localhost:3001/api/devices/{deviceId}/readings',
    body: {
      value: 125.5, // cm from bottom of tank
      unit: 'cm',
    },
    response: {
      id: 'reading-uuid',
      deviceId: 'device-uuid',
      value: 125.5,
      unit: 'cm',
      timestamp: '2026-04-18T10:30:00.000Z',
    },
  },

  // Send DHT22 temperature reading
  sendTemperatureReading: {
    method: 'POST',
    url: 'http://localhost:3001/api/devices/{deviceId}/readings',
    body: {
      value: 28.5,
      unit: '°C',
    },
  },

  // Send rain sensor reading
  sendRainfallReading: {
    method: 'POST',
    url: 'http://localhost:3001/api/devices/{deviceId}/readings',
    body: {
      value: 12.3,
      unit: 'mm',
    },
  },

  // Get device statistics
  getDeviceStats: {
    method: 'GET',
    url: 'http://localhost:3001/api/devices/{deviceId}/stats',
    response: {
      average: 125.2,
      min: 120.1,
      max: 130.5,
      latest: {
        id: 'reading-uuid',
        deviceId: 'device-uuid',
        value: 125.5,
        unit: 'cm',
        timestamp: '2026-04-18T10:30:00.000Z',
      },
    },
  },

  // Get device readings (last 100)
  getDeviceReadings: {
    method: 'GET',
    url: 'http://localhost:3001/api/devices/{deviceId}/readings',
    response: [
      {
        id: 'reading-uuid-1',
        deviceId: 'device-uuid',
        value: 125.5,
        unit: 'cm',
        timestamp: '2026-04-18T10:30:00.000Z',
      },
      {
        id: 'reading-uuid-2',
        deviceId: 'device-uuid',
        value: 124.8,
        unit: 'cm',
        timestamp: '2026-04-18T10:25:00.000Z',
      },
    ],
  },
};

// ============================================================================
// 5. SETUP & INITIALIZATION
// ============================================================================

const SETUP_STEPS = `
1. Flash ESP32 with the provided Arduino code
2. Update WiFi credentials in the code
3. Connect ESP32 to WiFi network
4. Run: npm run seed  (in backend directory to create devices)
5. Verify ESP32 IP address in Serial monitor
6. ESP32 will start sending readings every 5 seconds
7. Open http://localhost:3000/dashboard to see real-time data

PIN CONFIGURATION:
- DHT22 (Temp/Humidity):     GPIO 4
- Ultrasonic Trigger:         GPIO 5
- Ultrasonic Echo:            GPIO 18
- Rain Sensor ADC:            GPIO 34
- Relay/Pump Control:         GPIO 12
- Buzzer:                      GPIO 25
- LED Red:                     GPIO 26
- LED Green:                   GPIO 27
- LED Yellow:                  GPIO 32
- Push Button:                 GPIO 35
`;

export {
  DEVICE_UNITS,
  ESP32_EXAMPLE_CODE,
  REQUEST_EXAMPLES,
  SETUP_STEPS,
};
