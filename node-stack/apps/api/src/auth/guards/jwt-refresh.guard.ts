import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Observable } from "rxjs";
// TOKEN_TYPE not required here

@Injectable()
export class JwtRefreshGuard extends AuthGuard("jwt-refresh") {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
