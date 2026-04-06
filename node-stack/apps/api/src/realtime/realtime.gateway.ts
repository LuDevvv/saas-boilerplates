import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';

@WebSocketGateway({
  namespace: '/v1/realtime',
  cors: true,
  transports: ['websocket'],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  @UseGuards(WsJwtGuard)
  async handleConnection(client: Socket) {
    const user = client.data.user;
    if (!user) {
      this.logger.warn(`Rejected connection: no user data attached.`);
      client.disconnect();
      return;
    }

    const { id: userId } = user;
    const workspaceId = client.handshake.query.workspaceId as string;

    // Join user-specific room
    await client.join(`user:${userId}`);

    if (workspaceId) {
      // Join workspace-specific room
      await client.join(`workspace:${workspaceId}`);
      this.logger.log(`User ${userId} joined workspace:${workspaceId}`);
    } else {
      this.logger.log(`User ${userId} connected without workspace context.`);
    }

    this.logger.log(`Client connected: ${client.id} (user:${userId})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('switch_workspace')
  @UseGuards(WsJwtGuard)
  async handleSwitchWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { from?: string; to: string },
  ) {
    if (data.from) {
      await client.leave(`workspace:${data.from}`);
    }
    await client.join(`workspace:${data.to}`);
    this.logger.log(`User ${client.data.user.id} switched to workspace:${data.to}`);
  }

  // Helper method for other services to emit to rooms
  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToWorkspace(workspaceId: string, event: string, payload: any) {
    this.server.to(`workspace:${workspaceId}`).emit(event, payload);
  }
}
