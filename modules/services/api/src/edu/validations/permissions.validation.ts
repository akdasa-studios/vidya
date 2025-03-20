import { Inject, Injectable } from '@nestjs/common';
import { RolesService } from '@vidya/api/edu/services';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true, name: 'is-permissions-prohibited' })
@Injectable()
export class IsPermissionsProhibitedConstraint
  implements ValidatorConstraintInterface
{
  constructor(@Inject(RolesService) private readonly roles: RolesService) {}

  async validate(value: string[], args: ValidationArguments): Promise<boolean> {
    return !(value || []).some((permission) =>
      args.constraints.includes(permission),
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `permissions cannot contain ${args.constraints}`;
  }
}

export function IsPermissionsProhibited(
  constraints: string[], // list of prohibitted permissions
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: constraints || [],
      validator: IsPermissionsProhibitedConstraint,
    });
  };
}
