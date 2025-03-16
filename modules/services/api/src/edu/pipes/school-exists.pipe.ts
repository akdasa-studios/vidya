import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { SchoolsService } from '@vidya/api/edu/services';

@Injectable()
export class SchoolExistsPipe implements PipeTransform {
  constructor(private readonly schoolsService: SchoolsService) {}

  async transform(value: string) {
    const school = await this.schoolsService.findOneBy({ id: value });
    if (!school) {
      throw new NotFoundException(`School with ID ${value} not found`);
    }
    return value;
  }
}
