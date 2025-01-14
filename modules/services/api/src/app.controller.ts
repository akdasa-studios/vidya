import { Controller, Get } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller()
export class AppController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  async getHello(): Promise<string[]> {
    return (await this.organizationsService.findAll()).map((org) => org.name);
  }
}
