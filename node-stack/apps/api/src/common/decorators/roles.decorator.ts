import { SetMetadata } from "@nestjs/common";
import type { Role } from "@node-stack/types";

export const ROLES_KEY = "required_roles";
export const Roles = (...roles: Role[]): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_KEY, roles);
