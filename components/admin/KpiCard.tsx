import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'danger';
};

export function KpiCard({ label, value, helper, tone = 'default' }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={
            'text-3xl font-semibold ' +
            (tone === 'danger' ? 'text-red-600' : '')
          }
        >
          {value}
        </div>
        {helper ? (
          <p className="text-xs text-muted-foreground mt-1">{helper}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
