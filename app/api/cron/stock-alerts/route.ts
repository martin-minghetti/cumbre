import { NextResponse } from 'next/server';
import { getCriticalStockProducts } from '@/lib/admin/reports';
import { sendEmail, escapeHtml } from '@/lib/email';
import { env } from '@/lib/env';
import { brand } from '@/config/brand';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const auth = req.headers.get('authorization');
  const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
  if (!expected || auth !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const items = await getCriticalStockProducts();
  if (items.length === 0) {
    return NextResponse.json({ ok: true, items: 0 });
  }

  const rows = items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.kind === 'product' ? 'Producto' : 'Insumo')}</td><td>${escapeHtml(i.name)}</td><td align="right">${i.stock} ${escapeHtml(i.unit ?? '')}</td><td align="right">${i.reorderPoint}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html><body style="font-family:Helvetica,Arial,sans-serif;padding:24px">
  <h2>${escapeHtml(brand.name)} - Stock critico</h2>
  <p>Hay ${items.length} item${items.length === 1 ? '' : 's'} bajo reorder point:</p>
  <table cellpadding="6" style="border-collapse:collapse;width:100%;margin-top:12px">
    <thead><tr><th align="left">Tipo</th><th align="left">Nombre</th><th align="right">Stock</th><th align="right">Reorder</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>`;

  await sendEmail({
    to: env.OWNER_EMAIL,
    subject: `[${brand.name}] ${items.length} items en stock critico`,
    html,
  });

  return NextResponse.json({ ok: true, items: items.length });
}
