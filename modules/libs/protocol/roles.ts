
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface GetRolesListRequest {
}

export interface GetRolesListResponse {
  roles: Role[];
}

export interface CreateRoleRequest extends Omit<Role, 'id'> {
}

export interface CreateRoleResponse {
  id: string;
}

export interface UpdateRoleRequest extends Partial<Omit<Role, 'id'>> {
}

export interface UpdateRoleResponse {
}