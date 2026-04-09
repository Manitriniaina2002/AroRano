import React, { useEffect, useState } from 'react';
import { api, Device, DeviceStats, SensorReading } from '@/lib/api';
import { websocket, SensorReadingEvent } from '@/lib/websocket';

export default function DevicesDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [realtimeReadings, setRealtimeReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'temperature',
    location: '',
  });

  // Initialize WebSocket connection and load data
  useEffect(() => {
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
        setError(err instanceof Error ? err.message : 'Failed to load devices');
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
      setError(err instanceof Error ? err.message : 'Failed to create device');
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    try {
      await api.devices.delete(deviceId);
      setSelectedDevice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>⏳ Loading devices...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📊 IoT Device Monitoring Dashboard</h1>
        <div style={{ fontSize: '14px', color: wsConnected ? '#4caf50' : '#f44336' }}>
          {wsConnected ? '🟢 WebSocket Connected' : '🔴 WebSocket Disconnected'}
        </div>
      </div>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
          ❌ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '20px' }}>
        {/* Device List */}
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <h2>Devices ({devices.length})</h2>

          {devices.length === 0 ? (
            <p style={{ color: '#999' }}>No devices yet</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {devices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: selectedDevice?.id === device.id ? '#2196f3' : '#fff',
                    color: selectedDevice?.id === device.id ? '#fff' : '#000',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: selectedDevice?.id === device.id ? '2px solid #1976d2' : '1px solid #ddd',
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{device.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {device.type} • {device.location}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                    Status: <span style={{ color: device.status === 'active' ? '#4caf50' : '#f44336' }}>
                      {device.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '15px',
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Device'}
          </button>

          {showAddForm && (
            <form onSubmit={handleAddDevice} style={{ marginTop: '15px' }}>
              <input
                type="text"
                placeholder="Device name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="temperature">🌡️ Temperature</option>
                <option value="humidity">💧 Humidity</option>
                <option value="motion">🚀 Motion</option>
                <option value="pressure">📈 Pressure</option>
                <option value="light">💡 Light</option>
              </select>
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Create Device
              </button>
            </form>
          )}
        </div>

        {/* Device Details */}
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          {selectedDevice ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{selectedDevice.name}</h2>
                <button
                  onClick={() => handleDeleteDevice(selectedDevice.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>

              <div style={{ gridTemplateColumns: '1fr 1fr', gap: '15px', display: 'grid', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Type</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedDevice.type}</div>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Location</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedDevice.location}</div>
                </div>
              </div>

              {stats && (
                <div>
                  <h3>📊 Statistics</h3>
                  <div style={{ gridTemplateColumns: '1fr 1fr', gap: '15px', display: 'grid' }}>
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Average</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
                        {stats.average.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Latest</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                        {stats.latest?.value === undefined ? 'N/A' : stats.latest.value.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Min</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                        {stats.min.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>Max</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
                        {stats.max.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#999' }}>Select a device to view details</p>
          )}
        </div>

        {/* Real-time Readings */}
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <h3>📈 Live Readings</h3>
          
          {realtimeReadings.length === 0 ? (
            <p style={{ color: '#999' }}>No readings yet</p>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {realtimeReadings.map((reading, idx) => (
                <div
                  key={reading.id}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: idx === 0 ? '#e8f5e9' : '#fff',
                    borderRadius: '4px',
                    borderLeft: '4px solid ' + (idx === 0 ? '#4caf50' : '#ddd'),
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{reading.value.toFixed(2)} {reading.unit}</strong>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {idx === 0 && (
                    <div style={{ fontSize: '11px', color: '#4caf50', marginTop: '4px' }}>
                      🟢 Just now
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
