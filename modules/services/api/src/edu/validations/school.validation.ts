import { Inject, Injectable } from '@nestjs/common';
import { SchoolsService } from '@vidya/api/edu/services';
import {
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true, name: 'school-exists' })
@Injectable()
export class IsSchoolExistConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject(SchoolsService) private readonly schools: SchoolsService,
  ) {}

  async validate(value: string): Promise<boolean> {
    if (!isUUID(value)) {
      return false;
    }
    return await this.schools.existsBy({ id: value });
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `School '${validationArguments.value}' not found for '${validationArguments.property}'`;
  }
}

export function IsSchoolExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSchoolExistConstraint,
    });
  };
}
