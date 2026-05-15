import Link from 'next/link';
import type { Route } from 'next';
import { listOnlineOrders } from '@/lib/admin/sales';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fmt = (c: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(c / 100);
const fmtDate = (s: string) => new Date(s).toLocaleString('es-AR');

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagada' },
  { value: 'fulfilled', label: 'Despachada' },
  { value: 'cancelled', label: 'Cancelada' },
];

export default async function VentasPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = sp.status as 'pending' | 'paid' | 'fulfilled' | 'cancelled' | undefined;
  const rows = await listOnlineOrders({ status, fromDate: sp.from, toDate: sp.to });

  const exportHref = `/admin/ventas/export?${new URLSearchParams({
    ...(status ? { status } : {}),
    ...(sp.from ? { from: sp.from } : {}),
    ...(sp.to ? { to: sp.to } : {}),
  }).toString()}`;

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Ventas online</h1>
          <p className="text-sm text-muted-foreground">{rows.length} ordenes (max 500)</p>
        </div>
        <Button asChild variant="outline"><a href={exportHref}>Exportar CSV</a></Button>
      </header>

      <form className="flex gap-3 items-end" method="get">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Estado</label>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Sin resultados.</TableCell></TableRow>
            ) : rows.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono">#{o.id}</TableCell>
                <TableCell className="text-sm">{fmtDate(o.createdAt)}</TableCell>
                <TableCell>{o.customerName} <span className="text-muted-foreground text-xs">{o.customerEmail}</span></TableCell>
                <TableCell><span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs">{o.status}</span></TableCell>
                <TableCell className="text-right tabular-nums">{fmt(Number(o.totalCents))}</TableCell>
                <TableCell><Link href={`/admin/ventas/${o.id}` as Route} className="text-primary text-sm">Ver</Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
