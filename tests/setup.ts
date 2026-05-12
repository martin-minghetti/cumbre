import 'dotenv/config';

// Set defaults for env vars not needed in unit tests (so lib/env.ts validation passes)
process.env.DATABASE_URL ||= 'postgres://test@localhost/test';
process.env.SESSION_SECRET ||= 'a'.repeat(64);
process.env.CART_SECRET ||= 'b'.repeat(64);
process.env.ORDER_TOKEN_SECRET ||= 'c'.repeat(64);
process.env.OWNER_EMAIL ||= 'test@example.com';
