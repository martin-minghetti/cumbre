import Link from 'next/link';
import type { Route } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, AlertTriangle, Calendar } from 'lucide-react';

const REPORTS = [
  { href: '/admin/reportes/margen', title: 'Margen por producto', desc: 'Revenue - costo, agregado por producto.', Icon: TrendingUp },
  { href: '/admin/reportes/top-productos', title: 'Top productos', desc: 'Mas vendidos por revenue ultimos 30 dias.', Icon: Award },
  { href: '/admin/reportes/stock-critico', title: 'Stock critico', desc: 'Productos e insumos bajo reorder point.', Icon: AlertTriangle },
  { href: '/admin/reportes/ventas-periodo', title: 'Ventas por periodo', desc: 'Ventas agrupadas por dia ultimos 30 dias.', Icon: Calendar },
];

export default function ReportesHub() {
  return (
    <div className="p-8 space-y-8">
      <AdminPageHeader
        eyebrow="Analisis / Reportes"
        title="Reportes"
        subtitle="Margen, ranking, stock critico y ventas por periodo."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {REPORTS.map((r) => (
          <Link key={r.href} href={r.href as Route} className="block">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-center gap-3">
                <r.Icon className="size-5 text-primary" />
                <CardTitle className="text-base">{r.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{r.desc}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
