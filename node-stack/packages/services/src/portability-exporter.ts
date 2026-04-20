import { Injectable } from "@nestjs/common";
import { db, schema, eq } from "@node-stack/db";
import JSZip from "jszip";

/**
 * SanitizerRegistry defines rules for masking sensitive data.
 */
export const SanitizerRegistry = {
  users: {
    passwordHash: () => null,
    twoFactorSecret: () => null,
    twoFactorRecoveryCodes: () => [],
  },
  apiKeys: {
    key: (val: string) => val.substring(0, 8) + '...',
    secretHash: () => '********',
  }
};

@Injectable()
export class PortabilityExporter {
  /**
   * Recursively gathers data for a given workspace/user and returns a ZIP as Buffer.
   */
  async exportWorkspaceData(workspaceId: string): Promise<Buffer> {
    const data: Record<string, any> = {};

    // 1. Workspace Info
    data.workspace = await db.query.workspaces.findFirst({
      where: eq(schema.workspaces.id, workspaceId),
    });

    // 2. Memberships
    data.memberships = await db.query.memberships.findMany({
      where: eq(schema.memberships.workspaceId, workspaceId),
    });

    // 3. AI Logs
    data.aiLogs = await db.query.aiLogs.findMany({
      where: eq(schema.aiLogs.workspaceId, workspaceId),
    });

    // 4. Webhooks
    data.webhooks = await db.query.webhookEndpoints.findMany({
      where: eq(schema.webhookEndpoints.workspaceId, workspaceId),
    });

    // 5. Audit Logs
    data.auditLogs = await db.query.auditLogs.findMany({
      where: eq(schema.auditLogs.workspaceId, workspaceId),
    });

    // 6. Tasks
    data.tasks = await db.query.tasks.findMany({
      where: eq(schema.tasks.workspaceId, workspaceId),
    });

    // Sanitize
    const sanitizedData = this.sanitizeExport(data);

    // Create ZIP
    const zip = new JSZip();
    zip.file("data.json", JSON.stringify(sanitizedData, null, 2));
    zip.file("manifest.json", JSON.stringify({
      version: "1.0",
      workspaceId,
      exportedAt: new Date().toISOString(),
    }, null, 2));

    return await zip.generateAsync({ type: "nodebuffer" });
  }

  private sanitizeExport(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeExport(item));
    }

    if (data !== null && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.applySanitization(key, value);
        if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeExport(sanitized[key]);
        }
      }
      return sanitized;
    }

    return data;
  }

  private applySanitization(key: string, value: any): any {
    const sensitiveKeys = [
      'passwordHash', 
      'twoFactorSecret', 
      'twoFactorRecoveryCodes',
      'key',
      'secretHash'
    ];

    if (sensitiveKeys.includes(key)) {
      const tableRules = Object.values(SanitizerRegistry).find(r => r.hasOwnProperty(key));
      if (tableRules && (tableRules as any)[key]) {
        return (tableRules as any)[key](value);
      }
      return null;
    }

    return value;
  }
}
