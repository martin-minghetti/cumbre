import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  CART_SECRET: z.string().min(32),
  ORDER_TOKEN_SECRET: z.string().min(32),
  OWNER_EMAIL: z.string().email(),
  INITIAL_OWNER_EMAIL: z.string().email().optional(),
  INITIAL_OWNER_PASSWORD: z.string().min(8).optional(),
  MP_ACCESS_TOKEN: z.string().optional(),
  MP_WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_MODE: z.enum(['simulated', 'production']).default('simulated'),
  RESEND_API_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
