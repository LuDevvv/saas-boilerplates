import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({
    description: 'New password to be set',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
