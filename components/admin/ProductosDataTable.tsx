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
        <div className="text-xs text-muted-foreground">{row.original.slug}</div>
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
      <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs">
        {formatLabel(row.original.format)}
      </span>
    ),
  },
  {
    id: 'abvIbu',
    header: 'ABV / IBU',
    cell: ({ row }) => {
      const abv = row.original.abvDefault;
      const ibu = row.original.ibuDefault;
      const abvStr = abv == null ? '—' : `${(abv / 10).toFixed(1)}%`;
      const ibuStr = ibu == null ? '—' : String(ibu);
      return <span className="tabular-nums">{abvStr} · {ibuStr}</span>;
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
        <span className={'tabular-nums ' + (critical ? 'text-red-600 font-medium' : '')}>
          {stock}
        </span>
      );
    },
  },
  {
    accessorKey: 'reorderPoint',
    header: 'Reorder',
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground text-sm">
        {row.original.reorderPoint}
      </span>
    ),
  },
  {
    accessorKey: 'active',
    header: 'Activo',
    cell: ({ row }) => (
      <span
        className={
          'inline-flex rounded-md px-2 py-1 text-xs ' +
          (row.original.active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600')
        }
      >
        {row.original.active ? 'Sí' : 'No'}
      </span>
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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                Sin productos.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
