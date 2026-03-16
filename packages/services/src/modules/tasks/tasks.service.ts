import {
  type Database,
  TaskRepository,
  type Task,
  type NewTask,
} from "@workspace/db";

/**
 * Service for managing tasks lifecycle and business logic.
 * Decoupled from the HTTP layer.
 */
export const createTasksService = (db: Database) => {
  return {
    /**
     * Lists all tasks for a given workspace.
     */
    list: async (workspaceId: string): Promise<Task[]> => {
      return await TaskRepository.getWorkspaceTasks(db, workspaceId);
    },

    /**
     * Creates a new Task within a workspace.
     */
    create: async (
      workspaceId: string,
      data: { title: string },
    ): Promise<Task> => {
      const newTask: NewTask = {
        ...data,
        workspaceId,
      };

      return await TaskRepository.createTask(db, newTask);
    },

    /**
     * Finds a specific Task by ID with workspace isolation.
     */
    findById: async (workspaceId: string, id: string): Promise<Task | null> => {
      const item = await TaskRepository.getTaskById(db, id, workspaceId);
      return item || null;
    },
  };
};

export type TasksService = ReturnType<typeof createTasksService>;
