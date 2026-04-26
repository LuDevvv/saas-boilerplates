import { Injectable, Logger, NotFoundException, Inject, ForbiddenException } from "@nestjs/common";
import { schema, eq, and, desc, DB_TOKEN, type Database } from "@node-stack/db";
import type { IStorageProvider } from "@node-stack/storage";
import { v4 as uuidv4 } from 'uuid';

import { JobService } from "@/common/queues/job.service.js";

@Injectable()
export class PortabilityService {
  private readonly logger = new Logger(PortabilityService.name);

  constructor(
    @Inject(DB_TOKEN) private readonly db: Database,
    private readonly jobService: JobService,
    @Inject("STORAGE_SERVICE") private readonly storage: IStorageProvider,
  ) { }

  /**
   * Triggers a new data export request.
   */
  async requestExport(workspaceId: string, userId: string) {
    const requestId = uuidv4();

    // 1. Create request in DB
    await this.db.insert(schema.portabilityRequests).values({
      id: requestId,
      workspaceId,
      userId,
      status: 'pending',
    });

    // 2. Queue the background job
    await this.jobService.addPortabilityJob({
      requestId,
      workspaceId,
      userId,
    });

    this.logger.log(`Portability export requested: ${requestId} for workspace ${workspaceId}`);
    return { requestId, status: 'pending' };
  }

  async listRequests(workspaceId: string) {
    return this.db.query.portabilityRequests.findMany({
      where: eq(schema.portabilityRequests.workspaceId, workspaceId),
      orderBy: [desc(schema.portabilityRequests.createdAt)],
    });
  }

  async getRequest(id: string, workspaceId: string) {
    const request = await this.db.query.portabilityRequests.findFirst({
      where: and(
        eq(schema.portabilityRequests.id, id),
        eq(schema.portabilityRequests.workspaceId, workspaceId)
      ),
    });

    if (!request) {
      throw new NotFoundException("Export request not found");
    }

    return request;
  }

  async getDownloadUrl(id: string, workspaceId: string, userId: string) {
    const request = await this.getRequest(id, workspaceId);

    if (request.status !== "completed") {
      throw new ForbiddenException("Export is not ready for download");
    }

    // Generate a temporary presigned URL from the storage provider
    // The key is typically 'exports/{workspaceId}/{requestId}.zip'
    const key = `exports/${workspaceId}/${id}.zip`;
    const url = await this.storage.getDownloadUrl(key, 3600); // 1 hour valid

    this.logger.log(`Download URL generated for export ${id} by user ${userId}`);
    return { url };
  }
}
