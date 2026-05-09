import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import type { UserPayload } from "@/common/types/index.js";

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: UserPayload }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
