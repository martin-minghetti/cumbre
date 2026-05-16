import type { ReactNode } from 'react';

type Tone = 'copper' | 'glacier' | 'positive' | 'warning' | 'danger' | 'muted';

const toneClasses: Record<Tone, string> = {
  copper: 'bg-primary/15 text-primary border border-primary/30',
  glacier: 'bg-blue-500/15 text-blue-700 border border-blue-500/30',
  positive: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-700 border border-amber-500/30',
  danger: 'bg-destructive/15 text-destructive border border-destructive/30',
  muted: 'bg-muted text-muted-foreground border border-border',
};

export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

const ORDER_TONE: Record<string, Tone> = {
  pending: 'warning',
  paid: 'glacier',
  fulfilled: 'positive',
  cancelled: 'danger',
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <StatusBadge tone={ORDER_TONE[status] ?? 'muted'}>{status}</StatusBadge>;
}

export function ChannelBadge({ source }: { source: 'online' | 'pos' }) {
  return (
    <StatusBadge tone={source === 'pos' ? 'copper' : 'glacier'}>{source}</StatusBadge>
  );
}

const BATCH_TONE: Record<string, Tone> = {
  brewing: 'warning',
  bottled: 'positive',
  depleted: 'muted',
};

export function BatchStatusBadge({ status }: { status: string }) {
  return <StatusBadge tone={BATCH_TONE[status] ?? 'muted'}>{status}</StatusBadge>;
}

const PO_TONE: Record<string, Tone> = {
  draft: 'muted',
  placed: 'warning',
  received: 'glacier',
  paid: 'positive',
  cancelled: 'danger',
};

export function POStatusBadge({ status }: { status: string }) {
  return <StatusBadge tone={PO_TONE[status] ?? 'muted'}>{status}</StatusBadge>;
}
