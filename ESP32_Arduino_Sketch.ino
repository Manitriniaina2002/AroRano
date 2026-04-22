#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <WiFiClientSecure.h>

// ===== WIFI =====
const char* ssid = "123";
const char* password = "Allaccess     ";

// ===== SERVER =====
const char* serverName = "https://arorano-backend.onrender.com/api/esp32/data";
const char* commandEndpoint = "https://arorano-backend.onrender.com/api/esp32/devices/reservoir_01/commands/latest";
const char* commandAckPrefix = "https://arorano-backend.onrender.com/api/esp32/devices/reservoir_01/commands/";
const char* deviceId = "reservoir_01";

// ===== DHT22 SENSOR =====
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ===== GPIO PINS =====
#define TRIG 5
#define ECHO 18
#define LED_GREEN 14
#define LED_YELLOW 27
#define LED_RED 26
#define BUZZER 25
#define RELAY 33
#define BUTTON 32
#define RAIN 34

// Most relay modules for ESP32 are active-low: LOW = pump ON, HIGH = pump OFF.
const uint8_t RELAY_ACTIVE_LEVEL = LOW;
const uint8_t RELAY_INACTIVE_LEVEL = HIGH;

// ===== GLOBAL VARIABLES =====
float waterLevelPercent = 0.0;
bool pumpState = false;
bool manualPumpOverride = false;
bool manualPumpTarget = false;
unsigned long manualOverrideUntil = 0;
String lastProcessedCommandId = "";

// ===== CONFIGURATION =====
// Calibration: measure distance at EMPTY and FULL states
float fullDistance = 6.1;         // cm - Distance reading when tank is FULL
float emptyDistance = 56.0;       // cm - Distance reading when tank is EMPTY (adjust based on actual)
float lowThreshold = 30.0;        // % - Pump ON threshold
float highThreshold = 80.0;       // % - Pump OFF threshold

void setPumpState(bool isOn) {
  digitalWrite(RELAY, isOn ? RELAY_ACTIVE_LEVEL : RELAY_INACTIVE_LEVEL);
  pumpState = isOn;
}

void syncPumpStateFromRelay() {
  int relayOutput = digitalRead(RELAY);
  pumpState = (relayOutput == RELAY_ACTIVE_LEVEL);
}

String extractJsonString(const String& payload, const String& key) {
  String token = "\"" + key + "\":\"";
  int start = payload.indexOf(token);
  if (start < 0) return "";
  start += token.length();
  int end = payload.indexOf('"', start);
  if (end < 0) return "";
  return payload.substring(start, end);
}

long extractJsonLong(const String& payload, const String& key, long defaultValue = 0) {
  String token = "\"" + key + "\":";
  int start = payload.indexOf(token);
  if (start < 0) return defaultValue;
  start += token.length();

  while (start < payload.length() && payload[start] == ' ') {
    start++;
  }

  int end = start;
  while (end < payload.length() && isDigit(payload[end])) {
    end++;
  }

  if (end == start) return defaultValue;
  return payload.substring(start, end).toInt();
}

void acknowledgeCommand(const String& commandId, const char* status, const char* errorMessage = "") {
  if (WiFi.status() != WL_CONNECTED || commandId.length() == 0) {
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  String ackUrl = String(commandAckPrefix) + commandId;
  http.begin(client, ackUrl);
  http.addHeader("Content-Type", "application/json");

  String body = String("{\"status\":\"") + status + "\"";
  if (strlen(errorMessage) > 0) {
    body += String(",\"errorMessage\":\"") + errorMessage + "\"";
  }
  body += "}";

  int httpCode = http.sendRequest("PATCH", body);
  Serial.print("Command ACK HTTP Status: ");
  Serial.println(httpCode);
  http.end();
}

void processRemoteCommand() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, commandEndpoint);
  http.setConnectTimeout(5000);
  http.setTimeout(5000);

  int httpCode = http.GET();
  if (httpCode != 200) {
    http.end();
    return;
  }

  String payload = http.getString();
  http.end();

  if (payload.length() == 0 || payload == "null") {
    return;
  }

  String status = extractJsonString(payload, "status");
  if (status != "pending") {
    return;
  }

  String commandId = extractJsonString(payload, "id");
  String commandType = extractJsonString(payload, "commandType");

  if (commandId.length() == 0 || commandType.length() == 0 || commandId == lastProcessedCommandId) {
    return;
  }

  Serial.print("Executing command: ");
  Serial.println(commandType);

  if (commandType == "PUMP_START") {
    manualPumpOverride = true;
    manualPumpTarget = true;
    manualOverrideUntil = 0;
    setPumpState(true);
    acknowledgeCommand(commandId, "executed");
  } else if (commandType == "PUMP_STOP") {
    manualPumpOverride = true;
    manualPumpTarget = false;
    manualOverrideUntil = 0;
    setPumpState(false);
    acknowledgeCommand(commandId, "executed");
  } else if (commandType == "FILL_RESERVOIR") {
    long durationSeconds = extractJsonLong(payload, "durationSeconds", 60);
    manualPumpOverride = true;
    manualPumpTarget = true;
    manualOverrideUntil = millis() + (unsigned long)durationSeconds * 1000UL;
    setPumpState(true);
    acknowledgeCommand(commandId, "executed");
  } else {
    acknowledgeCommand(commandId, "failed", "Unsupported command type");
  }

  lastProcessedCommandId = commandId;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n=== ESP32 Water Monitoring System ===\n");

  // Initialize all pins
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(RELAY, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(RAIN, INPUT);

  // Ensure known startup state for relay-controlled pump.
  setPumpState(false);

  // Initialize sensors
  dht.begin();

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi!");
  }
}

// ===== ULTRASONIC DISTANCE SENSOR =====
float readUltrasonic() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duration = pulseIn(ECHO, HIGH, 30000);  // 30ms timeout
  float distance = duration * 0.034 / 2;
  
  // Validate reading
  if (distance <= 0 || distance > 500) {
    distance = 0;
  }
  return distance;
}

// ===== SYSTEM CONTROL LOGIC =====
void controlSystem(float levelPercent, bool rainDetected) {
  // Pump control logic
  if (levelPercent < lowThreshold && !rainDetected) {
    setPumpState(true);
  } else if (levelPercent > highThreshold) {
    setPumpState(false);
  }

  // LED status indicators
  bool isLow = levelPercent <= lowThreshold;
  bool isHigh = levelPercent > highThreshold;
  bool isMid = !isLow && !isHigh;
  
  digitalWrite(LED_GREEN, isHigh ? HIGH : LOW);
  digitalWrite(LED_YELLOW, isMid ? HIGH : LOW);
  digitalWrite(LED_RED, isLow ? HIGH : LOW);
  digitalWrite(BUZZER, isLow ? HIGH : LOW);
}

// ===== SEND DATA TO SERVER =====
void sendData(float temp, float hum, bool rain, float distanceCm) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping data send");
    return;
  }

  // Keep reported status aligned with real relay output state.
  syncPumpStateFromRelay();

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, serverName);
  http.addHeader("Content-Type", "application/json");
  http.setConnectTimeout(5000);
  http.setTimeout(5000);

  // Determine alert level based on water level
  const char* alert = "NORMAL";
  if (waterLevelPercent <= lowThreshold) {
    alert = "CRITICAL";
  } else if (waterLevelPercent <= lowThreshold + 10) {
    alert = "WARNING";
  }

  // Build JSON payload with proper escaping
  char json[512];
  snprintf(json, sizeof(json),
    "{\"device_id\":\"%s\","
    "\"water_level_cm\":%.1f,"
    "\"water_level_percent\":%.0f,"
    "\"temperature\":%.1f,"
    "\"humidity\":%.0f,"
    "\"rain_detected\":%s,"
    "\"pump_status\":\"%s\","
    "\"alert\":\"%s\"}",
    deviceId,
    distanceCm,
    waterLevelPercent,
    temp,
    hum,
    rain ? "true" : "false",
    pumpState ? "ON" : "OFF",
    alert
  );

  Serial.print("Sending JSON: ");
  Serial.println(json);

  int httpCode = http.POST(json);
  Serial.print("HTTP Status: ");
  Serial.println(httpCode);

  if (httpCode == 200 || httpCode == 201) {
    String response = http.getString();
    Serial.println("Success!");
    Serial.println(response);
  } else {
    Serial.print("Error: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ===== MAIN LOOP =====
void loop() {
  // Read all sensors
  float distance = readUltrasonic();
  
  // Calculate water level percentage using two-point calibration
  // Sensor is closer when water is HIGH (fullDistance = 100%)
  // Sensor is farther when water is LOW (emptyDistance = 0%)
  // Formula: percent = ((emptyDistance - distance) / (emptyDistance - fullDistance)) * 100
  float tankRange = emptyDistance - fullDistance;
  waterLevelPercent = ((emptyDistance - distance) / tankRange) * 100.0;
  
  // Clamp values between 0-100%
  if (waterLevelPercent < 0) waterLevelPercent = 0;
  if (waterLevelPercent > 100) waterLevelPercent = 100;
  
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  bool rainDetected = digitalRead(RAIN) == HIGH;

  // Check for valid sensor readings
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT sensor read failed!");
    delay(5000);
    return;
  }

  // Pull and execute operator commands from dashboard/backend.
  processRemoteCommand();

  // Safety guard: always stop pump when reservoir is at/above high threshold.
  if (waterLevelPercent >= highThreshold) {
    setPumpState(false);
    manualPumpOverride = false;
    manualOverrideUntil = 0;
  }

  if (manualPumpOverride) {
    if (manualOverrideUntil > 0 && millis() > manualOverrideUntil) {
      manualPumpOverride = false;
      manualOverrideUntil = 0;
    } else {
      setPumpState(manualPumpTarget);
    }
  }

  // Execute control logic
  if (!manualPumpOverride) {
    controlSystem(waterLevelPercent, rainDetected);
  }
  
  // Send data to server
  sendData(temperature, humidity, rainDetected, distance);

  // Serial debug output
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.print("cm | Level: ");
  Serial.print((int)waterLevelPercent);
  Serial.print("% | Temp: ");
  Serial.print((int)temperature);
  Serial.print("C | Humidity: ");
  Serial.print((int)humidity);
  Serial.print("% | Rain: ");
  Serial.print(rainDetected ? "YES" : "NO");
  Serial.print(" | Pump: ");
  Serial.println(pumpState ? "ON" : "OFF");

  // Wait before next reading
  delay(5000);  // 5 second interval
}
