'use client';

import React, { useEffect, useState } from 'react';
import { api, Device, DeviceStats, SensorReading } from '@/lib/api';
import { websocket, SensorReadingEvent } from '@/lib/websocket';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import { Layout } from '@/components/Layout';
import {
  FiTrendingUp,
  FiAlertCircle,
  FiCheck,
  FiCloud,
  FiActivity,
  FiZap,
  FiWifiOff,
} from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default function DevicesDashboard() {
  const { language } = useLanguage();
  const [_devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [realtimeReadings, setRealtimeReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const deviceConfig: Record<string, { icon: React.ReactNode; colorClass: string; bgClass: string }> = {
    // Sensors
    waterLevel: {
      icon: <FiCloud size={16} />,
      colorClass: 'text-blue-700',
      bgClass: 'bg-blue-50',
    },
    rainSensor: {
      icon: <FiCloud size={16} />,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
    },
    ultrasonic: {
      icon: <FiCloud size={16} />,
      colorClass: 'text-cyan-700',
      bgClass: 'bg-cyan-50',
    },
    dht22: {
      icon: <FiActivity size={16} />,
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
    },
    temperature: {
      icon: <FiZap size={16} />,
      colorClass: 'text-orange-700',
      bgClass: 'bg-orange-50',
    },
    humidity: {
      icon: <FiActivity size={16} />,
      colorClass: 'text-teal-700',
      bgClass: 'bg-teal-50',
    },
    
    // Actuators
    waterPump: {
      icon: <FiZap size={16} />,
      colorClass: 'text-indigo-700',
      bgClass: 'bg-indigo-50',
    },
    relay: {
      icon: <FiZap size={16} />,
      colorClass: 'text-purple-700',
      bgClass: 'bg-purple-50',
    },
    
    // Indicators
    buzzer: {
      icon: <FiAlertCircle size={16} />,
      colorClass: 'text-red-700',
      bgClass: 'bg-red-50',
    },
    ledRGB: {
      icon: <FiActivity size={16} />,
      colorClass: 'text-yellow-700',
      bgClass: 'bg-yellow-50',
    },
    lcdScreen: {
      icon: <FiActivity size={16} />,
      colorClass: 'text-violet-700',
      bgClass: 'bg-violet-50',
    },
    
    // Control
    pushButton: {
      icon: <FiCheck size={16} />,
      colorClass: 'text-slate-700',
      bgClass: 'bg-slate-50',
    },
    
    // Microcontroller
    esp32: {
      icon: <FiZap size={16} />,
      colorClass: 'text-pink-700',
      bgClass: 'bg-pink-50',
    },
    
    // Legacy
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

  const hardwareItems = [
    { key: 'rainSensor', icon: <FiCloud size={16} />, tone: 'bg-blue-50 text-blue-700 border-blue-100' },
    { key: 'buzzer', icon: <FiAlertCircle size={16} />, tone: 'bg-red-50 text-red-700 border-red-100' },
    { key: 'ledRGB', icon: <FiActivity size={16} />, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
    { key: 'waterPump', icon: <FiZap size={16} />, tone: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
    { key: 'relay', icon: <FiActivity size={16} />, tone: 'bg-slate-50 text-slate-700 border-slate-200' },
    { key: 'esp32', icon: <FiZap size={16} />, tone: 'bg-blue-50 text-blue-700 border-blue-100' },
    { key: 'dht22', icon: <FiTrendingUp size={16} />, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { key: 'pushButton', icon: <FiCheck size={16} />, tone: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { key: 'ultrasonic', icon: <FiCloud size={16} />, tone: 'bg-sky-50 text-sky-700 border-sky-100' },
    { key: 'lcdScreen', icon: <FiActivity size={16} />, tone: 'bg-violet-50 text-violet-700 border-violet-100' },
  ];

  // Initialize WebSocket connection and load data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // Connect to WebSocket
        try {
          await websocket.connect();
          setWsConnected(true);
        } catch (wsErr) {
          console.warn('WebSocket connection failed:', wsErr);
          // Continue even if WebSocket fails
        }

        // Try to load ESP32 data first
        try {
          const esp32Data = await api.esp32.getData(50, 'reservoir_01');
          if (esp32Data && esp32Data.length > 0) {
            setRealtimeReadings(esp32Data);
            // Create a mock device for ESP32
            const mockDevice: Device = {
              id: 'reservoir_01',
              name: 'ESP32 Contrôleur Principal',
              type: 'esp32',
              location: 'Réservoir d\'eau',
              status: 'connected',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setSelectedDevice(mockDevice);
          }
        } catch (esp32Err) {
          console.warn('Failed to load ESP32 data, falling back to devices API:', esp32Err);
          
          // Fallback to devices API
          let data = await api.devices.getAll();
          setDevices(data);
          if (data.length > 0 && !selectedDevice) {
            setSelectedDevice(data[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error', language as 'en' | 'mg'));
        console.error('Error loading devices:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

  }, []);

  useEffect(() => {
    if (!loading) {
      setSlowLoad(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setSlowLoad(true);
      setLoading(false);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [loading]);

  // Load stats and subscribe to real-time updates when device changes
  useEffect(() => {
    if (selectedDevice) {
      // Load ESP32 specific data if it's an ESP32 device
      if (selectedDevice.type === 'esp32' || selectedDevice.id === 'reservoir_01') {
        loadESP32Data(selectedDevice.id);
      } else {
        loadStats(selectedDevice.id);
        loadReadings(selectedDevice.id);
      }

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

  const loadESP32Data = async (deviceId: string) => {
    try {
      const readings = await api.esp32.getReadings(deviceId, 100);
      if (readings && readings.data) {
        setRealtimeReadings(readings.data);
      } else if (Array.isArray(readings)) {
        setRealtimeReadings(readings);
      }
    } catch (err) {
      console.error('Error loading ESP32 data:', err);
    }
  };

  const cfg = (type: string) => deviceConfig[type] ?? deviceConfig.motion;
  // Use ESP32 water level if available, otherwise fall back to stats
  const waterLevelPercent = realtimeReadings.length > 0 
    ? (realtimeReadings[0] as any)?.waterLevelPercent 
    : stats?.latest?.value;
  const reservoirLevel = Math.min(Math.max(waterLevelPercent ?? 0, 0), 100);
  
  // Determine status based on water level
  const getReservoirStatus = (level: number) => {
    if (level > 80) return t('dashboard.reservoirOptimal', language as 'en' | 'mg');
    if (level > 30) return t('dashboard.reservoirNormal', language as 'en' | 'mg');
    return t('dashboard.reservoirLow', language as 'en' | 'mg');
  };
  
  const reservoirStatus = getReservoirStatus(reservoirLevel);
  const reservoirStatusClass = reservoirLevel > 80
    ? 'bg-green-50 text-green-700'
    : reservoirLevel > 30
      ? 'bg-amber-50 text-amber-700'
      : 'bg-red-50 text-red-700';

  const ReservoirCard = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.reservoirRepresentation', language as 'en' | 'mg')}</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${reservoirStatusClass}`}>
          {stats ? reservoirStatus : t('dashboard.noReadings', language as 'en' | 'mg')}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-8">
        <div className="flex items-end gap-4">
          {/* Measurement scale */}
          <div className="flex flex-col justify-between h-64 text-[9px] font-medium text-gray-500 pb-2 space-y-0">
            <div className="flex items-center gap-1">
              <div className="w-4 h-px bg-gray-300" />
              <span>100%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-px bg-gray-200" />
              <span>80%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-px bg-gray-300" />
              <span>60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-px bg-gray-200" />
              <span>40%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-px bg-gray-300" />
              <span>20%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-px bg-gray-200" />
              <span>0%</span>
            </div>
          </div>

          {/* Tank body */}
          <div className="relative">
            {/* Tank outer shell */}
            <div className="w-32 h-64 bg-gradient-to-r from-gray-100 to-gray-50 rounded-b-3xl border-2 border-gray-300 relative overflow-hidden shadow-lg">
              {/* Tank top rim */}
              <div className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-b from-gray-400 to-gray-300 rounded-full shadow-sm" />

              {/* Water fill */}
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 transition-all duration-700 ease-out"
                style={{ height: `${reservoirLevel}%` }}
              >
                {/* Water surface waves */}
                <div className="absolute -top-1 left-0 right-0 h-6 overflow-hidden">
                  <div className="reservoir-wave reservoir-wave-1 absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/40 to-white/10" />
                  <div className="reservoir-wave reservoir-wave-2 absolute inset-x-0 top-1 h-5 bg-cyan-100/35" />
                </div>

                {/* Water depth shading */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-blue-900/15" />

                {/* Light reflection */}
                <div className="absolute top-1/4 left-1 w-1.5 h-12 bg-white/20 rounded-full blur-md" />
              </div>

              {/* Internal measurement marks */}
              <div className="absolute inset-0 pointer-events-none">
                {[20, 40, 60, 80].map((mark) => (
                  <div
                    key={mark}
                    className="absolute left-0 right-0 border-t border-gray-200"
                    style={{ bottom: `${mark}%` }}
                  />
                ))}
              </div>

              {/* Drain valve */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-3 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-lg shadow-md" />

              {/* Current level display */}
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white text-lg bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                {reservoirLevel.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {/* Water Level Card */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">{t('dashboard.currentWaterLevel', language as 'en' | 'mg')}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-700">
                {realtimeReadings.length > 0 
                  ? (realtimeReadings[0] as any)?.waterLevelPercent?.toFixed(0) 
                  : stats?.latest?.value?.toFixed(1) ?? '0.0'}
              </p>
              <p className="text-sm text-gray-500">%</p>
            </div>
            {realtimeReadings.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {(realtimeReadings[0] as any)?.waterLevelCm?.toFixed(1)} cm
              </p>
            )}
          </div>

          {/* Temperature & Humidity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <p className="text-xs text-gray-600 mb-1">Temperature</p>
              <p className="text-lg font-bold text-orange-700">
                {realtimeReadings.length > 0 
                  ? (realtimeReadings[0] as any)?.temperature?.toFixed(1)
                  : '—'}
                <span className="text-xs ml-0.5">°C</span>
              </p>
            </div>
            <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
              <p className="text-xs text-gray-600 mb-1">Humidity</p>
              <p className="text-lg font-bold text-teal-700">
                {realtimeReadings.length > 0 
                  ? (realtimeReadings[0] as any)?.humidity
                  : '—'}
                <span className="text-xs ml-0.5">%</span>
              </p>
            </div>
          </div>

          {/* Pump & Alert Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-lg p-3 border ${(realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.pumpStatus === 'ON') ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
              <p className="text-xs text-gray-600 mb-1">Pump Status</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${(realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.pumpStatus === 'ON') ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <p className={`text-lg font-bold ${(realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.pumpStatus === 'ON') ? 'text-green-700' : 'text-gray-700'}`}>
                  {realtimeReadings.length > 0 
                    ? (realtimeReadings[0] as any)?.pumpStatus 
                    : 'OFF'}
                </p>
              </div>
            </div>
            <div className={`rounded-lg p-3 border ${(realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.alert === 'CRITICAL') ? 'bg-red-50 border-red-100' : (realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.alert === 'WARNING') ? 'bg-yellow-50 border-yellow-100' : 'bg-green-50 border-green-100'}`}>
              <p className="text-xs text-gray-600 mb-1">Alert Level</p>
              <p className={`text-lg font-bold ${(realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.alert === 'CRITICAL') ? 'text-red-700' : (realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.alert === 'WARNING') ? 'text-yellow-700' : 'text-green-700'}`}>
                {realtimeReadings.length > 0 
                  ? (realtimeReadings[0] as any)?.alert 
                  : 'NORMAL'}
              </p>
            </div>
          </div>

          {/* Rain Detection */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-gray-600 mb-1">Rain Detection</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.rainDetected ? 'bg-blue-500' : 'bg-gray-400'}`} />
              <p className={`text-sm font-bold ${realtimeReadings.length > 0 && (realtimeReadings[0] as any)?.rainDetected ? 'text-blue-700' : 'text-gray-700'}`}>
                {realtimeReadings.length > 0 
                  ? ((realtimeReadings[0] as any)?.rainDetected ? 'Detected' : 'None')
                  : 'No data'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Loading state */}
          {loading && (
            <div className="max-w-6xl mx-auto w-full min-h-[65vh] flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 animate-spin">
                <FiCloud size={22} className="text-blue-400" />
              </div>
              <p className="text-gray-500 text-sm">{t('dashboard.loadingReservoirs', language as 'en' | 'mg')}</p>
            </div>
          )}

          {slowLoad && !selectedDevice && !error && (
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
              <FiAlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">{t('dashboard.connectionSlow', language as 'en' | 'mg')}</p>
                <p className="text-amber-700 mt-0.5">{t('dashboard.addReservoirManually', language as 'en' | 'mg')}</p>
              </div>
            </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
              <FiAlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">{t('common.error', language as 'en' | 'mg')}</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !selectedDevice && !error && (
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FiCloud size={22} className="text-blue-400" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">{t('dashboard.monitoringReady', language as 'en' | 'mg')}</h1>
                <p className="text-gray-500 text-sm mt-1">{t('dashboard.firstMeasurement', language as 'en' | 'mg')}</p>
              </div>

              <ReservoirCard />

              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                <p className="text-gray-500 text-sm">{t('dashboard.noReservoirs', language as 'en' | 'mg')}</p>
              </div>
            </div>
          )}

          {/* Device detail */}
          {selectedDevice && (
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">

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
                      ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{t('dashboard.websocketConnected', language as 'en' | 'mg')}</>
                      : <><FiWifiOff size={12} />{t('dashboard.websocketDisconnected', language as 'en' | 'mg')}</>
                    }
                  </span>
                </div>
              </div>

              <ReservoirCard />

              {/* Stats grid */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Maximum', value: stats.max.toFixed(1), color: 'text-blue-600' },
                    { label: 'Minimum', value: stats.min.toFixed(1), color: 'text-sky-600' },
                    { label: 'Average', value: stats.average.toFixed(1), color: 'text-emerald-600' },
                    { label: 'Latest', value: stats.latest?.value.toFixed(1) ?? '—', color: 'text-blue-700' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                      <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-2">{label}</p>
                      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stats.latest?.unit}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hardware used */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.waterSystemSetup', language as 'en' | 'mg')}</h2>
                    <p className="text-xs text-gray-500 mt-1">{t('dashboard.setupDescription', language as 'en' | 'mg')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hardwareItems.map((item) => (
                    <div key={item.key} className={`rounded-xl border p-4 ${item.tone}`}>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 shadow-sm">
                          {item.icon}
                        </span>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{t(`hardware.${item.key}.name`, language as 'en' | 'mg')}</p>
                          <p className="text-xs text-gray-600 mt-1">{t(`hardware.${item.key}.detail`, language as 'en' | 'mg')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESP32 Real-time Monitoring */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <FiActivity size={18} className="text-indigo-500" />
                  <h2 className="text-sm font-semibold text-gray-700">ESP32 Real-time Monitoring</h2>
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                
                {realtimeReadings.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Waiting for sensor data...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Water Level */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-xs text-gray-600 mb-2">Water Level</p>
                      <p className="text-3xl font-bold text-blue-600 mb-1">
                        {(realtimeReadings[0] as any)?.waterLevelPercent || realtimeReadings[0]?.value?.toFixed(1) || '—'}
                        <span className="text-sm text-gray-500 ml-1">%</span>
                      </p>
                      <p className="text-xs text-gray-500">{new Date((realtimeReadings[0] as any)?.timestamp).toLocaleTimeString()}</p>
                    </div>

                    {/* Temperature */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                      <p className="text-xs text-gray-600 mb-2">Temperature</p>
                      <p className="text-3xl font-bold text-orange-600 mb-1">
                        {(realtimeReadings[0] as any)?.temperature?.toFixed(1) || '—'}
                        <span className="text-sm text-gray-500 ml-1">°C</span>
                      </p>
                      <p className="text-xs text-gray-500">From DHT22 Sensor</p>
                    </div>

                    {/* Humidity */}
                    <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-4 border border-teal-100">
                      <p className="text-xs text-gray-600 mb-2">Humidity</p>
                      <p className="text-3xl font-bold text-teal-600 mb-1">
                        {(realtimeReadings[0] as any)?.humidity || '—'}
                        <span className="text-sm text-gray-500 ml-1">%</span>
                      </p>
                      <p className="text-xs text-gray-500">From DHT22 Sensor</p>
                    </div>

                    {/* Pump Status */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                      <p className="text-xs text-gray-600 mb-2">Pump Status</p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${(realtimeReadings[0] as any)?.pumpStatus === 'ON' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <p className="text-lg font-bold text-indigo-600">{(realtimeReadings[0] as any)?.pumpStatus || 'OFF'}</p>
                      </div>
                      <p className="text-xs text-gray-500">{(realtimeReadings[0] as any)?.pumpStatus === 'ON' ? 'Running normally' : 'Idle'}</p>
                    </div>

                    {/* Alert Level */}
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-amber-100">
                      <p className="text-xs text-gray-600 mb-2">Alert Level</p>
                      <p className="text-lg font-bold text-amber-600 mb-1">{(realtimeReadings[0] as any)?.alert || 'NORMAL'}</p>
                      <p className="text-xs text-gray-500">
                        {(realtimeReadings[0] as any)?.alert === 'NORMAL' ? 'Water level is optimal' : 'Check system status'}
                      </p>
                    </div>

                    {/* Rain Detection */}
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Signal Strength</p>
                      <p className="text-lg font-bold text-slate-600 mb-1">Strong</p>
                      <p className="text-xs text-gray-500">RSSI: -45 dBm</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live readings */}
              <div className="bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                  <FiTrendingUp size={15} className="text-blue-500" />
                  <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.liveReadings', language as 'en' | 'mg')}</h2>
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                {realtimeReadings.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">{t('dashboard.noReadings', language as 'en' | 'mg')}</p>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {realtimeReadings.map((reading, idx) => (
                      <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                          <span className="text-sm font-medium text-gray-800">
                            Lvl: {(reading as any)?.waterLevelPercent || reading.value}
                            {(reading as any)?.waterLevelPercent ? '%' : reading.unit}
                            {' | '}
                            Temp: {(reading as any)?.temperature || '—'}°C
                            {' | '}
                            Humidity: {(reading as any)?.humidity || '—'}%
                          </span>
                          <span className="text-xs text-gray-400 ml-3">
                            {new Date((reading as any)?.timestamp || reading.timestamp).toLocaleString()}
                          </span>
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
    </Layout>
  );
}







