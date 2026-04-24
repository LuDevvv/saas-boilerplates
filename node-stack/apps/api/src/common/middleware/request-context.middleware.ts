import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from '@node-stack/db';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Initialize context with whatever we have at this point
    // We can't know the workspaceId yet if it depends on Auth/Guards
    // unless it's in a header.
    const workspaceId = req.headers['x-workspace-id'] as string;
    const userId = (req as any).user?.id;

    this.contextService.run({ workspaceId, userId }, () => {
      next();
    });
  }
}
