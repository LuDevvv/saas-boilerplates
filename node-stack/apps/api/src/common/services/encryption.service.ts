import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EncryptionUtils } from "@node-stack/services";

@Injectable()
export class EncryptionService {
  private readonly utils: EncryptionUtils;

  constructor(private readonly config: ConfigService) {
    this.utils = new EncryptionUtils(this.config.get<string>("ENCRYPTION_KEY"));
  }

  get isEnabled(): boolean {
    return this.utils.isEnabled;
  }

  encrypt(plaintext: string): string {
    return this.utils.encrypt(plaintext);
  }

  decrypt(ciphertext: string): string {
    return this.utils.decrypt(ciphertext);
  }
}
