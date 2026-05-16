import Link from 'next/link';
import type { Route } from 'next';
import { listUnifiedSales, channelFilterSchema, type Channel } from '@/lib/admin/unified-sales';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ChannelBadge, OrderStatusBadge, StatusBadge } from '@/components/admin/Badge';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);
const fmtDate = (s: string) => new Date(s).toLocaleString('es-AR');

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagada' },
  { value: 'fulfilled', label: 'Despachada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const CHANNEL_OPTIONS: { value: Channel; label: string }[] = [
  { value: 'all', label: 'Todos los canales' },
  { value: 'online', label: 'Online' },
  { value: 'pos', label: 'POS' },
];

export default async function VentasPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const channelParsed = channelFilterSchema.safeParse(sp.channel ?? 'all');
  const channel: Channel = channelParsed.success ? channelParsed.data : 'all';
  const status = (channel === 'online' || channel === 'all') ? (sp.status as string | undefined) : undefined;

  const rows = await listUnifiedSales({
    channel,
    status: status && status !== '' ? status : undefined,
    fromDate: sp.from,
    toDate: sp.to,
  });

  const qs = new URLSearchParams({
    channel,
    ...(status ? { status } : {}),
    ...(sp.from ? { from: sp.from } : {}),
    ...(sp.to ? { to: sp.to } : {}),
  });
  const exportHref = `/admin/ventas/export?${qs.toString()}`;
  const channelLabel = channel === 'all' ? 'online + POS' : channel;

  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Operaciones / Ventas"
        title="Ventas"
        subtitle={`${rows.length} registros (max 500), ${channelLabel}.`}
        actions={
          <Button asChild variant="outline">
            <a href={exportHref}>Exportar CSV</a>
          </Button>
        }
      />

      <form className="flex gap-3 items-end flex-wrap" method="get">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Canal</label>
          <select name="channel" defaultValue={channel} className="rounded-md border px-3 py-2 text-sm">
            {CHANNEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Estado (solo online)</label>
          <select name="status" defaultValue={status ?? ''} className="rounded-md border px-3 py-2 text-sm">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Desde</label>
          <input type="date" name="from" defaultValue={sp.from ?? ''} className="rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Hasta</label>
          <input type="date" name="to" defaultValue={sp.to ?? ''} className="rounded-md border px-3 py-2 text-sm" />
        </div>
        <Button type="submit" size="sm">Filtrar</Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="Sin ventas en este filtro"
          helper="Ajusta el canal o el rango de fechas."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead>#</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente / Cajero</TableHead>
                <TableHead>Estado / Pago</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const href = r.source === 'online' ? `/admin/ventas/${r.id}` : `/admin/ventas/pos/${r.id}`;
                return (
                  <TableRow key={`${r.source}-${r.id}`}>
                    <TableCell><ChannelBadge source={r.source} /></TableCell>
                    <TableCell className="font-mono tabular-nums">#{r.id}</TableCell>
                    <TableCell className="text-sm tabular-nums">{fmtDate(r.createdAt)}</TableCell>
                    <TableCell>{r.customerLabel}</TableCell>
                    <TableCell>
                      {r.status ? (
                        <OrderStatusBadge status={r.status} />
                      ) : r.paymentMethod ? (
                        <StatusBadge tone="muted">{r.paymentMethod}</StatusBadge>
                      ) : (
                        <StatusBadge tone="muted">s/d</StatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{fmt(r.totalCents)}</TableCell>
                    <TableCell><Link href={href as Route} className="text-primary text-sm">Ver</Link></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
