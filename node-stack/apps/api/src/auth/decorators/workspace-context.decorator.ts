import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export interface WorkspaceContextData {
  workspaceId: string;
  role: string;
}

export const WorkspaceContext = createParamDecorator(
  (data: keyof WorkspaceContextData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { workspace?: WorkspaceContextData }>();
    const workspace = request.workspace;
    return data ? workspace?.[data] : workspace;
  },
);
