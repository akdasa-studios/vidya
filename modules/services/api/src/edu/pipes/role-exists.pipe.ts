import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { RolesService } from '@vidya/api/edu/services';

@Injectable()
export class RoleExistsPipe implements PipeTransform {
  constructor(private readonly rolesService: RolesService) {}

  async transform(value: string) {
    const role = await this.rolesService.findOneBy({ id: value });
    if (!role) {
      throw new NotFoundException(`Role with ID ${value} not found`);
    }
    return value;
  }
}
