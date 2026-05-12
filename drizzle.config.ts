import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Vercel pulls env to .env.local; load that first, then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // strict=true forces interactive prompts on push (different from TS strict).
  // Disable so db:push runs in non-interactive shells.
  strict: false,
  verbose: true,
});
