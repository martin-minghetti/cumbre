import type { ReactNode } from 'react';

export function EmptyState({
  title,
  helper,
  action,
}: {
  title: string;
  helper?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <p className="admin-eyebrow mb-3">Sin datos</p>
      <p className="font-display text-3xl uppercase text-muted-foreground">{title}</p>
      {helper ? (
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-2 max-w-sm">
          {helper}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
