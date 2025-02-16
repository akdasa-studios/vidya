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
      getList: () => `${baseUrl}/org/roles`,
      create: () => `${baseUrl}/org/roles`,
      update: () => `${baseUrl}/org/roles/:id`,
    }
  }
})
