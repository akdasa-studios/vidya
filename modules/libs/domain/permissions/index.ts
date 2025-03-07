export const PermissionKeys = [
  // Organizations
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

export const PermissionEnum = Object.freeze(
  PermissionKeys.reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as Record<string, string>)
);
