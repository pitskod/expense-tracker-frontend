import React, { memo } from 'react';
import styles from './index.module.css';

interface InputLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

export const InputLabel = memo(({ children, htmlFor }: InputLabelProps) => {
  return (
    <label className={styles.label} htmlFor={htmlFor}>
      {children}
    </label>
  );
});

InputLabel.displayName = 'InputLabel';