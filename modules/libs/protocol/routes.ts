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
  edu: {
    roles: {
      find: () => `${baseUrl}/edu/roles`,
      get: (id: string) => `${baseUrl}/edu/roles/${id}`,
      create: () => `${baseUrl}/edu/roles`,
      update: (id: string) => `${baseUrl}/edu/roles/${id}`,
      delete: (id: string) => `${baseUrl}/edu/roles/${id}`,
    },
    user: (userId: string) => ({
      roles: {
        all: () => `${baseUrl}/edu/users/${userId}/roles`,
        create: () => `${baseUrl}/edu/users/${userId}/roles`,
        delete: (roleId: string) => `${baseUrl}/edu/users/${userId}/roles/${roleId}`,
      }
    }),
  }
})
