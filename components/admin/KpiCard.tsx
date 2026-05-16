import { Card, CardContent } from '@/components/ui/card';

type Props = {
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'danger' | 'accent';
};

export function KpiCard({ label, value, helper, tone = 'default' }: Props) {
  const valueClass =
    tone === 'danger'
      ? 'text-destructive'
      : tone === 'accent'
        ? 'text-primary'
        : 'text-foreground';

  return (
    <Card className="border-border/70 relative overflow-hidden">
      <div
        aria-hidden
        className={
          'absolute top-0 left-0 h-1 w-12 ' +
          (tone === 'danger' ? 'bg-destructive' : 'bg-primary')
        }
      />
      <CardContent className="pt-6 pb-5 space-y-3">
        <p className="admin-eyebrow">{label}</p>
        <div className={`font-display text-5xl uppercase leading-none tabular-nums ${valueClass}`}>
          {value}
        </div>
        {helper ? (
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            {helper}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
