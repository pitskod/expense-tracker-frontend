import svgSrc from './assets/sprite.svg';
import type { Icon as IconType } from '../../types';

interface IProps {
  icon: IconType;
  size?: number;
  className?: string;
}

export const Icon = ({ icon, size = 24, className }: IProps) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', lineHeight: 0 }}
    >
      <use xlinkHref={`${svgSrc}#${icon}`} />
    </svg>
  );
};
