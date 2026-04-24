import { Injectable, Logger } from "@nestjs/common";
import { MarketingRepository } from "@node-stack/db";
import { JoinWaitlistDto } from "@node-stack/validators";

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    private readonly marketingRepository: MarketingRepository,
  ) {}

  /**
   * Add a user to the waitlist
   */
  async joinWaitlist(dto: JoinWaitlistDto) {
    this.logger.log(`User joining waitlist: ${dto.email}`);
    
    return await this.marketingRepository.joinWaitlist({
      email: dto.email,
      name: dto.name,
      source: dto.source || "marketing_site",
    });
  }

  /**
   * Get waitlist count (for social proof)
   */
  async getWaitlistCount() {
    return await this.marketingRepository.getWaitlistCount();
  }
}
