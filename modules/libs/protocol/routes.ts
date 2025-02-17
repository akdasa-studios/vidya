export const Routes = (baseUrl: string = '') => ({
  auth: {
    root: () => `${baseUrl}/auth`,
    login: (method: string) => `${baseUrl}/auth/login/${method}`,
    logout: () => `${baseUrl}/auth/logout`,
    tokens: {
      refresh: () => `${baseUrl}/auth/tokens/refresh`,
    },
    profile: () => `${baseUrl}/auth/profile`,
  },
  otp: {
    root: () => `${baseUrl}/auth/otp`,
  },
  org: {
    roles: {
      find: () => `${baseUrl}/org/roles`,
      get: (id: string) => `${baseUrl}/org/roles/${id}`,
      create: () => `${baseUrl}/org/roles`,
      update: (id: string) => `${baseUrl}/org/roles/${id}`,
      delete: (id: string) => `${baseUrl}/org/roles/${id}`,
    },
    userRoles: {
      all: (userId: string) => `${baseUrl}/org/users/${userId}/roles`,
      create: (userId: string) => `${baseUrl}/org/users/${userId}/roles`,
      delete: (userId: string, roleId: string) => `${baseUrl}/org/users/${userId}/roles/${roleId}`,
    }
  }
})
