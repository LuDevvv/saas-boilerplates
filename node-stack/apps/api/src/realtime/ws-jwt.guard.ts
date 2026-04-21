import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TOKEN_TYPE } from '../auth/constants.js';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authHeader = client.handshake.auth.token || client.handshake.headers.authorization;

      if (!authHeader) {
        throw new WsException('Unauthorized connection');
      }

      const token = authHeader.split(' ')[1] || authHeader;
      const payload = await this.jwtService.verifyAsync(token);

      if (payload.type !== TOKEN_TYPE.ACCESS) {
        throw new WsException('Invalid token type');
      }

      // Attach user to socket
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        sessionId: payload.sessionId,
      };

      return true;
    } catch (err) {
      this.logger.error(`WS Authentication failed: ${err.message}`);
      return false;
    }
  }
}
