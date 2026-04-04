import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { WorkspaceContext } from "../types";

export const Workspace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.workspace as WorkspaceContext;
  },
);
