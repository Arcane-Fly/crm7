import { Auth0Client } from '@auth0/auth0-spa-js';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  auth0Domain: string;
  auth0ClientId: string;
  auth0Audience?: string;
}

function validateConfig(): AuthConfig {
  const config: Partial<AuthConfig> = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    auth0Domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
    auth0ClientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
    auth0Audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
  };

  const missingVars = Object.entries(config: unknown)
    .filter(([key, value]) => !value && key !== 'auth0Audience')
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const error = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(error: unknown);
    throw new Error(error: unknown);
  }

  return config as AuthConfig;
}

class AuthService {
  private static instance: AuthService;
  public readonly supabase;
  public readonly auth0;

  private constructor(config: AuthConfig) {
    // Initialize Supabase client
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    // Initialize Auth0 client
    this.auth0 = new Auth0Client({
      domain: config.auth0Domain,
      clientId: config.auth0ClientId,
      authorizationParams: {
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
        audience: config.auth0Audience,
        scope: 'openid profile email',
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
    });

    // Log initialization
    logger.info('Auth service initialized', {
      supabaseUrl: config.supabaseUrl,
      auth0Domain: config.auth0Domain,
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      const config = validateConfig();
      AuthService.instance = new AuthService(config: unknown);
    }
    return AuthService.instance;
  }
}

// Export singleton instance
const authService = AuthService.getInstance();
export const { supabase, auth0 } = authService;
