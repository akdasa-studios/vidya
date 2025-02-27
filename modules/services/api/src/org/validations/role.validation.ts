import { Inject, Injectable } from '@nestjs/common';
import { RolesService } from '@vidya/api/org/services';
import {
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true, name: 'role-exists' })
@Injectable()
export class IsRoleExistConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(RolesService) private readonly roles: RolesService) {}

  async validate(value: string): Promise<boolean> {
    if (!isUUID(value)) {
      return false;
    }
    return await this.roles.existsBy({ id: value });
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    // TODO: Message is not clear. It joins all items in the array with a comma.
    //       "Role 'ca2c9698-f740-4a24-9b35-b3b6d28a61ac,incorrecyt,ca2c9698-f740-4a24-9b35-b3b6d28a61ac' not found for 'roleIds'"
    return `Role '${validationArguments.value}' not found for '${validationArguments.property}'`;
  }
}

export function IsRoleExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRoleExistConstraint,
    });
  };
}
