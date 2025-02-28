export const AppName = "Vidya"

export enum PermissionResources {
  Organization = 'orgs'
}

export enum PermissionActions {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete'
}

export type Permission = string

export const Permision = (resource: PermissionResources, action: PermissionActions) => `${resource}:${action}`