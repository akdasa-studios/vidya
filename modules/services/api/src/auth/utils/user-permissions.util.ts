import * as domain from '@vidya/domain';
import * as protocol from '@vidya/protocol';

export class UserPermissions {
  constructor(private readonly userPermissions: protocol.UserPermission[]) {}

  /**
   * Returns true if user has all provided permissions
   *
   * @param permissions Permissions to check
   * @returns True if user has all provided permissions
   */
  public hasPermissions(permissions: domain.PermissionKey[]): boolean {
    return this.userPermissions.some((p) =>
      permissions.every((permission) => p.p.includes(permission)),
    );
  }

  /**
   * Returns list of organization ids that user has access to
   * based on the provided permissions
   *
   * @param permissions List of permissions to check
   * @returns List of organization ids that user has access to
   */
  public getPermittedOrganizations(
    permissions: domain.PermissionKey[],
  ): string[] {
    return (
      this.userPermissions
        // organization level permissions
        .filter((p) => p.oid && !p.sid)
        // check if user has all required permissions
        .filter((p) =>
          permissions.every((permission) => p.p.includes(permission)),
        )
        .map((p) => p.oid)
    );
  }

  /**
   * Returns list of school ids that user has access to
   * based on the provided permissions
   *
   * @param permissions List of permissions to check
   * @returns List of school ids that user has access to
   */
  public getPermittedSchools(permissions: domain.PermissionKey[]): string[] {
    return this.userPermissions
      .filter(
        (userPermission) =>
          userPermission.sid &&
          permissions.every((p) => userPermission.p.includes(p)),
      )
      .map((p) => p.sid);
  }
}
