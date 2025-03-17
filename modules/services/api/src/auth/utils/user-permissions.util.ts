import * as domain from '@vidya/domain';
import * as protocol from '@vidya/protocol';

export class UserAuthentication {
  constructor(private readonly _accessToken: protocol.AccessToken) {}

  /**
   * Get user Id
   * @returns User Id
   */
  get userId() {
    return this._accessToken.sub;
  }

  /**
   * Get user access token
   * @returns Access token
   */
  get accessToken() {
    return this._accessToken;
  }

  /**
   * Get user permissions
   * @returns User permissions
   */
  get permissions() {
    return new AuthenticatedUserPermissions(
      this._accessToken.permissions ?? [],
    );
  }
}

export class AuthenticatedUserPermissions {
  constructor(private readonly _permissions: protocol.UserPermission[]) {}

  public getScopes(
    permissions: domain.PermissionKey[],
  ): { schoolId: string }[] {
    return this._permissions
      .filter((p) =>
        permissions.every((permission) => p.p.includes(permission)),
      )
      .map((p) => ({ schoolId: p.sid }));
  }

  /**
   * Checks if user has permission to perform an action.
   * Throws an error if user does not have permission.
   * @param permissions Required permissions to check
   * @param scope Scope (or scopes) to check permissions for
   */
  public has(
    permissions: domain.PermissionKey[],
    scope?: { schoolId?: string } | { schoolId?: string }[],
  ): boolean {
    // get user and resource scopes
    const resourceScopes = Array.isArray(scope) ? scope : [scope];
    const userScopes = this.getScopes(permissions);

    if (userScopes.length === 0) {
      return false;
    }

    if (!scope) {
      return true;
    }

    const permitted = userScopes.some((us) =>
      resourceScopes.some((rs) => us.schoolId == rs.schoolId),
    );

    return permitted;
  }
}
