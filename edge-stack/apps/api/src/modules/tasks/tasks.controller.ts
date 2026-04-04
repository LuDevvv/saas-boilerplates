import type { Context } from "hono";
import type { AppContext } from "../../common/types/env";
import { createDbClient } from "@workspace/db";
import { createTasksService } from "@workspace/services";
import { successResponse } from "../../common/responses";

/**
 * Controller for handling Task-related HTTP requests.
 */
export const TasksController = {
  /**
   * Lists all tasks for the active workspace.
   */
  async list(c: Context<AppContext>) {
    const db = createDbClient(c.env.DATABASE_URL);
    const workspaceId = c.get("workspaceId")!;
    const service = createTasksService(db);
    const items = await service.list(workspaceId);

    return c.json(
      successResponse(
        items.map((i) => ({
          ...i,
          createdAt: new Date(i.createdAt).toISOString(),
          updatedAt: new Date(i.updatedAt).toISOString(),
        })),
      ),
      200,
    );
  },

  /**
   * Creates a new task in the active workspace.
   */
  async create(c: Context<AppContext>) {
    const db = createDbClient(c.env.DATABASE_URL);
    const workspaceId = c.get("workspaceId")!;
    const data = await c.req.json();
    const service = createTasksService(db);

    const item = await service.create(workspaceId, data);

    return c.json(
      successResponse({
        ...item,
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString(),
      }),
      201,
    );
  },
};
