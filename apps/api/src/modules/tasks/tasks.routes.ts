import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authGuard } from "../../common/middlewares/authGuard";
import { workspaceGuard } from "../../common/middlewares/workspaceGuard";
import { ErrorSchema } from "@workspace/validators";
import { createDbClient } from "@workspace/db";
import type { AppContext } from "../../common/types/env";
import { TasksController } from "./tasks.controller";

const app = new OpenAPIHono<AppContext>();

// Note: In production, define real schemas in packages/validators
const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  workspaceId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tasks"],
  summary: "List all tasks",
  middleware: [authGuard, workspaceGuard] as const,
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), data: z.array(TaskSchema) }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

export const tasksRouter = app.openapi(listRoute, TasksController.list);
