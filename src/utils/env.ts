import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_API_KEY: z.string().min(1),
});

type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  // Get environment variables from either Vite or Node.js
  const env = {
    VITE_SUPABASE_URL: typeof import.meta !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: typeof import.meta !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : process.env.VITE_SUPABASE_ANON_KEY,
    VITE_API_KEY: typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_KEY : process.env.VITE_API_KEY,
  };

  const result = envSchema.safeParse(env);
  if (!result.success) {
    const missingVars = result.error.errors
      .map((err) => err.path.join('.'))
      .join(', ');
    throw new Error(`Missing required environment variables: ${missingVars}`);
  }

  return result.data;
}

export function getApiKey(): string {
  const env = validateEnv();
  return env.VITE_API_KEY;
} 