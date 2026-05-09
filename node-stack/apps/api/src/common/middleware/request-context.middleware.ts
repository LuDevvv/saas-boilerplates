import { Injectable, NestMiddleware } from '@nestjs/common';
import { RequestContextService } from '@node-stack/db';
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
  user?: { id?: string };
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: RequestContextService) {}

  use(req: RequestWithUser, _res: Response, next: NextFunction): void {
    // Initialize context with whatever we have at this point
    // We can't know the workspaceId yet if it depends on Auth/Guards
    // unless it's in a header.
    const workspaceId = req.headers['x-workspace-id'] as string;
    const userId = req.user?.id;

    this.contextService.run({ workspaceId, userId }, () => {
      next();
    });
  }
}
