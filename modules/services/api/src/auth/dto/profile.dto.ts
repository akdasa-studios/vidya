import { ApiProperty } from '@nestjs/swagger';
import * as protocol from '@vidya/protocol';

export class GetProfileResponse implements protocol.GetProfileResponse {
  constructor(options: { userId: string; email: string; name: string }) {
    this.userId = options.userId;
    this.email = options.email;
    this.name = options.name;
  }

  @ApiProperty({ example: 'ed369256-2db0-46b8-ad49-b2b7a1bed036' })
  userId: string;

  @ApiProperty({ example: 'example@example.com' })
  email: string;

  @ApiProperty({ example: 'name' })
  name: string;
}
