import { AlertTriangle, LockKeyhole } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

interface GlobalStateScreenProps {
  icon: 'lock' | 'alert';
  title: string;
  text: string;
  cta: string;
  onAction: () => void;
}

export function GlobalStateScreen({
  icon,
  title,
  text,
  cta,
  onAction
}: GlobalStateScreenProps) {
  const Icon = icon === 'lock' ? LockKeyhole : AlertTriangle;

  return (
    <div className="h-full grid place-items-center p-6">
      <div className="w-full max-w-[340px]">
        <div className="border border-border rounded-lg py-[22px] px-5 text-center bg-[#f6f5f1]">
          <div className="size-[46px] rounded-full border border-border bg-background grid place-items-center mx-auto mb-3.5">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <p className="text-base font-bold mb-1.5">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {text}
          </p>
        </div>

        <div className="mt-4">
          <Button variant="outline" className="w-full" onClick={onAction}>
            {cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
