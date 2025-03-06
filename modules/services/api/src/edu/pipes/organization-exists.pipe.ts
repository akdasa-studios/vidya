import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { OrganizationsService } from '@vidya/api/edu/services';

@Injectable()
export class OrganizationExistsPipe implements PipeTransform {
  constructor(private readonly organizationsService: OrganizationsService) {}

  async transform(value: string) {
    const role = await this.organizationsService.findOneBy({ id: value });
    if (!role) {
      throw new NotFoundException(`Organization with ID ${value} not found`);
    }
    return value;
  }
}
