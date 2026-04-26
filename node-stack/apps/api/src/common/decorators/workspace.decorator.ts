import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { WorkspaceContext } from "@/common/types/index.js";

export const Workspace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.workspace as WorkspaceContext;
  },
);
