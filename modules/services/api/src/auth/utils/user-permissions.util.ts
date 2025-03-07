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
    scope: { organizationId: string; schoolId?: string },
  ) {
    // Check if user has permission on the organization level
    const permittedOnOrgLevel = this.getPermittedOrganizations(
      permissions,
    ).includes(scope.organizationId);

    // Check if user has permission on the school level
    const permittedOnSchoolLevel = scope.schoolId
      ? this.getPermittedSchools(permissions).includes(scope.schoolId)
      : true;

    // If user does not have permission on either the organization
    // or school level, throw an error indicating that the user
    // does not have permission
    if (!permittedOnOrgLevel || !permittedOnSchoolLevel) {
      throw new ForbiddenException('User does not have permission');
    }
  }

  /**
   * Returns list of organization ids that user has access to
   * based on the provided permissions. It retunrs organization
   * even if permission is granted on the school level only.
   * @param permissions List of permissions to check
   * @returns List of organization ids that user has access to
   */
  // TODO rename to getOrganizations
  public getPermittedOrganizations(
    permissions: domain.PermissionKey[],
  ): string[] {
    return this.userPermissions
      .filter((p) =>
        permissions.every((permission) => p.p.includes(permission)),
      )
      .map((p) => p.oid);
  }

  /**
   * Returns list of school ids that user has access to
   * based on the provided permissions
   * @param permissions List of permissions to check
   * @returns List of school ids that user has access to
   */
  // TODO rename to getSchools
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
