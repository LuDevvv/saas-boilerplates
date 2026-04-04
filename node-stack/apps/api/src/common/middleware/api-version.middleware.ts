import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

export interface VersionedRequest extends Request {
  apiVersion: number;
}

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const versionMatch = req.path.match(/^\/v(\d+)/);
    if (versionMatch) {
      (req as VersionedRequest).apiVersion = parseInt(versionMatch[1]);
    } else {
      (req as VersionedRequest).apiVersion = 1;
    }
    next();
  }
}
