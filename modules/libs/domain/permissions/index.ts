export const PermissionKeys = [
  // Organizations
  'orgs:create',
  'orgs:read',
  'orgs:update',
  'orgs:delete',

  // Roles
  'roles:create',
  'roles:read',
  'roles:update',
  'roles:delete',
] as const;

export type PermissionKey = typeof PermissionKeys[number];
