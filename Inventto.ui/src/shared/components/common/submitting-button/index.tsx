import { Loader2, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/shared/components/ui/button';

interface SubmittingButtonProps extends ComponentProps<typeof Button> {
  label?: string;
  loadingLabel?: string;
  Icon?: LucideIcon;
  showLabel?: boolean;
  state: boolean;
  onClick?: () => void;
}

export const SubmittingButton = ({
  label,
  loadingLabel,
  state,
  showLabel = true,
  Icon,
  ...props
}: SubmittingButtonProps) => {
  return state ? (
    <Button type="submit" disabled {...props}>
      <Loader2 className="mr-0.5 h-3 w-3 animate-spin" />
      {showLabel ? (loadingLabel ?? label) : null}
    </Button>
  ) : (
    <Button type="submit" {...props}>
      {Icon && <Icon />}
      {label}
    </Button>
  );
};
