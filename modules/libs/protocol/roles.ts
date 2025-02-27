/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export type Role = {
  id: string;
  name: string;
  organizationId: string;
  schoolId?: string;
  description: string;
  permissions: string[];
}

export type RoleSummary = Pick<Role, 'id' | 'name' | 'description'>;

/* -------------------------------------------------------------------------- */
/*                                     Get                                    */
/* -------------------------------------------------------------------------- */

export interface GetRoleRequest {}
export interface GetRoleResponse extends Role {}

export interface GetRoleSummariesListQuery {
  organizationId?: string;
  schoolId?: string;
}

export interface GetRoleSummariesListResponse {
  roles: RoleSummary[];
}

/* -------------------------------------------------------------------------- */
/*                                   Create                                   */
/* -------------------------------------------------------------------------- */

export interface CreateRoleRequest extends Omit<Role, 'id'> {}
export interface CreateRoleResponse {
  id: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

export interface UpdateRoleRequest extends Partial<Omit<Role, 'id'>> {}
export interface UpdateRoleResponse {
  id: string;
}

export interface DeleteRoleRequest {}
export interface DeleteRoleResponse {
  id: string;
}
