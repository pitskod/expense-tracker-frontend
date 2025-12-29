import React, { memo } from 'react';
import styles from './index.module.css';

export const Loader = memo(() => {
  return (
    <div className={styles.spinner}></div>
  );
});

Loader.displayName = 'Loader';