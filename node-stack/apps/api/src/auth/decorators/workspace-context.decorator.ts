import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface WorkspaceContextData {
  workspaceId: string;
  role: string;
}

export const WorkspaceContext = createParamDecorator(
  (data: keyof WorkspaceContextData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const workspace = request.workspace as WorkspaceContextData;
    return data ? workspace?.[data] : workspace;
  },
);
