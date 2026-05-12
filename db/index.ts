import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { env } from '@/lib/env';
import * as schema from './schema';

// Pool-based driver supports transactions + SELECT FOR UPDATE (critical for FIFO stock allocation).
// neon-http (the previous setup) does not support transactions.
// `ws` is required for the WebSocket connection in Node runtime (API routes, server actions, scripts).
// In Edge runtime the WebSocket global is auto-detected — this assignment is a no-op there.
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export type Db = typeof db;
