'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import type { ProductRow } from '@/lib/admin/products';
import { StatusBadge } from '@/components/admin/Badge';
import { EmptyState } from '@/components/admin/EmptyState';

function formatLabel(f: 'lata_473' | 'porron_1l'): string {
  return f === 'lata_473' ? 'Lata 473ml' : 'Porron 1L';
}

const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nombre <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground font-mono">{row.original.slug}</div>
      </div>
    ),
  },
  {
    accessorKey: 'style',
    header: 'Estilo',
  },
  {
    accessorKey: 'format',
    header: 'Formato',
    cell: ({ row }) => (
      <StatusBadge tone="muted">{formatLabel(row.original.format)}</StatusBadge>
    ),
  },
  {
    id: 'abvIbu',
    header: 'ABV / IBU',
    cell: ({ row }) => {
      const abv = row.original.abvDefault;
      const ibu = row.original.ibuDefault;
      const abvStr = abv == null ? 'N/A' : `${(abv / 10).toFixed(1)}%`;
      const ibuStr = ibu == null ? 'N/A' : String(ibu);
      return <span className="font-mono tabular-nums">{abvStr} / {ibuStr}</span>;
    },
  },
  {
    accessorKey: 'derivedStock',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Stock <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const stock = row.original.derivedStock;
      const reorder = row.original.reorderPoint;
      const critical = stock < reorder;
      return (
        <span className={'font-mono tabular-nums ' + (critical ? 'text-red-600 font-medium' : '')}>
          {stock}
        </span>
      );
    },
  },
  {
    accessorKey: 'reorderPoint',
    header: 'Reorder',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums text-muted-foreground text-sm">
        {row.original.reorderPoint}
      </span>
    ),
  },
  {
    accessorKey: 'active',
    header: 'Activo',
    cell: ({ row }) => (
      <StatusBadge tone={row.original.active ? 'positive' : 'muted'}>
        {row.original.active ? 'Si' : 'No'}
      </StatusBadge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/productos/${row.original.id}/edit` as Route}>Editar</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              if (!confirm('Desactivar este producto? No aparecera en el catalogo publico.')) return;
              const r = await fetch(`/admin/productos/${row.original.id}/delete`, { method: 'POST' });
              if (r.ok) location.reload();
              else alert('Error al desactivar');
            }}
            className="text-red-600"
          >
            Desactivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function ProductosDataTable({ products }: { products: ProductRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: products,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (table.getRowModel().rows.length === 0) {
    return (
      <EmptyState
        title="Sin productos"
        helper="Crea tu primer producto para llenar el catalogo."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
