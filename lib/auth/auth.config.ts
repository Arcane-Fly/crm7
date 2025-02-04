import { logger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

interface AuthConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

export class AuthService {
  private static instance: AuthService;
  private config: AuthConfig;

  private constructor(config: AuthConfig) {
    this.config = config;
  }

  public static validateConfig(config: AuthConfig): string | null {
    const missingVars = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      const error = `Missing required auth configuration: ${missingVars.join(', ')}`;
      logger.error(error);
      throw new Error(error);
    }

    return null;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      const config = {
        apiUrl: process.env.AUTH_API_URL ?? '',
        clientId: process.env.AUTH_CLIENT_ID ?? '',
        clientSecret: process.env.AUTH_CLIENT_SECRET ?? '',
        redirectUri: process.env.AUTH_REDIRECT_URI ?? '',
        scope: process.env.AUTH_SCOPE ?? '',
      };

      AuthService.validateConfig(config);
      AuthService.instance = new AuthService(config);
    }

    return AuthService.instance;
  }

  public getConfig(): AuthConfig {
    return this.config;
  }

  public async authenticate(token: string): Promise<void> {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Unauthorized');
    }

    return user;
  }
}
