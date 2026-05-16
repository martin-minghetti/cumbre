export type ProductFormat = 'lata_473' | 'porron_1l';

export function fmtAbv(abvX10: number): string {
  return `${(abvX10 / 10).toFixed(1)}%`;
}

export function fmtPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

export function fmtFormat(format: ProductFormat): string {
  return format === 'lata_473' ? 'lata 473 ml' : 'porrón 1 L';
}
