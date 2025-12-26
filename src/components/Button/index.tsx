import React from 'react';
import styles from './index.module.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({ children, onClick, disabled, type = 'button' }: ButtonProps) => {
  return (
    <button 
      type={type}
      className={styles.button} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};
