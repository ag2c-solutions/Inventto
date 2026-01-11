import { type ComponentProps, forwardRef } from 'react';
import { usePermission } from '../../hooks/use-permissions';
import { Button } from '@/app/components/ui/button';
import type { PermissionAction } from '../../types';

interface ActionButtonProps extends ComponentProps<typeof Button> {
  action: PermissionAction;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ action, children, ...props }, ref) => {
    const { can, isLoading } = usePermission();
    
    if (isLoading || !can(action)) {
      return null;
    }

    return (
      <Button ref={ref} {...props}>
        {children}
      </Button>
    );
  }
);

ActionButton.displayName = 'ActionButton';