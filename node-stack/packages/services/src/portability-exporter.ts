import { Injectable } from "@nestjs/common";
import { db, schema, eq } from "@node-stack/db";
import JSZip from "jszip";

type SanitizerFn = (val: unknown) => unknown;

/**
 * SanitizerRegistry defines rules for masking sensitive data on
 * portability exports. Each table maps a column name to the
 * function that produces the export-safe replacement value.
 */
export const SanitizerRegistry: Record<string, Record<string, SanitizerFn>> = {
  users: {
    passwordHash: () => null,
    twoFactorSecret: () => null,
    twoFactorRecoveryCodes: () => [],
  },
  apiKeys: {
    key: (val) => (typeof val === "string" ? val.substring(0, 8) + "..." : null),
    secretHash: () => "********",
  },
};

type ExportRecord = Record<string, unknown>;

@Injectable()
export class PortabilityExporter {
  /**
   * Recursively gathers data for a given workspace/user and returns a ZIP as Buffer.
   */
  async exportWorkspaceData(workspaceId: string): Promise<Buffer> {
    const data: ExportRecord = {};

    data.workspace = await db.query.workspaces.findFirst({
      where: eq(schema.workspaces.id, workspaceId),
    });
    data.memberships = await db.query.memberships.findMany({
      where: eq(schema.memberships.workspaceId, workspaceId),
    });
    data.aiLogs = await db.query.aiLogs.findMany({
      where: eq(schema.aiLogs.workspaceId, workspaceId),
    });
    data.webhooks = await db.query.webhookEndpoints.findMany({
      where: eq(schema.webhookEndpoints.workspaceId, workspaceId),
    });
    data.auditLogs = await db.query.auditLogs.findMany({
      where: eq(schema.auditLogs.workspaceId, workspaceId),
    });
    data.tasks = await db.query.tasks.findMany({
      where: eq(schema.tasks.workspaceId, workspaceId),
    });

    const sanitizedData = this.sanitizeExport(data);

    const zip = new JSZip();
    zip.file("data.json", JSON.stringify(sanitizedData, null, 2));
    zip.file(
      "manifest.json",
      JSON.stringify(
        {
          version: "1.0",
          workspaceId,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    return zip.generateAsync({ type: "nodebuffer" });
  }

  private sanitizeExport(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeExport(item));
    }

    if (data !== null && typeof data === "object") {
      const sanitized: ExportRecord = {};
      for (const [key, value] of Object.entries(data as ExportRecord)) {
        const next = this.applySanitization(key, value);
        sanitized[key] =
          next !== null && typeof next === "object"
            ? this.sanitizeExport(next)
            : next;
      }
      return sanitized;
    }

    return data;
  }

  private applySanitization(key: string, value: unknown): unknown {
    const sensitiveKeys = [
      "passwordHash",
      "twoFactorSecret",
      "twoFactorRecoveryCodes",
      "key",
      "secretHash",
    ];

    if (!sensitiveKeys.includes(key)) {
      return value;
    }

    for (const tableRules of Object.values(SanitizerRegistry)) {
      const fn = tableRules[key];
      if (fn) {
        return fn(value);
      }
    }
    return null;
  }
}
