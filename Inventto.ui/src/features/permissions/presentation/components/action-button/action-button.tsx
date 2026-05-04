import { type ComponentProps, forwardRef } from 'react';

import { Button } from '@/shared/components/ui/button';

import { usePermission } from '../../hooks/use-permissions';
import type { PermissionAction } from '../../../domain/entities/permission-action';

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
