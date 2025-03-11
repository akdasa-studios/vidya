import * as crud from './crud'

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export type UserSummary = {
  id: string;
  name: string;
}

export type UserDetailsRole = {
  id: string;
  name?: string;
}

export type UserDetails = UserSummary & {
  email: string;
  phone?: string;
  roles: UserDetailsRole[];
}

/* -------------------------------------------------------------------------- */
/*                                    Read                                    */
/* -------------------------------------------------------------------------- */

export type GetUsersQuery = {
  schoolId?: string;
}

export type GetUserResponse =
  crud.GetItemResponse<UserDetails>;

export type GetUsersResponse =
  crud.GetItemsListResponse<UserSummary>;

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

export type UpdateUserRequest =
  crud.UpdateItemRequest<Omit<UserDetails, 'id'>>;

export type UpdateUserResponse =
  crud.UpdateItemResponse<UserDetails>;

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export type DeleteUserResponse =
  crud.DeleteItemResponse;
