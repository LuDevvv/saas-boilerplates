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
  /**
   * Read the first `length` bytes of `key`. Used by the upload-confirm
   * flow to magic-byte-validate without streaming the whole object.
   */
  getObjectBytes(key: string, length: number): Promise<Uint8Array>;
  upload(options: {
    key: string;
    body: Buffer | string;
    contentType?: string;
    public?: boolean;
  }): Promise<void>;
  ping(): Promise<boolean>;
}
