import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export const JoinWaitlistSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  name: z.string().max(100, "Name too long").trim().optional(),
  source: z.string().max(50).optional().default("marketing_site"),
});

export class JoinWaitlistDto extends createZodDto(JoinWaitlistSchema) {
  @ApiProperty({ example: "user@example.com", description: "Email address to join the waitlist" })
  declare email: string;

  @ApiPropertyOptional({ example: "John Doe", description: "Full name of the user" })
  declare name?: string;

  @ApiPropertyOptional({ example: "landing_page", description: "Source of the signup" })
  declare source: string;
}
