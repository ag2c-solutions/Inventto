import { cn } from '@/shared/utils';

import InventtoIcon from '@/assets/icon.svg';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'compact';
}

export const Logo = ({
  className,
  showText = true,
  variant = 'default'
}: LogoProps) => {
  if (variant === 'compact') {
    return (
      <figure className={cn('flex items-center gap-2', className)}>
        <img
          src={InventtoIcon}
          alt="Inventto Logo"
          className="h-7 w-7 shrink-0"
        />
        {showText && (
          <figcaption className="text-green-950 text-base font-bold leading-none font-philosopher">
            Inventto
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure
      className={cn(
        'relative flex py-2 gap-1 items-center overflow-hidden',
        className
      )}
    >
      <img src={InventtoIcon} alt="Inventto Logo" className="absolute "></img>

      {showText && (
        <figcaption className="pl-10 pt-1.5 text-green-950 text-3xl font-bold leading-none font-philosopher">
          Inventto
        </figcaption>
      )}
    </figure>
  );
};
