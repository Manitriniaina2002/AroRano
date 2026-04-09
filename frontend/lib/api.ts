import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const api = {
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
};

export default apiClient;
