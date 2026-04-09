'use client';

import React, { useEffect, useState } from 'react';
import { api, Device, DeviceStats, SensorReading } from '@/lib/api';
import { websocket, SensorReadingEvent } from '@/lib/websocket';
import { t, getLanguage } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import {
  FiPlus,
  FiTrash2,
  FiTrendingUp,
  FiAlertCircle,
  FiCheck,
  FiCloud,
  FiActivity,
  FiZap,
  FiSun,
} from 'react-icons/fi';

export default function DevicesDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [realtimeReadings, setRealtimeReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    name: '',
    type: 'temperature',
    location: '',
  });

  const deviceIcons: Record<string, React.ReactNode> = {
    temperature: <FiZap size={20} />,
    humidity: <FiCloud size={20} />,
    motion: <FiActivity size={20} />,
    pressure: <FiActivity size={20} />,
    light: <FiSun size={20} />,
  };

  // Initialize WebSocket connection and load data
  useEffect(() => {
    setLanguage(getLanguage());
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // Connect to WebSocket
        await websocket.connect();
        setWsConnected(true);

        // Load initial data
        const data = await api.devices.getAll();
        setDevices(data);
        if (data.length > 0 && !selectedDevice) {
          setSelectedDevice(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error', language as 'en' | 'mg'));
        console.error('Error loading devices:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      websocket.disconnect();
    };
  }, []);

  // Load stats and subscribe to real-time updates when device changes
  useEffect(() => {
    if (selectedDevice) {
      loadStats(selectedDevice.id);
      loadReadings(selectedDevice.id);

      // Subscribe to this device's real-time data
      websocket.subscribeToDevice(selectedDevice.id);

      // Listen for real-time sensor readings
      const handleReading = (event: SensorReadingEvent) => {
        if (event.deviceId === selectedDevice.id) {
          // Add to real-time readings list (keep last 20)
          setRealtimeReadings((prev) => [event.reading, ...prev].slice(0, 20));

          // Update stats
          setStats((prev) => {
            if (!prev) return prev;
            const newAvg = prev.average; // Keep previous average for stability
            return {
              ...prev,
              latest: event.reading,
              average: (newAvg + event.reading.value) / 2,
              max: Math.max(prev.max, event.reading.value),
              min: Math.min(prev.min, event.reading.value),
            };
          });
        }
      };

      websocket.onSensorReading(handleReading);

      return () => {
        websocket.off('sensorReading');
        websocket.unsubscribeFromDevice(selectedDevice.id);
      };
    }
  }, [selectedDevice]);

  // Listen for device updates
  useEffect(() => {
    const handleDeviceUpdated = (event: any) => {
      setDevices((prev) =>
        prev.map((d) => (d.id === event.deviceId ? event.device : d))
      );
      if (selectedDevice?.id === event.deviceId) {
        setSelectedDevice(event.device);
      }
    };

    const handleDeviceCreated = (event: any) => {
      setDevices((prev) => [event.device, ...prev]);
    };

    const handleDeviceDeleted = (event: any) => {
      setDevices((prev) => prev.filter((d) => d.id !== event.deviceId));
      if (selectedDevice?.id === event.deviceId) {
        setSelectedDevice(null);
      }
    };

    websocket.onDeviceUpdated(handleDeviceUpdated);
    websocket.onDeviceCreated(handleDeviceCreated);
    websocket.onDeviceDeleted(handleDeviceDeleted);

    return () => {
      websocket.off('deviceUpdated');
      websocket.off('deviceCreated');
      websocket.off('deviceDeleted');
    };
  }, [selectedDevice]);

  const loadStats = async (deviceId: string) => {
    try {
      const data = await api.devices.getStats(deviceId);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadReadings = async (deviceId: string) => {
    try {
      const data = await api.devices.getReadings(deviceId);
      setRealtimeReadings(data);
    } catch (err) {
      console.error('Error loading readings:', err);
    }
  };

  const handleAddDevice = async () => {
    if (formData.name && formData.type && formData.location) {
      try {
        await api.devices.create(formData as any);
        setFormData({ name: '', type: 'temperature', location: '' });
        setShowAddForm(false);
      } catch (err) {
        console.error('Error creating device:', err);
      }
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.devices.delete(deviceId);
      } catch (err) {
        console.error('Error deleting device:', err);
      }
    }
  };

  return (
    <Layout title={t('dashboard.title')} showSidebar>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('dashboard.devices')} ({devices.length})
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <FiPlus size={20} />
            {t('dashboard.addDevice')}
          </button>
        </div>

        {/* Add Device Form */}
        {showAddForm && (
          <div className="card mb-8 border-l-4 border-primary-500">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('dashboard.addDevice')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder={t('dashboard.deviceName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="temperature">{t('deviceTypes.temperature')}</option>
                <option value="humidity">{t('deviceTypes.humidity')}</option>
                <option value="motion">{t('deviceTypes.motion')}</option>
                <option value="pressure">{t('deviceTypes.pressure')}</option>
                <option value="light">{t('deviceTypes.light')}</option>
              </select>
              <input
                type="text"
                placeholder={t('dashboard.location')}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddDevice} className="btn-primary">
                {t('dashboard.createDevice')}
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">
                {t('dashboard.cancelAdd')}
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card mb-8 border-l-4 border-red-500 bg-red-50 flex gap-4">
            <FiAlertCircle size={24} className="text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700">{t('common.error')}</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* WebSocket Status */}
        <div className="mb-8 p-4 bg-primary-50 rounded-lg border border-primary-200 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">
            {wsConnected ? t('dashboard.websocketConnected') : t('dashboard.websocketDisconnected')}
          </span>
        </div>

        {/* Devices List and Details */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full mb-4" />
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="card text-center py-12">
            <FiAlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{t('dashboard.noDevices')}</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              {t('dashboard.addDevice')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Devices List */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold mb-4 text-gray-900">{t('dashboard.devices')}</h2>
              <div className="space-y-2">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`w-full card-hover p-4 text-left rounded-lg transition-colors ${
                      selectedDevice?.id === device.id
                        ? 'bg-primary-50 border-l-4 border-primary-500'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary-600">{deviceIcons[device.type] || <FiActivity size={20} />}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{device.name}</p>
                        <p className="text-xs text-gray-600">{t(`deviceTypes.${device.type}`)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Details */}
            {selectedDevice && (
              <div className="lg:col-span-2">
                {/* Device Header */}
                <div className="card mb-6 border-l-4 border-primary-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedDevice.name}</h2>
                      <p className="text-gray-600 mb-1">{selectedDevice.location}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">
                          {t(`deviceTypes.${selectedDevice.type}`)}
                        </span>
                        <span className="text-gray-600">ID: {selectedDevice.id.substring(0, 8)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDevice(selectedDevice.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Statistics Grid */}
                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                      <p className="text-xs text-gray-600 mb-1">{t('dashboard.latest')}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.latest?.value.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{stats.latest?.unit}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-green-50 to-green-100">
                      <p className="text-xs text-gray-600 mb-1">{t('dashboard.average')}</p>
                      <p className="text-2xl font-bold text-green-600">{stats.average.toFixed(1)}</p>
                      <p className="text-xs text-gray-600 mt-1">{stats.latest?.unit}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
                      <p className="text-xs text-gray-600 mb-1">{t('dashboard.minimum')}</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.min.toFixed(1)}</p>
                      <p className="text-xs text-gray-600 mt-1">{stats.latest?.unit}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-red-50 to-red-100">
                      <p className="text-xs text-gray-600 mb-1">{t('dashboard.maximum')}</p>
                      <p className="text-2xl font-bold text-red-600">{stats.max.toFixed(1)}</p>
                      <p className="text-xs text-gray-600 mt-1">{stats.latest?.unit}</p>
                    </div>
                  </div>
                )}

                {/* Live Readings */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <FiTrendingUp size={20} className="text-primary-600" />
                    {t('dashboard.liveReadings')}
                  </h3>
                  {realtimeReadings.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">{t('dashboard.noReadings')}</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {realtimeReadings.map((reading, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-semibold text-gray-900">{reading.value} {reading.unit}</p>
                            <p className="text-xs text-gray-600">{reading.timestamp}</p>
                          </div>
                          <FiCheck size={16} className="text-green-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </Layout>
  );
}
