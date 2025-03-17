import * as crud from './crud'

/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export type SchoolDetails = {
  id: string;
  name: string;
}

export type SchoolSummary = Pick<SchoolDetails, 'id' | 'name'>;

/* -------------------------------------------------------------------------- */
/*                                   Create                                   */
/* -------------------------------------------------------------------------- */

export type CreateSchoolRequest = crud.CreateItemRequest<Omit<SchoolDetails, 'id'>>;
export type CreateSchoolResponse = crud.CreateItemResponse<SchoolDetails['id']>;

/* -------------------------------------------------------------------------- */
/*                                    Read                                    */
/* -------------------------------------------------------------------------- */

export type GetSchoolsResponse = 
  crud.GetItemsListResponse<SchoolSummary>;

export type GetSchoolResponse = 
  crud.GetItemResponse<SchoolDetails>;

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

export type UpdateSchoolRequest = 
  crud.UpdateItemRequest<Omit<SchoolDetails, 'id'>>; 

export type UpdateSchoolResponse = 
  crud.UpdateItemResponse<SchoolDetails>;

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export type DeleteSchoolResponse = 
  crud.DeleteItemResponse;
