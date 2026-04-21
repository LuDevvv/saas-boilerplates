import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { UserPayload } from "../../common/types/index.js";

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload;
    return data ? user?.[data] : user;
  },
);
