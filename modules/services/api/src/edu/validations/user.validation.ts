import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '@vidya/api/edu/services';
import {
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true, name: 'user-exists' })
@Injectable()
export class IsUserExistConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  async validate(value: string): Promise<boolean> {
    if (!isUUID(value)) {
      return false;
    }
    return await this.users.existsBy({ id: value });
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `User '${validationArguments.value}' not found for '${validationArguments.property}'`;
  }
}

export function IsUserExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserExistConstraint,
    });
  };
}
