import * as crud from './crud'

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export type OrganizationSummary = {
  id: string;
  name: string;
}

export type OrganizationDetails = OrganizationSummary & {
}

/* -------------------------------------------------------------------------- */
/*                                    Read                                    */
/* -------------------------------------------------------------------------- */

export type GetOrganizationsResponse = 
  crud.GetItemsListResponse<OrganizationSummary>;

export type GetOrganizationResponse = 
  crud.GetItemResponse<OrganizationDetails>;

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

export type UpdateOrganizationRequest = 
  crud.UpdateItemRequest<Omit<OrganizationDetails, 'id'>>; 

export type UpdateOrganizationResponse = 
  crud.UpdateItemResponse<OrganizationDetails>;

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export type DeleteOrganizationResponse = 
  crud.DeleteItemResponse;
