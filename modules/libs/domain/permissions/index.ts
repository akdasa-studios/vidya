export const PermissionKeys = [
  // All permissions
  '*',
  
  // Roles
  'roles:create',
  'roles:read',
  'roles:update',
  'roles:delete',

  // Schools
  'schools:create',
  'schools:read',
  'schools:update',
  'schools:delete',

  // Users
  'users:read',
  'users:update',
  'users:delete',
] as const;

export type PermissionKey = typeof PermissionKeys[number];

export const PermissionEnum = Object.freeze(
  PermissionKeys.reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as Record<string, string>)
);
