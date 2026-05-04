import { cn } from '@/shared/utils';

import InventtoIcon from '@/assets/icon.svg';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <figure
      className={cn(
        'relative flex py-2 gap-1 items-center overflow-hidden',
        className
      )}
    >
      <img src={InventtoIcon} alt="Inventto Logo" className="absolute "></img>

      {showText && (
        <figcaption className="pl-10 pt-1.5 text-green-950 text-2xl font-bold leading-none font-philosopher">
          Inventto
        </figcaption>
      )}
    </figure>
  );
};
