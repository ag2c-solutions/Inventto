import { cn } from '@/shared/utils';

export function SummaryItem({
  label,
  value,
  mono
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-sm', mono && 'font-mono')}>{value}</p>
    </div>
  );
}
