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
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
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

  async getObjectBytes(key: string, length: number): Promise<Uint8Array> {
    const filePath = this.getFilePath(key);
    const handle = await fs.open(filePath, "r");
    try {
      const buf = Buffer.alloc(length);
      const { bytesRead } = await handle.read(buf, 0, length, 0);
      return new Uint8Array(buf.buffer, buf.byteOffset, bytesRead);
    } finally {
      await handle.close();
    }
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

  async ping(): Promise<boolean> {
    try {
      await fs.access(this.config.basePath);
      return true;
    } catch {
      return false;
    }
  }
}
