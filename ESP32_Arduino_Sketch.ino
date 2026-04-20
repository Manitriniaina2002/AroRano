#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>  // ESP32 compatible version

// ===== WIFI =====
const char* ssid = "123";
const char* password = "Allaccess     ";

// ===== SERVER =====
const char* serverName = "http://192.168.88.16:3001/api/esp32/data";

// ===== DHT22 SENSOR =====
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ===== LCD DISPLAY =====
LiquidCrystal_I2C lcd(0x27, 16, 2);

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

// ===== GLOBAL VARIABLES =====
float waterLevelPercent = 0.0;
bool pumpState = false;

// ===== CONFIGURATION =====
// Calibration: measure distance at EMPTY and FULL states
float emptyDistance = 6.1;        // cm - Distance reading when tank is EMPTY
float fullDistance = 56.0;        // cm - Distance reading when tank is FULL (adjust based on actual)
float lowThreshold = 30.0;        // % - Pump ON threshold
float highThreshold = 80.0;       // % - Pump OFF threshold

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

  // Initialize sensors
  dht.begin();
  lcd.init();
  lcd.backlight();
  lcd.print("Starting...");

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
    digitalWrite(RELAY, HIGH);
    pumpState = true;
  } else if (levelPercent > highThreshold) {
    digitalWrite(RELAY, LOW);
    pumpState = false;
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

  HTTPClient http;
  http.begin(serverName);
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
    "{\"device_id\":\"reservoir_01\","
    "\"water_level_cm\":%.1f,"
    "\"water_level_percent\":%.0f,"
    "\"temperature\":%.1f,"
    "\"humidity\":%.0f,"
    "\"rain_detected\":%s,"
    "\"pump_status\":\"%s\","
    "\"alert\":\"%s\"}",
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

// ===== GET RESERVOIR STATUS =====
const char* getReservoirStatus() {
  if (waterLevelPercent > 80.0) {
    return "OPTIMAL";
  } else if (waterLevelPercent > 30.0) {
    return "NORMAL";
  } else {
    return "LOW";
  }
}

// ===== LCD DISPLAY UPDATE =====
void displayLCD(float temp, float hum) {
  lcd.clear();
  
  // Line 1: Water level and status
  lcd.setCursor(0, 0);
  lcd.print("Lvl:");
  if (waterLevelPercent < 10) lcd.print(" ");
  lcd.print((int)waterLevelPercent);
  lcd.print("% ");
  lcd.print(getReservoirStatus());

  // Line 2: Temperature and Humidity
  lcd.setCursor(0, 1);
  lcd.print("T:");
  lcd.print((int)temp);
  lcd.print("C H:");
  lcd.print((int)hum);
  lcd.print("%");
}

// ===== MAIN LOOP =====
void loop() {
  // Read all sensors
  float distance = readUltrasonic();
  
  // Calculate water level percentage using two-point calibration
  // Sensor is closer when water is HIGH (6cm = 100% full)
  // Sensor is farther when water is LOW (56cm = 0% empty)
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

  // Execute control logic
  controlSystem(waterLevelPercent, rainDetected);
  
  // Update displays
  displayLCD(temperature, humidity);
  
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
  delay(10000);  // 10 second interval
}
