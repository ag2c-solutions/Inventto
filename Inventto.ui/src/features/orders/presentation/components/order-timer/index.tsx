import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

import { getCountdown } from './utils';

interface OrderTimerProps {
  expiresAt: Date;
}

// RF035: countdown de expiração — só aparece no Pool. Atualiza a cada
// segundo; fica urgente (vermelho) com menos de 3 minutos restantes.
export function OrderTimer({ expiresAt }: OrderTimerProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { label, urgent } = getCountdown(expiresAt, now);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
        urgent
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-amber-300 bg-amber-100 text-amber-800'
      }`}
    >
      <Clock className="size-3" />
      {label}
    </span>
  );
}
