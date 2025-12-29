import React, { memo, useMemo } from 'react';
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
} as const;

export const Icon = memo(({ icon, size = 24, className, color = 'grey' }: IProps) => {
  const fillColor = colorMapper[color];
  const xlinkHref = useMemo(() => `${svgSrc}#${icon}`, [icon]);
  const style = useMemo(() => ({ 
    display: 'inline-block' as const, 
    lineHeight: 0,
    color: fillColor
  }), [fillColor]);

  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <use xlinkHref={xlinkHref} />
    </svg>
  );
});

Icon.displayName = 'Icon';
