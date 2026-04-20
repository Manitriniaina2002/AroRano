import axios from 'axios';
import { getApiOrigin } from './runtime-config';

const API_URL = getApiOrigin();

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export interface HealthResponse {
  status: string;
  message: string;
}

export interface WelcomeResponse {
  message: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  readings?: SensorReading[];
}

export interface SensorReading {
  id: string;
  deviceId: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface DeviceStats {
  average: number;
  min: number;
  max: number;
  latest: SensorReading | null;
}

export interface UserSummary {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ESP32Reading {
  id: string;
  deviceId: string;
  timestamp: string;
  waterLevelCm: number;
  waterLevelPercent: number;
  temperature: number;
  humidity: number;
  rainDetected: boolean;
  pumpStatus: string;
  alert: string;
  createdAt: string;
}

export interface ESP32Stats {
  avgWaterLevelCm: number;
  avgWaterLevelPercent: number;
  avgTemperature: number;
  avgHumidity: number;
  maxWaterLevelCm: number;
  minWaterLevelCm: number;
  maxTemperature: number;
  minTemperature: number;
  rainDetectedCount: number;
  totalReadings: number;
  latestAlert: string;
  latestPumpStatus: string;
}

export const api = {
  auth: {
    getUsers: async (): Promise<UserSummary[]> => {
      const response = await apiClient.get<{ success: boolean; data: UserSummary[] }>('/auth/users');
      return response.data.data;
    },

    updateUserStatus: async (id: string, isActive: boolean): Promise<UserSummary> => {
      const response = await apiClient.patch<{ success: boolean; data: UserSummary }>(`/auth/users/${id}/status`, {
        isActive,
      });
      return response.data.data;
    },
  },

  /**
   * Check API health status
   */
  health: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/api/health');
    return response.data;
  },

  /**
   * Get welcome message from API
   */
  welcome: async (): Promise<WelcomeResponse> => {
    const response = await apiClient.get<WelcomeResponse>('/api');
    return response.data;
  },

  // Device APIs
  devices: {
    /**
     * Get all devices
     */
    getAll: async (): Promise<Device[]> => {
      const response = await apiClient.get<Device[]>('/api/devices');
      return response.data;
    },

    /**
     * Get device by ID
     */
    getById: async (id: string): Promise<Device> => {
      const response = await apiClient.get<Device>(`/api/devices/${id}`);
      return response.data;
    },

    /**
     * Create new device
     */
    create: async (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt' | 'readings'>): Promise<Device> => {
      const response = await apiClient.post<Device>('/api/devices', device);
      return response.data;
    },

    /**
     * Update device
     */
    update: async (id: string, updates: Partial<Device>): Promise<Device> => {
      const response = await apiClient.put<Device>(`/api/devices/${id}`, updates);
      return response.data;
    },

    /**
     * Delete device
     */
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/devices/${id}`);
    },

    /**
     * Get sensor readings for device
     */
    getReadings: async (deviceId: string): Promise<SensorReading[]> => {
      const response = await apiClient.get<SensorReading[]>(`/api/devices/${deviceId}/readings`);
      return response.data;
    },

    /**
     * Add sensor reading
     */
    addReading: async (deviceId: string, value: number, unit: string): Promise<SensorReading> => {
      const response = await apiClient.post<SensorReading>(`/api/devices/${deviceId}/readings`, {
        value,
        unit,
      });
      return response.data;
    },

    /**
     * Get device statistics
     */
    getStats: async (deviceId: string): Promise<DeviceStats> => {
      const response = await apiClient.get<DeviceStats>(`/api/devices/${deviceId}/stats`);
      return response.data;
    },
  },

  // ESP32 APIs
  esp32: {
    /**
     * Get recent ESP32 data
     */
    getData: async (limit: number = 50, deviceId?: string): Promise<ESP32Reading[]> => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (deviceId) params.append('deviceId', deviceId);
      const response = await apiClient.get<ESP32Reading[]>(`/api/esp32/data?${params.toString()}`);
      return response.data;
    },

    /**
     * Get all ESP32 devices
     */
    getDevices: async (): Promise<{ devices: string[] }> => {
      const response = await apiClient.get<{ devices: string[] }>('/api/esp32/devices');
      return response.data;
    },

    /**
     * Get latest reading from device
     */
    getLatestReading: async (deviceId: string): Promise<ESP32Reading | null> => {
      const response = await apiClient.get<ESP32Reading | null>(`/api/esp32/devices/${deviceId}/latest`);
      return response.data;
    },

    /**
     * Get readings from device
     */
    getReadings: async (
      deviceId: string,
      limit: number = 100,
      offset: number = 0,
    ): Promise<{ data: ESP32Reading[]; total: number }> => {
      const response = await apiClient.get<{ data: ESP32Reading[]; total: number }>(`/api/esp32/devices/${deviceId}/readings`, {
        params: { limit, offset },
      });
      return response.data;
    },

    /**
     * Get device statistics
     */
    getStats: async (deviceId: string, hoursBack: number = 24): Promise<ESP32Stats> => {
      const response = await apiClient.get<ESP32Stats>(`/api/esp32/devices/${deviceId}/stats`, {
        params: { hoursBack },
      });
      return response.data;
    },

    /**
     * Health check
     */
    health: async (): Promise<{ status: string; timestamp: string }> => {
      const response = await apiClient.get<{ status: string; timestamp: string }>('/api/esp32/health');
      return response.data;
    },
  },
};

export default apiClient;
