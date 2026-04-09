'use client';

import React, { useEffect, useState } from 'react';
import { api, Device, DeviceStats, SensorReading } from '@/lib/api';
import { websocket, SensorReadingEvent } from '@/lib/websocket';
import { t, getLanguage } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toaster';
import {
  FiPlus,
  FiTrash2,
  FiTrendingUp,
  FiAlertCircle,
  FiCheck,
  FiCloud,
  FiActivity,
  FiZap,
  FiWifiOff,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: 'waterLevel',
    location: '',
  });

  const deviceConfig: Record<string, { icon: React.ReactNode; colorClass: string; bgClass: string }> = {
    waterLevel: {
      icon: <FiCloud size={16} />,
      colorClass: 'text-blue-700',
      bgClass: 'bg-blue-50',
    },
    temperature: {
      icon: <FiZap size={16} />,
      colorClass: 'text-orange-700',
      bgClass: 'bg-orange-50',
    },
    turbidity: {
      icon: <FiActivity size={16} />,
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
    },
    ph: {
      icon: <FiActivity size={16} />,
      colorClass: 'text-green-700',
      bgClass: 'bg-green-50',
    },
    flowRate: {
      icon: <FiActivity size={16} />,
      colorClass: 'text-cyan-700',
      bgClass: 'bg-cyan-50',
    },
    pressure: {
      icon: <FiActivity size={16} />,
      colorClass: 'text-purple-700',
      bgClass: 'bg-purple-50',
    },
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
    if (!formData.name || !formData.type || !formData.location) {
      toast({
        title: t('common.error'),
        description: t('dashboard.fillAllFields') || 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.devices.create(formData as any);
      setFormData({ name: '', type: 'temperature', location: '' });
      setShowAddForm(false);
      toast({
        title: t('dashboard.success') || 'Success',
        description: t('dashboard.deviceCreated') || 'Device created successfully',
        variant: 'success',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common.error');
      console.error('Error creating device:', err);
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (window.confirm(t('dashboard.confirmDelete') || 'Are you sure?')) {
      try {
        await api.devices.delete(deviceId);
        toast({
          title: t('dashboard.success') || 'Success',
          description: t('dashboard.deviceDeleted') || 'Device deleted successfully',
          variant: 'success',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('common.error');
        console.error('Error deleting device:', err);
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const cfg = (type: string) => deviceConfig[type] ?? deviceConfig.motion;

  return (
    <Layout title="AroRano">
      {/* ── Page shell ── */}
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

        {/* ── Left sidebar ── */}
        <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="text-[11px] font-semibold tracking-widest text-cyan-600 uppercase">
              Water Reservoirs
            </p>
          </div>

          {/* Device list */}
          <nav className="flex-1 overflow-y-auto py-2">
            {loading ? (
              <div className="px-4 py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : devices.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                {t('dashboard.noDevices')}
              </p>
            ) : (
              devices.map((device) => {
                const { icon, colorClass, bgClass } = cfg(device.type);
                const active = selectedDevice?.id === device.id;
                return (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-l-2 ${
                      active
                        ? 'bg-violet-50 border-l-violet-500'
                        : 'border-l-transparent hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bgClass} ${colorClass}`}>
                      {icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{device.name}</p>
                      <p className="text-[11px] text-gray-400 capitalize">{t(`deviceTypes.${device.type}`)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </nav>

          {/* Add device button */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <FiPlus size={15} />
              {t('dashboard.addDevice')}
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <main className="flex-1 overflow-y-auto">
          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
              <FiAlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">{t('common.error')}</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !selectedDevice && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                <FiCloud size={22} className="text-blue-400" />
              </div>
              <p className="text-gray-500 text-sm">No reservoirs added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus size={15} />
                Add Reservoir
              </button>
            </div>
          )}

          {/* Device detail */}
          {selectedDevice && (
            <div className="p-6 space-y-5">

              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${cfg(selectedDevice.type).bgClass} ${cfg(selectedDevice.type).colorClass}`}>
                    {cfg(selectedDevice.type).icon}
                  </span>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">{selectedDevice.name}</h1>
                    <p className="text-sm text-gray-400">{selectedDevice.location} · ID: {selectedDevice.id.substring(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* WS indicator */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                    wsConnected
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {wsConnected
                      ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{t('dashboard.websocketConnected')}</>
                      : <><FiWifiOff size={12} />{t('dashboard.websocketDisconnected')}</>
                    }
                  </span>
                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteDevice(selectedDevice.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-200"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Water Reservoir Visualization */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Water Level Status</h2>
                <div className="flex items-center justify-center gap-8">
                  {/* Tank visualization */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-40 border-4 border-blue-300 rounded-lg bg-gradient-to-b from-blue-100 to-blue-50 relative overflow-hidden flex items-end justify-center">
                      {/* Water level visual */}
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500 ease-out rounded-b"
                        style={{ height: `${Math.min(stats?.latest?.value ?? 0, 100)}%` }}
                      />
                      {/* Percentage text */}
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-gray-900 text-sm bg-white bg-opacity-80 px-2 py-1 rounded">
                        {Math.min(stats?.latest?.value ?? 0, 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Reservoir Tank</p>
                  </div>

                  {/* Tank info */}
                  <div className="space-y-3 flex-1">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs text-gray-600 mb-1">Current Level</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-blue-600">{stats?.latest?.value.toFixed(1) ?? '—'}</p>
                        <p className="text-sm text-gray-500">{stats?.latest?.unit}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                        <p className="text-xs text-gray-600 mb-1">Avg Level</p>
                        <p className="text-lg font-bold text-orange-600">{stats?.average.toFixed(1)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <p className={`text-sm font-bold ${(stats?.latest?.value ?? 0) > 70 ? 'text-green-600' : (stats?.latest?.value ?? 0) > 40 ? 'text-orange-600' : 'text-red-600'}`}>
                          {(stats?.latest?.value ?? 0) > 70 ? 'Optimal' : (stats?.latest?.value ?? 0) > 40 ? 'Normal' : 'Low'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Maximum', value: stats.max.toFixed(1), color: 'text-blue-600' },
                    { label: 'Minimum', value: stats.min.toFixed(1), color: 'text-sky-600' },
                    { label: 'Average', value: stats.average.toFixed(1), color: 'text-emerald-600' },
                    { label: 'Latest', value: stats.latest?.value.toFixed(1) ?? '—', color: 'text-violet-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                      <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-2">{label}</p>
                      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stats.latest?.unit}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Live readings */}
              <div className="bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                  <FiTrendingUp size={15} className="text-blue-500" />
                  <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.liveReadings')}</h2>
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                {realtimeReadings.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">{t('dashboard.noReadings')}</p>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {realtimeReadings.map((reading, idx) => (
                      <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{reading.value} {reading.unit}</span>
                          <span className="text-xs text-gray-400 ml-3">{reading.timestamp}</span>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                          <FiCheck size={11} className="text-green-600" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Add Device Dialog ── */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Water Reservoir</DialogTitle>
            <DialogDescription>
              Add a new water reservoir or sensor node to monitor
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="grid gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Reservoir Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Main Tank, North Reservoir"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
              />
            </div>

            {/* Type */}
            <div className="grid gap-1.5">
              <label htmlFor="type" className="text-sm font-medium text-gray-700">
                Sensor Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white transition"
              >
                <option value="waterLevel">Water Level Sensor</option>
                <option value="temperature">Temperature Sensor</option>
                <option value="turbidity">Turbidity Sensor</option>
                <option value="ph">pH Sensor</option>
                <option value="flowRate">Flow Rate Meter</option>
                <option value="pressure">Pressure Gauge</option>
              </select>
            </div>

            {/* Location */}
            <div className="grid gap-1.5">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location/Zone
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., Zone A, Building Intake"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              {t('dashboard.cancelAdd') || 'Cancel'}
            </Button>
            <Button
              onClick={handleAddDevice}
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSubmitting ? t('common.loading') || 'Creating…' : t('dashboard.createDevice')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
