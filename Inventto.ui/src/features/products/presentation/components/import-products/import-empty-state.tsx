import type { LucideIcon } from 'lucide-react';

interface ImportEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ImportEmptyState({
  icon: Icon,
  title,
  description
}: ImportEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <p className="max-w-md text-base font-semibold text-foreground">
        {title}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
