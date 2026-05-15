'use server';

import { revalidatePath } from 'next/cache';
import { ProductCreateSchema, createProduct } from '@/lib/admin/products';

export type CreateActionState =
  | { ok: true; productId: number; slug: string }
  | { ok: false; errors: { path?: string[]; message: string }[] };

export async function createProductAction(_prev: unknown, fd: FormData): Promise<CreateActionState> {
  const parsed = ProductCreateSchema.safeParse({
    name: fd.get('name'),
    style: fd.get('style'),
    format: fd.get('format'),
    abvDefault: fd.get('abvDefault') ? Number(fd.get('abvDefault')) : null,
    ibuDefault: fd.get('ibuDefault') ? Number(fd.get('ibuDefault')) : null,
    description: (fd.get('description') as string) || null,
    reorderPoint: Number(fd.get('reorderPoint') ?? 0),
    defaultPriceCents: Number(fd.get('defaultPriceCents') ?? 0),
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => ({ path: i.path.map(String), message: i.message })) };
  }
  try {
    const r = await createProduct(parsed.data);
    revalidatePath('/admin/productos');
    revalidatePath('/cervezas');
    return { ok: true, ...r };
  } catch (e) {
    console.error('[createProduct]', e);
    return { ok: false, errors: [{ message: e instanceof Error ? e.message : 'Error de base de datos' }] };
  }
}
