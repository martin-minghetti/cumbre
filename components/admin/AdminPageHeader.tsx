import type { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <header className="flex items-start justify-between gap-6 pb-2">
      <div className="space-y-1">
        {eyebrow ? <p className="admin-eyebrow">{eyebrow}</p> : null}
        <h1 className="font-display text-4xl md:text-5xl uppercase leading-[0.95] tracking-tight text-foreground">
          {title}
        </h1>
        <div className="admin-rule" />
        {subtitle ? (
          <p className="text-sm text-muted-foreground pt-2 max-w-xl">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </header>
  );
}
