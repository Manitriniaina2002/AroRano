# WebSocket Testing Guide

## Real-Time Sensor Data Streaming

The AroRano IoT platform uses WebSockets for real-time sensor data streaming. When your physical IoT devices send sensor readings to the API, they're instantly broadcast to all connected dashboard clients.

## How It Works

1. **Connection**: Dashboard connects to WebSocket server when loaded
2. **Subscription**: Client subscribes to specific device(s) for real-time updates
3. **Broadcasting**: When a sensor reading is added, all subscribed clients receive it instantly
4. **Live Updates**: Dashboard updates statistics and displays new readings in real-time

## Testing WebSocket

### Method 1: Using the Dashboard UI

1. Start both backend and frontend
2. Open http://localhost:3000/dashboard
3. Create a device (or use existing one)
4. Use the testing script below to send sensor data
5. Watch the "Live Readings" panel update in real-time

### Method 2: Using cURL to Send Sensor Data

```bash
# Get device ID first
curl http://localhost:3001/api/devices

# Add a sensor reading
curl -X POST http://localhost:3001/api/devices/{DEVICE_ID}/readings \
  -H "Content-Type: application/json" \
  -d '{
    "value": 22.5,
    "unit": "°C"
  }'
```

### Method 3: Using Node.js Test Script

Create `test-websocket.js`:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
  
  // Subscribe to a device (replace with actual device ID)
  const deviceId = 'YOUR_DEVICE_ID';
  socket.emit('subscribe', { deviceId });
  console.log(`📡 Subscribed to device: ${deviceId}`);
});

socket.on('sensorReading', (data) => {
  console.log('📊 New sensor reading received:');
  console.log(data);
});

socket.on('deviceCreated', (data) => {
  console.log('🆕 Device created:');
  console.log(data);
});

socket.on('deviceUpdated', (data) => {
  console.log('✏️ Device updated:');
  console.log(data);
});

socket.on('deviceDeleted', (data) => {
  console.log('🗑️ Device deleted:');
  console.log(data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket');
});

// Send a test reading every 5 seconds
let counter = 0;
const fetch = require('node-fetch');

setInterval(async () => {
  try {
    const deviceId = 'YOUR_DEVICE_ID';
    const value = 20 + Math.random() * 10; // Random temp between 20-30°C
    
    const response = await fetch(`http://localhost:3001/api/devices/${deviceId}/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, unit: '°C' }),
    });
    
    console.log(`\n📤 Sent reading #${++counter}: ${value.toFixed(2)}°C`);
  } catch (error) {
    console.error('Error sending reading:', error);
  }
}, 5000);
```

Run with:
```bash
npm install socket.io-client node-fetch
node test-websocket.js
```

## WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe` | `{ deviceId: string }` | Subscribe to device updates |
| `unsubscribe` | `{ deviceId: string }` | Unsubscribe from device |
| `ping` | - | Health check |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `sensorReading` | `{ deviceId, reading, timestamp }` | New sensor data received |
| `deviceCreated` | `{ device, timestamp }` | Device created |
| `deviceUpdated` | `{ deviceId, device, timestamp }` | Device updated |
| `deviceDeleted` | `{ deviceId, timestamp }` | Device deleted |

## Features

✅ **Real-time Sensor Data**: Instant updates from IoT devices  
✅ **Automatic Reconnection**: Handles connection drops gracefully  
✅ **Selective Subscriptions**: Only receive data from subscribed devices  
✅ **Statistics Auto-Update**: Min/Max/Average update in real-time  
✅ **Device Lifecycle Events**: Get notified of device CRUD operations  
✅ **Dual Transport**: WebSocket with HTTP Long-Polling fallback

## Troubleshooting

### WebSocket connection fails
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify frontend NEXT_PUBLIC_API_URL is correct

### Not receiving real-time updates
- Check if subscribed to correct device ID
- Verify readings are being sent to API
- Check browser DevTools → Network → WebSocket

### Dashboard shows "Disconnected"
- Refresh the page
- Restart backend server
- Check network connectivity

## Performance Tips

- Subscribe to only the devices you're monitoring
- Unsubscribe when leaving the dashboard
- The system keeps last 1000 readings for stats calculation
- Live readings panel shows most recent 20 readings

## Integration with IoT Devices

Your physical IoT devices should send sensor data via HTTP POST:

```bash
POST /api/devices/{DEVICE_ID}/readings
Content-Type: application/json

{
  "value": 22.5,
  "unit": "°C"
}
```

The backend will automatically:
1. Save the reading to database
2. Calculate updated statistics
3. Broadcast to all connected clients via WebSocket
4. Update dashboard in real-time
