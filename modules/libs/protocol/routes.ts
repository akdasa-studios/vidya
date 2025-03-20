export const Routes = (baseUrl: string = '') => ({
  auth: {
    root: () => `${baseUrl}/auth`,
    signIn:  (method: string) => `${baseUrl}/auth/signin/${method}`,
    signOut: ()               => `${baseUrl}/auth/signout`,

    signup: (method: string) => `${baseUrl}/auth/signup/${method}`,
    tokens: {
      refresh: () => `${baseUrl}/auth/refresh`,
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
    user: (userId?: string) => ({
      get: () => `${baseUrl}/edu/users/${userId}`,
      find: () => `${baseUrl}/edu/users`,
      update: () => `${baseUrl}/edu/users/${userId}`,
      delete: () => `${baseUrl}/edu/users/${userId}`,
      roles: {
        all: () => `${baseUrl}/edu/users/${userId}/roles`,
        create: () => `${baseUrl}/edu/users/${userId}/roles`,
        delete: (roleId: string) => `${baseUrl}/edu/users/${userId}/roles/${roleId}`,
      },
      schools: {
        all: () => `${baseUrl}/edu/users/${userId}/schools`,
        create: () => `${baseUrl}/edu/users/${userId}/schools`,
        delete: (roleId: string) => `${baseUrl}/edu/users/${userId}/schools/${roleId}`,
      }
    }),
    schools: {
      configs: {
        getAll: (schoolId: string) => `${baseUrl}/edu/schools/${schoolId}/configs`,
        update: (schoolId: string) => `${baseUrl}/edu/schools/${schoolId}/configs`,
      },
      find: () => `${baseUrl}/edu/schools`,
      get: (id: string) => `${baseUrl}/edu/schools/${id}`,
      create: () => `${baseUrl}/edu/schools`,
      update: (id: string) => `${baseUrl}/edu/schools/${id}`,
      delete: (id: string) => `${baseUrl}/edu/schools/${id}`,
    }
  }
})
