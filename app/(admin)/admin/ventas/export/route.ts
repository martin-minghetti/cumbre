import { listOnlineOrders, ordersToCSV } from '@/lib/admin/sales';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as 'pending' | 'paid' | 'fulfilled' | 'cancelled' | null;
  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;

  const rows = await listOnlineOrders({ status: status ?? undefined, fromDate: from, toDate: to });
  const csv = ordersToCSV(rows.map((r) => ({
    id: r.id, createdAt: r.createdAt, status: r.status, customerEmail: r.customerEmail,
    shippingMethod: r.shippingMethod, subtotalCents: Number(r.subtotalCents),
    shippingCostCents: Number(r.shippingCostCents), totalCents: Number(r.totalCents),
  })));
  const filename = `ventas-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
