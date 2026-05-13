'use server';

import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { ProductUpdateSchema } from '@/lib/admin/products';
import type { ZodIssue } from 'zod';

export type ActionState =
  | { ok: true }
  | { ok: false; errors: { path?: string[]; message: string }[] };

export async function updateProduct(
  _prev: unknown,
  formData: FormData,
): Promise<ActionState> {
  const idRaw = formData.get('id');
  const id = idRaw ? Number(idRaw) : NaN;
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false, errors: [{ path: ['id'], message: 'id inválido' }] };
  }

  const parsed = ProductUpdateSchema.safeParse({
    name: formData.get('name'),
    style: formData.get('style'),
    format: formData.get('format'),
    abvDefault: parseOptionalInt(formData.get('abvDefault')),
    ibuDefault: parseOptionalInt(formData.get('ibuDefault')),
    description: emptyToNull(formData.get('description')),
    heroImageUrl: emptyToNull(formData.get('heroImageUrl')),
    reorderPoint: Number(formData.get('reorderPoint') ?? 0),
    active: formData.get('active') === 'on' || formData.get('active') === 'true',
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i: ZodIssue) => ({
        path: i.path.map(String),
        message: i.message,
      })),
    };
  }

  try {
    const updated = await db
      .update(products)
      .set(parsed.data)
      .where(eq(products.id, id))
      .returning({ slug: products.slug });
    revalidatePath('/admin/productos');
    revalidatePath('/cervezas');
    const slug = updated[0]?.slug;
    if (slug) revalidatePath(`/cervezas/${slug}`);
    return { ok: true };
  } catch (e) {
    console.error('[updateProduct] DB error', e);
    return { ok: false, errors: [{ message: 'Error de base de datos' }] };
  }
}

function parseOptionalInt(v: FormDataEntryValue | null): number | null {
  if (v === null || v === '' || v === 'null') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v);
  return s === '' ? null : s;
}
