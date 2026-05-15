import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { softDeleteProduct } from '@/lib/admin/products';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: 'id invalido' }, { status: 400 });
  }
  try {
    await softDeleteProduct(id);
    revalidatePath('/admin/productos');
    revalidatePath('/cervezas');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[softDelete]', e);
    return NextResponse.json({ ok: false, error: 'db error' }, { status: 500 });
  }
}
