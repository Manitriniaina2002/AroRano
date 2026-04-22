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

export interface ESP32Command {
  id: string;
  deviceId: string;
  commandType: string;
  status: string;
  parameters: Record<string, any> | null;
  notes: string | null;
  acknowledgedAt: string | null;
  executedAt: string | null;
  errorMessage: string | null;
  requestedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateESP32CommandInput {
  durationSeconds?: number;
  notes?: string;
  requestedBy?: string;
}

export interface ScrapingJob {
  id: string;
  mode: string;
  sourceUrl: string;
  targetUrl: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  status: string;
  totalEntries: number;
  processedEntries: number;
  errorMessage: string | null;
  metadata: Record<string, any> | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetEntry {
  id: string;
  jobId: string | null;
  sourceUrl: string | null;
  targetUrl: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  sourceTitle: string | null;
  targetTitle: string | null;
  sourceText: string;
  targetText: string | null;
  entryStatus: string;
  notes: string | null;
  confidence: number | null;
  sectionTitle: string | null;
  sourcePosition: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScrapingJobInput {
  sourceUrl: string;
  targetUrl?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  title?: string;
  mode?: 'wikipedia-bilingual' | 'url-pair' | 'single-url';
}

export interface CreateDatasetEntryInput {
  jobId?: string;
  sourceUrl?: string;
  targetUrl?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  sourceTitle?: string;
  targetTitle?: string;
  sourceText: string;
  targetText?: string;
  entryStatus?: 'pending' | 'translated' | 'reviewed' | 'rejected';
  notes?: string;
  confidence?: number;
  sectionTitle?: string;
  sourcePosition?: number;
}

export interface UpdateDatasetEntryInput {
  targetText?: string;
  entryStatus?: 'pending' | 'translated' | 'reviewed' | 'rejected';
  notes?: string;
  confidence?: number;
  targetTitle?: string;
  sectionTitle?: string;
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

    fillReservoir: async (deviceId: string, payload: CreateESP32CommandInput = {}): Promise<ESP32Command> => {
      const response = await apiClient.post<ESP32Command>(`/api/esp32/devices/${deviceId}/fill`, payload);
      return response.data;
    },

    startPump: async (deviceId: string, payload: CreateESP32CommandInput = {}): Promise<ESP32Command> => {
      const response = await apiClient.post<ESP32Command>(`/api/esp32/devices/${deviceId}/pump/start`, payload);
      return response.data;
    },

    stopPump: async (deviceId: string, payload: CreateESP32CommandInput = {}): Promise<ESP32Command> => {
      const response = await apiClient.post<ESP32Command>(`/api/esp32/devices/${deviceId}/pump/stop`, payload);
      return response.data;
    },

    getLatestCommand: async (deviceId: string): Promise<ESP32Command | null> => {
      const response = await apiClient.get<ESP32Command | null>(`/api/esp32/devices/${deviceId}/commands/latest`);
      return response.data;
    },

    getCommands: async (
      deviceId: string,
      limit: number = 20,
      offset: number = 0,
    ): Promise<{ data: ESP32Command[]; total: number }> => {
      const response = await apiClient.get<{ data: ESP32Command[]; total: number }>(`/api/esp32/devices/${deviceId}/commands`, {
        params: { limit, offset },
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

  scraper: {
    listJobs: async (): Promise<ScrapingJob[]> => {
      const response = await apiClient.get<ScrapingJob[]>('/api/scraper/jobs');
      return response.data;
    },

    getJob: async (jobId: string): Promise<ScrapingJob> => {
      const response = await apiClient.get<ScrapingJob>(`/api/scraper/jobs/${jobId}`);
      return response.data;
    },

    createJob: async (payload: CreateScrapingJobInput): Promise<ScrapingJob> => {
      const response = await apiClient.post<ScrapingJob>('/api/scraper/jobs', payload);
      return response.data;
    },

    runJob: async (jobId: string): Promise<ScrapingJob> => {
      const response = await apiClient.post<ScrapingJob>(`/api/scraper/jobs/${jobId}/run`);
      return response.data;
    },

    getEntries: async (jobId?: string, limit: number = 100, offset: number = 0): Promise<{ data: DatasetEntry[]; total: number }> => {
      const response = await apiClient.get<{ data: DatasetEntry[]; total: number }>('/api/scraper/entries', {
        params: { jobId, limit, offset },
      });
      return response.data;
    },

    createEntry: async (payload: CreateDatasetEntryInput): Promise<DatasetEntry> => {
      const response = await apiClient.post<DatasetEntry>('/api/scraper/entries', payload);
      return response.data;
    },

    updateEntry: async (entryId: string, payload: UpdateDatasetEntryInput): Promise<DatasetEntry> => {
      const response = await apiClient.patch<DatasetEntry>(`/api/scraper/entries/${entryId}`, payload);
      return response.data;
    },

    deleteEntry: async (entryId: string): Promise<void> => {
      await apiClient.delete(`/api/scraper/entries/${entryId}`);
    },

    exportDataset: async (jobId?: string, format: 'json' | 'csv' | 'jsonl' = 'json'): Promise<string> => {
      const response = await apiClient.get<string>('/api/scraper/export', {
        params: { jobId, format },
        responseType: 'text',
      });
      return response.data;
    },
  },
};

export default apiClient;
