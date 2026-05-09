import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { WorkspaceContext } from "@/common/types/index.js";

export const Workspace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WorkspaceContext | undefined => {
    const req = ctx.switchToHttp().getRequest<{ workspace?: WorkspaceContext }>();
    return req.workspace;
  },
);
