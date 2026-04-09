'use client';

import React, { useEffect, useState } from 'react';
import { api, Device, DeviceStats, SensorReading } from '@/lib/api';
import { websocket, SensorReadingEvent } from '@/lib/websocket';
import { colors, spacing, styles } from '@/lib/theme';
import { t, getLanguage } from '@/lib/i18n';
import { AppHeader } from '@/components/AppHeader';
import {
  FiPlus,
  FiTrash2,
  FiChevronRight,
  FiTrendingUp,
  FiAlertCircle,
  FiCheck,
  FiXCircle,
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
      setRealtimeReadings(data.slice(0, 20));
    } catch (err) {
      console.error('Error loading readings:', err);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.devices.create({
        name: formData.name,
        type: formData.type,
        location: formData.location,
        status: 'active',
      });
      setFormData({ name: '', type: 'temperature', location: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', language as 'en' | 'mg'));
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm(t('dashboard.confirmDelete', language as 'en' | 'mg'))) return;
    try {
      await api.devices.delete(deviceId);
      setSelectedDevice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', language as 'en' | 'mg'));
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
        <AppHeader title={t('dashboard.title')} />
        <div style={{ ...styles.container, padding: spacing.xl, textAlign: 'center' }}>
          <p style={{ ...styles.text, color: colors.gray500 }}>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <AppHeader title={t('dashboard.title')} />

      <main style={styles.container}>
        {/* Top Status Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: colors.gray500 }}>
              {t('dashboard.websocketStatus')}
            </span>
            <div
              style={{
                display: 'flex',
                gap: spacing.sm,
                alignItems: 'center',
                padding: `${spacing.sm} ${spacing.md}`,
                backgroundColor: wsConnected ? colors.successLight : colors.dangerLight,
                borderRadius: '6px',
              }}
            >
              {wsConnected ? (
                <>
                  <FiCheck size={16} style={{ color: colors.success }} />
                  <span style={{ fontSize: '12px', fontWeight: '500', color: colors.success }}>
                    {t('dashboard.websocketConnected')}
                  </span>
                </>
              ) : (
                <>
                  <FiXCircle size={16} style={{ color: colors.danger }} />
                  <span style={{ fontSize: '12px', fontWeight: '500', color: colors.danger }}>
                    {t('dashboard.websocketDisconnected')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              ...styles.alertDanger,
              marginBottom: spacing.lg,
              display: 'flex',
              gap: spacing.md,
              alignItems: 'flex-start',
            }}
          >
            <FiAlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Main Grid - Responsive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing.lg,
            marginTop: spacing.lg,
          }}
        >
          {/* Device List Column */}
          <div
            style={{
              gridColumn: 'span 1',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.border}` }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {t('dashboard.deviceCount', language as 'en' | 'mg').replace('{count}', devices.length.toString())}
              </h2>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', padding: spacing.md }}>
              {devices.length === 0 ? (
                <p style={{ ...styles.textMuted, textAlign: 'center', padding: spacing.lg }}>
                  {t('dashboard.noDevices')}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  {devices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDevice(device)}
                      style={{
                        padding: spacing.md,
                        backgroundColor: selectedDevice?.id === device.id ? colors.primary : colors.gray100,
                        color: selectedDevice?.id === device.id ? '#ffffff' : colors.text,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.md,
                      }}
                      onMouseEnter={(e) => {
                        if (selectedDevice?.id !== device.id) {
                          e.currentTarget.style.backgroundColor = colors.gray200;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedDevice?.id !== device.id) {
                          e.currentTarget.style.backgroundColor = colors.gray100;
                        }
                      }}
                    >
                      <div style={{ fontSize: '20px' }}>{deviceIcons[device.type] || <FiZap />}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{device.name}</div>
                        <div
                          style={{
                            fontSize: '12px',
                            opacity: 0.7,
                            marginTop: '2px',
                          }}
                        >
                          {device.location}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            marginTop: '4px',
                            display: 'inline-block',
                            padding: '2px 6px',
                            backgroundColor: device.status === 'active' ? colors.successLight : colors.warningLight,
                            color: device.status === 'active' ? colors.success : colors.warning,
                            borderRadius: '4px',
                          }}
                        >
                          {device.status}
                        </div>
                      </div>
                      {selectedDevice?.id === device.id && <FiChevronRight size={18} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: spacing.md, borderTop: `1px solid ${colors.border}` }}>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  width: '100%',
                  ...styles.buttonPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.sm,
                }}
              >
                <FiPlus size={18} />
                {showAddForm ? t('dashboard.cancelAdd') : t('dashboard.addDevice')}
              </button>

              {showAddForm && (
                <form onSubmit={handleAddDevice} style={{ marginTop: spacing.md }}>
                  <input
                    type="text"
                    placeholder={t('dashboard.deviceName')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ ...styles.input, width: '100%', marginBottom: spacing.md }}
                  />
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ ...styles.select, width: '100%', marginBottom: spacing.md }}
                  >
                    <option value="temperature">{t('dashboard.temperature')}</option>
                    <option value="humidity">{t('dashboard.humidity')}</option>
                    <option value="motion">{t('dashboard.motion')}</option>
                    <option value="pressure">{t('dashboard.pressure')}</option>
                    <option value="light">{t('dashboard.light')}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={t('common.location')}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    style={{ ...styles.input, width: '100%', marginBottom: spacing.md }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      ...styles.buttonPrimary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    <FiPlus size={16} />
                    {t('dashboard.createDevice')}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Device Details Column */}
          <div
            style={{
              gridColumn: 'span 2',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: spacing.lg,
            }}
          >
            {selectedDevice ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.lg,
                    paddingBottom: spacing.lg,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                    <div style={{ fontSize: '32px' }}>{deviceIcons[selectedDevice.type] || <FiZap />}</div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>{selectedDevice.name}</h2>
                  </div>
                  <button
                    onClick={() => handleDeleteDevice(selectedDevice.id)}
                    style={{
                      ...styles.buttonDanger,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                    }}
                  >
                    <FiTrash2 size={16} />
                    {t('dashboard.deleteDevice')}
                  </button>
                </div>

                {/* Device Info Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: spacing.md,
                    marginBottom: spacing.lg,
                  }}
                >
                  <div style={{ ...styles.cardCompact }}>
                    <div style={{ fontSize: '12px', color: colors.gray500, marginBottom: '4px' }}>
                      {t('common.type')}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedDevice.type}</div>
                  </div>
                  <div style={{ ...styles.cardCompact }}>
                    <div style={{ fontSize: '12px', color: colors.gray500, marginBottom: '4px' }}>
                      {t('common.location')}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{selectedDevice.location}</div>
                  </div>
                </div>

                {/* Statistics */}
                {stats && (
                  <div>
                    <h3 style={{ margin: `0 0 ${spacing.md} 0`, fontSize: '18px', fontWeight: '600' }}>
                      {t('dashboard.statistics')}
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: spacing.md,
                      }}
                    >
                      <div style={{ ...styles.cardCompact, backgroundColor: colors.primaryLight }}>
                        <div style={{ fontSize: '12px', color: colors.primary, marginBottom: '4px' }}>
                          {t('common.average')}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>
                          {stats.average.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ ...styles.cardCompact, backgroundColor: colors.successLight }}>
                        <div style={{ fontSize: '12px', color: colors.success, marginBottom: '4px' }}>
                          {t('common.latest')}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: colors.success }}>
                          {stats.latest?.value === undefined ? 'N/A' : stats.latest.value.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ ...styles.cardCompact, backgroundColor: colors.warningLight }}>
                        <div style={{ fontSize: '12px', color: colors.warning, marginBottom: '4px' }}>
                          {t('common.minimum')}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: colors.warning }}>
                          {stats.min.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ ...styles.cardCompact, backgroundColor: colors.dangerLight }}>
                        <div style={{ fontSize: '12px', color: colors.danger, marginBottom: '4px' }}>
                          {t('common.maximum')}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: colors.danger }}>
                          {stats.max.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: spacing.xl }}>
                <FiActivity size={48} style={{ color: colors.gray300, marginBottom: spacing.md }} />
                <p style={{ ...styles.textMuted }}>{t('dashboard.selectDevice')}</p>
              </div>
            )}
          </div>

          {/* Live Readings Column */}
          <div
            style={{
              gridColumn: 'span 1',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.border}` }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <FiTrendingUp size={18} />
                {t('dashboard.liveReadings')}
              </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', padding: spacing.md }}>
              {realtimeReadings.length === 0 ? (
                <p style={{ ...styles.textMuted, textAlign: 'center', padding: spacing.lg }}>
                  {t('dashboard.noReadings')}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  {realtimeReadings.map((reading, idx) => (
                    <div
                      key={reading.id}
                      style={{
                        padding: spacing.md,
                        backgroundColor: idx === 0 ? colors.successLight : colors.gray100,
                        borderRadius: '6px',
                        borderLeft: `3px solid ${idx === 0 ? colors.success : colors.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px',
                        }}
                      >
                        <strong style={{ fontSize: '16px' }}>
                          {reading.value.toFixed(2)} {reading.unit}
                        </strong>
                        <span style={{ fontSize: '12px', color: colors.gray500 }}>
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {idx === 0 && (
                        <div style={{ fontSize: '11px', color: colors.success, marginTop: '4px', fontWeight: '500' }}>
                          {t('dashboard.justNow')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          div[style*="gridColumn"] {
            grid-column: span 1 !important;
          }
        }

        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
