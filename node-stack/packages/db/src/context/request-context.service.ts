import { Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestStore {
  workspaceId?: string;
  userId?: string;
}

@Injectable({ scope: Scope.DEFAULT })
export class RequestContextService {
  private static storage = new AsyncLocalStorage<RequestStore>();

  /**
   * Runs a function within a specific context.
   */
  run<T>(store: RequestStore, callback: () => T): T {
    return RequestContextService.storage.run(store, callback);
  }

  /**
   * Gets the current context store.
   */
  getStore(): RequestStore | undefined {
    return RequestContextService.storage.getStore();
  }

  /**
   * Gets the current workspace ID from the context.
   */
  get workspaceId(): string | undefined {
    return this.getStore()?.workspaceId;
  }

  /**
   * Sets the workspace ID in the current context.
   * Note: This only works if a store is already initialized.
   */
  set workspaceId(value: string | undefined) {
    const store = this.getStore();
    if (store) {
      store.workspaceId = value;
    }
  }

  /**
   * Gets the current user ID from the context.
   */
  get userId(): string | undefined {
    return this.getStore()?.userId;
  }

  /**
   * Sets the user ID in the current context.
   */
  set userId(value: string | undefined) {
    const store = this.getStore();
    if (store) {
      store.userId = value;
    }
  }
}
