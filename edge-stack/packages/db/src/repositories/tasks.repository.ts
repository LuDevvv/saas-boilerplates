import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../db";
import { tasks, type Task, type NewTask } from "../schema/tasks";

/**
 * Repository for Task-related database operations.
 * Implements strict multi-tenant data isolation via workspaceId.
 */
export const TaskRepository = {
  /**
   * Creates a new task.
   * @param db - Database instance
   * @param data - Task creation data
   */
  async createTask(db: Database, data: NewTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(data).returning();
    if (!task) throw new Error("Failed to create task");
    return task;
  },

  /**
   * Retrieves all tasks for a specific workspace.
   * @param db - Database instance
   * @param workspaceId - The workspace owner of the tasks
   */
  async getWorkspaceTasks(db: Database, workspaceId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, workspaceId))
      .orderBy(tasks.createdAt);
  },

  /**
   * Retrieves a single task by ID within a workspace.
   * @param db - Database instance
   * @param id - Task ID
   * @param workspaceId - Workspace ID for isolation
   */
  async getTaskById(
    db: Database,
    id: string,
    workspaceId: string,
  ): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspaceId)));
    return task;
  },

  /**
   * Updates a task.
   * @param db - Database instance
   * @param id - Task ID
   * @param workspaceId - Workspace ID for isolation
   * @param data - Partial task data
   */
  async updateTask(
    db: Database,
    id: string,
    workspaceId: string,
    data: Partial<NewTask>,
  ): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...data, updatedAt: sql`now()` })
      .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspaceId)))
      .returning();
    return updatedTask;
  },

  /**
   * Deletes a task.
   * @param db - Database instance
   * @param id - Task ID
   * @param workspaceId - Workspace ID for isolation
   */
  async deleteTask(
    db: Database,
    id: string,
    workspaceId: string,
  ): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspaceId)));
    return !!result;
  },
};
