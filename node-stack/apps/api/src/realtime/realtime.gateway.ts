import { UseGuards, Logger } from '@nestjs/common';
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

import type { UserPayload } from '@/common/types/index.js';
import { WsJwtGuard } from '@/realtime/ws-jwt.guard.js';
import { WorkspacesService } from '@/workspaces/workspaces.service.js';

interface SocketWithUser extends Socket {
  data: {
    user: UserPayload;
  };
}

@WebSocketGateway({
  namespace: '/v1/realtime',
  cors: true,
  transports: ['websocket'],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly workspacesService: WorkspacesService,
  ) {}

  private readonly logger = new Logger(RealtimeGateway.name);

  @UseGuards(WsJwtGuard)
  async handleConnection(client: SocketWithUser): Promise<void> {
    const user = client.data.user;
    if (!user) {
      this.logger.warn(`Rejected connection: no user data attached.`);
      client.disconnect();
      return;
    }

    const { id: userId } = user;
    const workspaceId = client.handshake.query.workspaceId as string;

    // Join user-specific room
    await this.safeJoin(client, `user:${userId}`);

    if (workspaceId) {
      try {
        // Validate user is actually a member of this workspace
        await this.workspacesService.validateMembership(workspaceId, userId);

        // Join workspace-specific room
        await this.safeJoin(client, `workspace:${workspaceId}`);
        this.logger.log(`User ${userId} joined workspace:${workspaceId}`);
      } catch {
        this.logger.warn(`SECURITY: User ${userId} blocked from workspace:${workspaceId} - Unauthorized`);
        // We allow the connection to stay alive (for user notifications) but deny workspace room
      }
    } else {
      this.logger.log(`User ${userId} connected without workspace context.`);
    }

    this.logger.log(`Client connected: ${client.id} (user:${userId})`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('switch_workspace')
  @UseGuards(WsJwtGuard)
  async handleSwitchWorkspace(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() data: { from?: string; to: string },
  ): Promise<void> {
    const userId = client.data.user.id;

    try {
      // Validate membership before switching
      await this.workspacesService.validateMembership(data.to, userId);

      if (data.from) {
        await client.leave(`workspace:${data.from}`);
      }
      await this.safeJoin(client, `workspace:${data.to}`);
      this.logger.log(`User ${userId} switched to workspace:${data.to}`);
    } catch {
      this.logger.warn(`SECURITY: User ${userId} failed to switch to unauthorized workspace:${data.to}`);
    }
  }

  private async safeJoin(client: Socket, room: string): Promise<void> {
    // Basic format validation
    if (!room.startsWith('user:') && !room.startsWith('workspace:')) {
      this.logger.error(`INTERNAL ERROR: Attempted to join invalid room format: ${room}`);
      return;
    }
    await client.join(room);
  }

  // Helper method for other services to emit to rooms
  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToWorkspace(workspaceId: string, event: string, payload: unknown): void {
    this.server.to(`workspace:${workspaceId}`).emit(event, payload);
  }
}
