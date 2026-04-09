import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('EventsGateway');
  private deviceConnections: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove client from all device subscriptions
    this.deviceConnections.forEach((clients) => {
      clients.delete(client.id);
    });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, data: { deviceId: string }): void {
    const { deviceId } = data;
    
    if (!this.deviceConnections.has(deviceId)) {
      this.deviceConnections.set(deviceId, new Set());
    }
    
    const clients = this.deviceConnections.get(deviceId);
    if (clients) {
      clients.add(client.id);
    }
    this.logger.log(`Client ${client.id} subscribed to device ${deviceId}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, data: { deviceId: string }): void {
    const { deviceId } = data;
    
    if (this.deviceConnections.has(deviceId)) {
      const clients = this.deviceConnections.get(deviceId);
      if (clients) {
        clients.delete(client.id);
      }
    }
    
    this.logger.log(`Client ${client.id} unsubscribed from device ${deviceId}`);
  }

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }

  /**
   * Broadcast sensor reading to all connected clients subscribed to the device
   */
  broadcastSensorReading(deviceId: string, reading: any): void {
    const clients = this.deviceConnections.get(deviceId);
    
    if (clients && clients.size > 0) {
      clients.forEach((clientId) => {
        this.server.to(clientId).emit('sensorReading', {
          deviceId,
          reading,
          timestamp: new Date(),
        });
      });
      
      this.logger.debug(`Broadcasted reading for device ${deviceId} to ${clients.size} clients`);
    }
  }

  /**
   * Broadcast device status update to all connected clients
   */
  broadcastDeviceUpdate(deviceId: string, device: any): void {
    this.server.emit('deviceUpdated', {
      deviceId,
      device,
      timestamp: new Date(),
    });
    
    this.logger.debug(`Broadcasted device update for ${deviceId}`);
  }

  /**
   * Broadcast device created event
   */
  broadcastDeviceCreated(device: any): void {
    this.server.emit('deviceCreated', {
      device,
      timestamp: new Date(),
    });
    
    this.logger.debug(`Broadcasted device created event`);
  }

  /**
   * Broadcast device deleted event
   */
  broadcastDeviceDeleted(deviceId: string): void {
    this.server.emit('deviceDeleted', {
      deviceId,
      timestamp: new Date(),
    });
    
    this.logger.debug(`Broadcasted device deleted event`);
  }
}
