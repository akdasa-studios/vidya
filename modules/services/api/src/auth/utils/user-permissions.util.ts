import { ForbiddenException } from '@nestjs/common';
import * as domain from '@vidya/domain';
import * as protocol from '@vidya/protocol';

export class UserPermissions {
  constructor(private readonly userPermissions: protocol.UserPermission[]) {}

  /**
   * Checks if user has permission to perform an action
   * on the provided organization and school. Throws an error
   * if user does not have permission.
   * @param permissions Required permissions to check
   * @param organizationId Organization id to check
   * @param schoolId School id to check
   */
  public check(
    permissions: domain.PermissionKey[],
    scope?: { organizationId: string; schoolId?: string },
  ) {
    const scopes = this.getScopes(permissions);
    if (!scopes.length) {
      throw new ForbiddenException('User does not have permission');
    }

    if (!scope) {
      return;
    }

    const permitted = scopes.some(
      (s) =>
        s.organizationId == scope?.organizationId &&
        s.schoolId == scope?.schoolId,
    );

    if (!permitted) {
      throw new ForbiddenException('User does not have permission');
    }
  }

  public getScopes(
    permissions: domain.PermissionKey[],
  ): { organizationId: string; schoolId?: string }[] {
    return this.userPermissions
      .filter((p) =>
        permissions.every((permission) => p.p.includes(permission)),
      )
      .map((p) => ({
        organizationId: p.oid,
        schoolId: p.sid,
      }));
  }
}
