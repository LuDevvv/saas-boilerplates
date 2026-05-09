import { randomUUID } from "crypto";

import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

interface RequestWithId extends Request {
  requestId?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const requestId =
      (req.headers["x-request-id"] as string) ||
      (req.headers["X-Request-Id"] as string) ||
      randomUUID();

    // Attach to request for logging and downstream use
    req.requestId = requestId;

    // Set response header for client and error responses
    res.setHeader("X-Request-ID", requestId);

    next();
  }
}
