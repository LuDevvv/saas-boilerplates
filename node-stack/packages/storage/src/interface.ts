export interface FileMetadata {
  contentLength?: number;
  contentType?: string;
  lastModified?: Date;
}

export interface IStorageProvider {
  getUploadUrl(key: string, contentType: string, expires?: number): Promise<string>;
  getDownloadUrl(key: string, expires?: number): Promise<string>;
  delete(key: string): Promise<void>;
  headObject(key: string): Promise<FileMetadata>;
  upload(options: {
    key: string;
    body: Buffer | string;
    contentType?: string;
    public?: boolean;
  }): Promise<void>;
}
