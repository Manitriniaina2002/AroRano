import io, { Socket } from 'socket.io-client';
import { getApiOrigin } from './runtime-config';

const SOCKET_URL = getApiOrigin();

let socket: Socket | null = null;

export interface SensorReadingEvent {
  deviceId: string;
  reading: {
    id: string;
    deviceId: string;
    value: number;
    unit: string;
    timestamp: string;
  };
  timestamp: string;
}

export interface DeviceUpdatedEvent {
  deviceId: string;
  device: any;
  timestamp: string;
}

export interface DeviceCreatedEvent {
  device: any;
  timestamp: string;
}

export interface DeviceDeletedEvent {
  deviceId: string;
  timestamp: string;
}

type EventCallback<T> = (data: T) => void;

export const websocket = {
  /**
   * Initialize WebSocket connection
   */
  connect: (): Promise<void> => {
    return new Promise((resolve) => {
      if (socket && socket.connected) {
        resolve();
        return;
      }

      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        resolve();
      });

      socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  },

  /**
   * Disconnect WebSocket
   */
  disconnect: (): void => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Check if connected
   */
  isConnected: (): boolean => {
    return socket ? socket.connected : false;
  },

  /**
   * Subscribe to a device's real-time data
   */
  subscribeToDevice: (deviceId: string): void => {
    if (socket?.connected) {
      socket.emit('subscribe', { deviceId });
      console.log(`📡 Subscribed to device: ${deviceId}`);
    }
  },

  /**
   * Unsubscribe from a device
   */
  unsubscribeFromDevice: (deviceId: string): void => {
    if (socket?.connected) {
      socket.emit('unsubscribe', { deviceId });
      console.log(`📴 Unsubscribed from device: ${deviceId}`);
    }
  },

  /**
   * Listen for sensor readings in real-time
   */
  onSensorReading: (callback: EventCallback<SensorReadingEvent>): void => {
    if (socket) {
      socket.on('sensorReading', callback);
    }
  },

  /**
   * Listen for device updates
   */
  onDeviceUpdated: (callback: EventCallback<DeviceUpdatedEvent>): void => {
    if (socket) {
      socket.on('deviceUpdated', callback);
    }
  },

  /**
   * Listen for new devices
   */
  onDeviceCreated: (callback: EventCallback<DeviceCreatedEvent>): void => {
    if (socket) {
      socket.on('deviceCreated', callback);
    }
  },

  /**
   * Listen for device deletion
   */
  onDeviceDeleted: (callback: EventCallback<DeviceDeletedEvent>): void => {
    if (socket) {
      socket.on('deviceDeleted', callback);
    }
  },

  /**
   * Remove event listener
   */
  off: (event: string): void => {
    if (socket) {
      socket.off(event);
    }
  },
};

export default websocket;
