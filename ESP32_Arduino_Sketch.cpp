/**
 * AroRano ESP32 IoT Sensor Node - Complete Arduino Sketch
 * 
 * This sketch connects an ESP32 to the AroRano backend and collects
 * sensor data from all connected devices:
 * - DHT22 (Temperature & Humidity)
 * - Ultrasonic (Water Level)
 * - Rain Sensor (Rainfall)
 * - Control outputs (Pump, Buzzer, LEDs)
 * 
 * Requirements:
 * - Board: ESP32 (WROOM-32)
 * - Libraries: WiFi, HTTPClient, DHT, ArduinoJson
 * 
 * Installation:
 * 1. Install ESP32 board in Arduino IDE
 * 2. Install required libraries via Library Manager:
 *    - DHT sensor library by Adafruit
 *    - ArduinoJson by Benoit Blanchon
 * 3. Update WiFi credentials below
 * 4. Replace device IDs with values from: curl http://your-backend/api/devices
 * 5. Upload sketch to ESP32
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ============================================================================
// CONFIGURATION - CHANGE THESE VALUES
// ============================================================================

const char* SSID = "YOUR_WIFI_SSID";              // WiFi network name
const char* PASSWORD = "YOUR_WIFI_PASSWORD";      // WiFi password
const char* BACKEND_URL = "http://192.168.1.100:3001"; // Backend API URL

// Device IDs (get from: curl http://your-backend/api/devices)
const char* DEVICE_ID_TEMP = "550e8400-e29b-41d4-a716-446655440001";
const char* DEVICE_ID_HUMIDITY = "550e8400-e29b-41d4-a716-446655440002";
const char* DEVICE_ID_WATER_LEVEL = "550e8400-e29b-41d4-a716-446655440003";
const char* DEVICE_ID_RAINFALL = "550e8400-e29b-41d4-a716-446655440004";
const char* DEVICE_ID_PUMP = "550e8400-e29b-41d4-a716-446655440005";
const char* DEVICE_ID_BUZZER = "550e8400-e29b-41d4-a716-446655440006";

// ============================================================================
// PIN CONFIGURATION
// ============================================================================

#define DHT_PIN 4                  // GPIO 4 - DHT22 data pin
#define ULTRASONIC_TRIG 5          // GPIO 5 - Ultrasonic trigger
#define ULTRASONIC_ECHO 18         // GPIO 18 - Ultrasonic echo
#define RAIN_SENSOR_PIN 34         // GPIO 34 - Rain sensor ADC (analog)
#define PUMP_RELAY_PIN 12          // GPIO 12 - Pump relay control
#define BUZZER_PIN 25              // GPIO 25 - Buzzer
#define LED_RED_PIN 26             // GPIO 26 - Red LED
#define LED_GREEN_PIN 27           // GPIO 27 - Green LED
#define LED_YELLOW_PIN 32          // GPIO 32 - Yellow LED
#define PUSH_BUTTON_PIN 35         // GPIO 35 - Push button (input only)

// ============================================================================
// SENSOR INITIALIZATION
// ============================================================================

DHT dht22(DHT_PIN, DHT22);

// Track last reading times to avoid flooding backend
unsigned long lastTempHumidityRead = 0;
unsigned long lastWaterLevelRead = 0;
unsigned long lastRainfallRead = 0;
const unsigned long READ_INTERVAL = 5000; // 5 seconds between readings

// ============================================================================
// SETUP
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════╗");
  Serial.println("║    AroRano ESP32 Sensor Node v1.0      ║");
  Serial.println("╚════════════════════════════════════════╝");
  
  // Initialize pins
  pinMode(DHT_PIN, INPUT);
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  pinMode(RAIN_SENSOR_PIN, INPUT);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_YELLOW_PIN, OUTPUT);
  pinMode(PUSH_BUTTON_PIN, INPUT_PULLUP);
  
  // Initialize DHT sensor
  dht22.begin();
  
  // Indicate startup with LEDs
  digitalWrite(LED_RED_PIN, HIGH);
  digitalWrite(LED_GREEN_PIN, HIGH);
  digitalWrite(LED_YELLOW_PIN, HIGH);
  delay(500);
  digitalWrite(LED_RED_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_YELLOW_PIN, LOW);
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("✅ Setup complete! Starting data collection...");
  Serial.println("");
}

// ============================================================================
// MAIN LOOP
// ============================================================================

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected! Attempting to reconnect...");
    connectToWiFi();
    delay(5000);
    return;
  }
  
  unsigned long now = millis();
  
  // Read and send temperature/humidity
  if (now - lastTempHumidityRead >= READ_INTERVAL) {
    readAndSendDHT22();
    lastTempHumidityRead = now;
  }
  
  // Read and send water level
  if (now - lastWaterLevelRead >= READ_INTERVAL) {
    readAndSendUltrasonic();
    lastWaterLevelRead = now;
  }
  
  // Read and send rainfall
  if (now - lastRainfallRead >= READ_INTERVAL) {
    readAndSendRainfall();
    lastRainfallRead = now;
  }
  
  // Check push button
  checkPushButton();
  
  delay(100); // Small delay to prevent CPU hogging
}

// ============================================================================
// WIFI CONNECTION
// ============================================================================

void connectToWiFi() {
  Serial.print("🔄 Connecting to WiFi: ");
  Serial.println(SSID);
  
  WiFi.begin(SSID, PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.print("✅ WiFi connected! IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("");
    Serial.println("❌ Failed to connect to WiFi");
  }
}

// ============================================================================
// SENSOR READING FUNCTIONS
// ============================================================================

void readAndSendDHT22() {
  float temperature = dht22.readTemperature();
  float humidity = dht22.readHumidity();
  
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ DHT22 read failed!");
    digitalWrite(LED_RED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_RED_PIN, LOW);
    return;
  }
  
  Serial.print("📊 DHT22 - Temp: ");
  Serial.print(temperature);
  Serial.print("°C, Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
  
  // Send temperature
  sendSensorReading(DEVICE_ID_TEMP, temperature, "°C");
  
  // Send humidity
  sendSensorReading(DEVICE_ID_HUMIDITY, humidity, "%");
  
  // Update LED indicator
  if (temperature > 30) {
    digitalWrite(LED_RED_PIN, HIGH); // Hot
  } else if (temperature < 20) {
    digitalWrite(LED_BLUE_PIN, HIGH); // Cold (using yellow as alternative)
  } else {
    digitalWrite(LED_GREEN_PIN, HIGH); // Normal
    delay(100);
    digitalWrite(LED_GREEN_PIN, LOW);
  }
}

void readAndSendUltrasonic() {
  float distance = measureUltrasonicDistance();
  
  if (distance < 0) {
    Serial.println("❌ Ultrasonic read failed!");
    return;
  }
  
  Serial.print("💧 Water Level: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  sendSensorReading(DEVICE_ID_WATER_LEVEL, distance, "cm");
  
  // Alert if water level too low or too high
  if (distance < 10) {
    Serial.println("⚠️  WARNING: Water level critically low!");
    soundBuzzer(3); // 3 beeps
  } else if (distance > 350) {
    Serial.println("⚠️  WARNING: Water level critically high!");
    soundBuzzer(2); // 2 beeps
  }
}

void readAndSendRainfall() {
  // Read rain sensor (analog ADC)
  int rawValue = analogRead(RAIN_SENSOR_PIN);
  
  // Convert ADC value (0-4095) to rainfall in mm
  // Adjust this calibration based on your sensor
  float rainfall = (rawValue / 4095.0) * 500.0; // 0-500mm range
  
  Serial.print("🌧️  Rainfall: ");
  Serial.print(rainfall);
  Serial.println(" mm");
  
  sendSensorReading(DEVICE_ID_RAINFALL, rainfall, "mm");
  
  // Alert if significant rainfall detected
  if (rainfall > 100) {
    Serial.println("⚠️  Heavy rainfall detected!");
    digitalWrite(LED_YELLOW_PIN, HIGH);
    delay(500);
    digitalWrite(LED_YELLOW_PIN, LOW);
  }
}

float measureUltrasonicDistance() {
  // Send trigger pulse
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);
  
  // Measure echo time (timeout after 30ms = ~5 meters)
  long timeout = 30000;
  long duration = pulseIn(ULTRASONIC_ECHO, HIGH, timeout);
  
  if (duration == 0) {
    return -1.0; // Timeout or error
  }
  
  // Convert time to distance
  // Speed of sound: 34300 cm/s or 0.0343 cm/µs
  float distance = (duration * 0.0343) / 2;
  
  // Validate reading (reasonable range: 2cm to 4m)
  if (distance < 2 || distance > 400) {
    return -1.0;
  }
  
  return distance;
}

// ============================================================================
// CONTROL FUNCTIONS
// ============================================================================

void checkPushButton() {
  static unsigned long lastButtonPress = 0;
  const unsigned long DEBOUNCE_DELAY = 200; // 200ms debounce
  
  if (digitalRead(PUSH_BUTTON_PIN) == LOW) { // Button pressed (pulled to ground)
    if (millis() - lastButtonPress > DEBOUNCE_DELAY) {
      Serial.println("🔘 Button pressed!");
      togglePump();
      lastButtonPress = millis();
    }
  }
}

void togglePump() {
  static bool pumpOn = false;
  pumpOn = !pumpOn;
  
  digitalWrite(PUMP_RELAY_PIN, pumpOn ? HIGH : LOW);
  
  if (pumpOn) {
    Serial.println("💧 Pump activated!");
    digitalWrite(LED_GREEN_PIN, HIGH);
    soundBuzzer(1); // 1 beep
  } else {
    Serial.println("⛔ Pump deactivated!");
    digitalWrite(LED_GREEN_PIN, LOW);
    soundBuzzer(2); // 2 beeps
  }
}

void soundBuzzer(int beeps) {
  for (int i = 0; i < beeps; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

// ============================================================================
// HTTP COMMUNICATION
// ============================================================================

void sendSensorReading(const char* deviceId, float value, const char* unit) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected! Cannot send reading.");
    return;
  }
  
  HTTPClient http;
  
  // Construct URL
  String url = String(BACKEND_URL) + "/api/devices/" + String(deviceId) + "/readings";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5 second timeout
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["value"] = value;
  doc["unit"] = unit;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    if (httpResponseCode == 201 || httpResponseCode == 200) {
      Serial.print("✅ Sent reading: ");
      Serial.print(value);
      Serial.print(" ");
      Serial.println(unit);
    } else {
      Serial.print("⚠️  HTTP Status: ");
      Serial.println(httpResponseCode);
    }
    
    // Optional: read response
    String response = http.getString();
  } else {
    Serial.print("❌ HTTP Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}

// ============================================================================
// END OF SKETCH
// ============================================================================

/*
TROUBLESHOOTING:

1. Not connecting to WiFi?
   - Check SSID and password
   - Ensure WiFi network is 2.4GHz (ESP32 doesn't support 5GHz)
   - Check WiFi signal strength near ESP32

2. Sensors not reading?
   - Verify pin connections match the PIN CONFIGURATION section
   - Check DHT22 library is installed
   - Look at Serial output for error messages

3. Data not reaching backend?
   - Verify backend URL is correct
   - Check backend is running: curl http://backend-ip:3001/api/health
   - Verify device IDs are correct

4. Serial monitor shows gibberish?
   - Set baud rate to 115200

5. Need to update device IDs?
   - Run: curl http://your-backend:3001/api/devices
   - Replace DEVICE_ID_* constants with new UUIDs

NEXT STEPS:

- Monitor Serial output (115200 baud)
- Check http://localhost:3000/dashboard for live data
- Calibrate rain sensor if readings seem off
- Adjust READ_INTERVAL for different update frequency
- Add more sensors as needed
*/
