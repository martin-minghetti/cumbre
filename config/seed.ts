import type { Db } from '@/db';

/**
 * Idempotent initial seed. Productos, suppliers, supplies van acá.
 * Phase 1: vacío. Se completa en Phase 3 (CRUD productos).
 */
export async function seedAll(_db: Db) {
  console.log('[seed] Phase 1: nothing to seed yet. Defer to Phase 3.');
}
