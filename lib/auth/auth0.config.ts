const AUTH0_DOMAIN = 'dev-rkchrceel6xwqe2g.us.auth0.com'
const AUTH0_API = 'https://dev-rkchrceel6xwqe2g.us.auth0.com/api/v2'
const BASE_URL = 'http://localhost:4200'

export const auth0Config = {
  domain: AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: `https://${AUTH0_DOMAIN}`,
  baseURL: BASE_URL,
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
    audience: AUTH0_API,
    scope: 'openid profile email',
  },
}
