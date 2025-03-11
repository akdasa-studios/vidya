import { ForbiddenException } from '@nestjs/common';
import * as domain from '@vidya/domain';
import * as protocol from '@vidya/protocol';

export class UserPermissions {
  constructor(private readonly userPermissions: protocol.UserPermission[]) {}

  /**
   * Checks if user has permission to perform an action.
   * Throws an error if user does not have permission.
   * @param permissions Required permissions to check
   * @param scope Optional scope to check
   */
  public check(
    permissions: domain.PermissionKey[],
    scope?: { schoolId: string },
  ) {
    const scopes = this.getScopes(permissions);
    if (!scopes.length) {
      throw new ForbiddenException('User does not have permission');
    }

    if (!scope) {
      return;
    }

    const permitted = scopes.some((s) => s.schoolId == scope?.schoolId);

    if (!permitted) {
      throw new ForbiddenException('User does not have permission');
    }
  }

  public getScopes(
    permissions: domain.PermissionKey[],
  ): { schoolId: string }[] {
    return this.userPermissions
      .filter((p) =>
        permissions.every((permission) => p.p.includes(permission)),
      )
      .map((p) => ({ schoolId: p.sid }));
  }
}
