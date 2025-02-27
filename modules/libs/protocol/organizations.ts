export type Organization = {
  id: string;
  name: string;
}

export type GetOrganizationsResponse = {
  items: Organization[];
}

export type GetOrganizationResponse = Organization;

export type CreateOrganizationRequest = {
  name: string;
}

export type CreateOrganizationResponse = {
  id: string;
}

export type UpdateOrganizationRequest = Pick<Partial<Organization>, 'name'>; 
export type UpdateOrganizationResponse = Organization;