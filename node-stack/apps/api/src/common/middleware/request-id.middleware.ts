import { randomUUID } from "crypto";

import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      (req.headers["x-request-id"] as string) ||
      (req.headers["X-Request-Id"] as string) ||
      randomUUID();

    // Attach to request for logging and downstream use
    (req as any).requestId = requestId;

    // Set response header for client and error responses
    res.setHeader("X-Request-ID", requestId);

    next();
  }
}
