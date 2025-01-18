export const auth0Config = {
  domain: 'dev-rkchrceel6xwqe2g.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: 'https://dev-rkchrceel6xwqe2g.us.auth0.com',
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  authorizationParams: {
    response_type: 'code',
    audience: 'https://dev-rkchrceel6xwqe2g.us.auth0.com/api/v2/',
    scope: 'openid profile email',
  },
}
