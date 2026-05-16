import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { listOnlineOrders, ordersToCSV } from '@/lib/admin/sales';
import { channelFilterSchema } from '@/lib/admin/unified-sales';

function posSalesToCSV(rows: { id: number; createdAt: string; cashier: string; method: string; totalCents: number }[]): string {
  const head = 'id,fecha,cajero,metodo,total_ars';
  const lines = rows.map((r) => [r.id, r.createdAt, JSON.stringify(r.cashier), r.method, (r.totalCents / 100).toFixed(2)].join(','));
  return [head, ...lines].join('\n') + '\n';
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const channel = channelFilterSchema.safeParse(url.searchParams.get('channel') ?? 'online');
  if (!channel.success) return NextResponse.json({ error: 'invalid_channel' }, { status: 400 });

  if (channel.data === 'online') {
    const rows = await listOnlineOrders({
      status: url.searchParams.get('status') as 'pending' | 'paid' | 'fulfilled' | 'cancelled' | undefined,
      fromDate: url.searchParams.get('from') ?? undefined,
      toDate: url.searchParams.get('to') ?? undefined,
    });
    const csv = ordersToCSV(rows.map((r) => ({
      id: r.id, createdAt: r.createdAt, status: r.status, customerEmail: r.customerEmail,
      shippingMethod: r.shippingMethod, subtotalCents: Number(r.subtotalCents),
      shippingCostCents: Number(r.shippingCostCents), totalCents: Number(r.totalCents),
    })));
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="ventas-online.csv"` },
    });
  }

  if (channel.data === 'pos') {
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const conds: ReturnType<typeof sql>[] = [];
    if (from) conds.push(sql`ps.created_at >= ${from}`);
    if (to) conds.push(sql`ps.created_at < (${to}::date + INTERVAL '1 day')`);
    const where = conds.length > 0 ? sql.join([sql`WHERE`, sql.join(conds, sql` AND `)], sql` `) : sql``;
    const r = await db.execute(sql`
      SELECT ps.id, ps.created_at AS "createdAt", u.name AS cashier, ps.payment_method AS method, ps.total_cents AS "totalCents"
      FROM pos_sales ps JOIN users u ON u.id = ps.cashier_id
      ${where}
      ORDER BY ps.created_at DESC LIMIT 500
    `);
    const rows = r.rows.map((row) => {
      const o = row as Record<string, unknown>;
      return { id: Number(o.id), createdAt: String(o.createdAt), cashier: String(o.cashier), method: String(o.method), totalCents: Number(o.totalCents) };
    });
    const csv = posSalesToCSV(rows);
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="ventas-pos.csv"` },
    });
  }

  // channel === 'all'
  return NextResponse.json({ error: 'export_all_unsupported_select_a_channel' }, { status: 400 });
}
