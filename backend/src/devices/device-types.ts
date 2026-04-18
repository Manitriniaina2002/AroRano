/**
 * Enum for supported IoT device types
 * Maps to the physical AroRano water reservoir monitoring system
 */
export enum DeviceType {
  // Sensors
  RAIN_SENSOR = 'rainSensor',
  DHT22 = 'dht22', // Temperature & Humidity
  ULTRASONIC = 'ultrasonicSensor', // Water level measurement
  WATER_LEVEL = 'waterLevel', // Generic water level
  
  // Actuators
  WATER_PUMP = 'waterPump',
  BUZZER = 'buzzer',
  RELAY = 'relay',
  
  // Indicators
  LED_RGB = 'ledRGB',
  LCD_SCREEN = 'lcdScreen',
  
  // Control
  PUSH_BUTTON = 'pushButton',
  
  // Microcontroller
  ESP32 = 'esp32',
  
  // Generic/Legacy
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  MOTION = 'motion',
  PRESSURE = 'pressure',
  LIGHT = 'light',
}

/**
 * Device type metadata: units and display information
 */
export const DEVICE_TYPE_META: Record<
  DeviceType,
  {
    label: string;
    unit: string;
    min?: number;
    max?: number;
    icon?: string;
  }
> = {
  [DeviceType.RAIN_SENSOR]: {
    label: 'Rain Sensor',
    unit: 'mm',
    min: 0,
    max: 500,
  },
  [DeviceType.DHT22]: {
    label: 'Temperature & Humidity (DHT22)',
    unit: '°C / %',
  },
  [DeviceType.ULTRASONIC]: {
    label: 'Ultrasonic Water Level',
    unit: 'cm',
    min: 0,
    max: 400,
  },
  [DeviceType.WATER_LEVEL]: {
    label: 'Water Level',
    unit: '%',
    min: 0,
    max: 100,
  },
  [DeviceType.WATER_PUMP]: {
    label: 'Water Pump',
    unit: 'state',
  },
  [DeviceType.BUZZER]: {
    label: 'Buzzer',
    unit: 'state',
  },
  [DeviceType.RELAY]: {
    label: '1-Channel Relay',
    unit: 'state',
  },
  [DeviceType.LED_RGB]: {
    label: 'RGB LED',
    unit: 'color',
  },
  [DeviceType.LCD_SCREEN]: {
    label: 'LCD Screen',
    unit: 'display',
  },
  [DeviceType.PUSH_BUTTON]: {
    label: 'Push Button',
    unit: 'state',
  },
  [DeviceType.ESP32]: {
    label: 'ESP32 Microcontroller',
    unit: 'controller',
  },
  [DeviceType.TEMPERATURE]: {
    label: 'Temperature',
    unit: '°C',
  },
  [DeviceType.HUMIDITY]: {
    label: 'Humidity',
    unit: '%',
  },
  [DeviceType.MOTION]: {
    label: 'Motion',
    unit: 'detected',
  },
  [DeviceType.PRESSURE]: {
    label: 'Pressure',
    unit: 'Pa',
  },
  [DeviceType.LIGHT]: {
    label: 'Light',
    unit: 'lux',
  },
};
