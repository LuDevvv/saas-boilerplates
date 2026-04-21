import * as fs from "fs/promises";
import * as path from "path";
import { IStorageProvider, FileMetadata } from "../interface.js";

export interface LocalStorageConfig {
  basePath: string;
  baseUrl: string;
}

export class LocalStorageProvider implements IStorageProvider {
  constructor(private config: LocalStorageConfig) {}

  private getFilePath(key: string): string {
    return path.join(this.config.basePath, key);
  }

  async getUploadUrl(key: string): Promise<string> {
    return `${this.config.baseUrl}/upload/${key}`;
  }

  async getDownloadUrl(key: string): Promise<string> {
    return `${this.config.baseUrl}/files/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  async headObject(key: string): Promise<FileMetadata> {
    const filePath = this.getFilePath(key);
    const stats = await fs.stat(filePath);
    return {
      contentLength: stats.size,
      contentType: undefined,
      lastModified: stats.mtime,
    };
  }

  async upload(options: {
    key: string;
    body: Buffer | string;
    contentType?: string;
    public?: boolean;
  }): Promise<void> {
    const filePath = this.getFilePath(options.key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, options.body);
  }
}
