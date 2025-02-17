export type UserRole = {
  roleId: string;
}

export type GetUserRolesListRequest = {
  userId: string;
}

export type GetUserRolesListResponse = {
  userRoles: UserRole[];
}

export type SetUserRolesQuery = {
  userId: string;
}

export type SetUserRolesRequest = {
  roleIds: string[];
}

export type SetUserRolesResponse = {
}