import { ForbiddenException } from '@nestjs/common';
import * as domain from '@vidya/domain';
import * as protocol from '@vidya/protocol';

export class UserPermissions {
  constructor(private readonly userPermissions: protocol.UserPermission[]) {}

  /**
   * Checks if user has permission to perform an action.
   * Throws an error if user does not have permission.
   * @param permissions Required permissions to check
   * @param scope Scope (or scopes) to check permissions for
   */
  public check(
    permissions: domain.PermissionKey[],
    scope?: { schoolId?: string } | { schoolId?: string }[],
  ) {
    // get user and resource scopes
    const resourceScopes = Array.isArray(scope) ? scope : [scope];
    const userScopes = this.getScopes(permissions);
    if (!userScopes.length) {
      throw new ForbiddenException('User does not have permission');
    }

    if (!scope) {
      return;
    }

    const permitted = userScopes.some((us) =>
      resourceScopes.some((rs) => us.schoolId == rs.schoolId),
    );

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
