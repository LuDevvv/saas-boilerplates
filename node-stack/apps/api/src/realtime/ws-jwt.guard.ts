import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { TOKEN_TYPE } from '@/auth/constants.js';

interface JwtPayload {
  sub: string;
  email: string;
  sessionId: string;
  type: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authHeader = (client.handshake.auth as Record<string, string>)['token'] as string | undefined
        ?? client.handshake.headers.authorization;

      if (!authHeader) {
        throw new WsException('Unauthorized connection');
      }

      const parts = authHeader.split(' ');
      const token = parts[1] ?? authHeader;
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (payload.type !== TOKEN_TYPE.ACCESS) {
        throw new WsException('Invalid token type');
      }

      // Attach user to socket
      client.data = {
        ...client.data as Record<string, unknown>,
        user: {
          id: payload.sub,
          email: payload.email,
          sessionId: payload.sessionId,
        },
      };

      return true;
    } catch (err: unknown) {
      this.logger.error(`WS Authentication failed: ${(err as Error).message}`);
      return false;
    }
  }
}
