import svgSrc from './assets/sprite.svg';
import type { Icon as IconType } from '../../types';

interface IProps {
  icon: IconType;
  size?: number;
  className?: string;
  color?: 'grey' | 'white';
}

const colorMapper = {
  grey: '#898989',
  white: '#fff',
};

export const Icon = ({ icon, size = 24, className, color = 'grey' }: IProps) => {
  const fillColor = colorMapper[color];

  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={{ 
        display: 'inline-block', 
        lineHeight: 0,
        color: fillColor
      }}
    >
      <use xlinkHref={`${svgSrc}#${icon}`} />
    </svg>
  );
};
