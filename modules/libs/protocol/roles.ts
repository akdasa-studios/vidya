import * as crud from './crud'

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export type RoleDetails = {
  id: string;
  name: string;
  schoolId: string;
  description: string;
  permissions: string[];
}

export type RoleSummary = Pick<RoleDetails, 'id' | 'name' | 'description'>;

/* -------------------------------------------------------------------------- */
/*                                   Create                                   */
/* -------------------------------------------------------------------------- */

export type CreateRoleRequest = crud.CreateItemRequest<Omit<RoleDetails, 'id'>>;
export type CreateRoleResponse = crud.CreateItemResponse<RoleDetails['id']>;

/* -------------------------------------------------------------------------- */
/*                                    Read                                    */
/* -------------------------------------------------------------------------- */

export type GetRoleSummariesListQuery = {
  schoolId?: string;
}

export type GetRolesResponse = 
  crud.GetItemsListResponse<RoleSummary>;

export type GetRoleResponse = 
  crud.GetItemResponse<RoleDetails>;

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

export type UpdateRoleRequest = 
  crud.UpdateItemRequest<Omit<RoleDetails, 'id'>>; 

export type UpdateRoleResponse = 
  crud.UpdateItemResponse<RoleDetails>;

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export type DeleteRoleResponse = 
  crud.DeleteItemResponse;