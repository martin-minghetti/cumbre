import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NoSessionPage() {
  return (
    <div className="p-8 max-w-md">
      <Card>
        <CardHeader><CardTitle>No hay caja abierta</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Para registrar ventas en el POS necesitas abrir tu sesion de caja primero.
          </p>
          <Button asChild>
            <Link href={'/admin/caja/abrir' as Route}>Abrir caja ahora</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
