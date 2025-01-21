export const Routes = (baseUrl: string = '') => ({
  auth: {
    root: () => `${baseUrl}/auth`,
    login: () => `${baseUrl}/auth/login`,
  }
})
