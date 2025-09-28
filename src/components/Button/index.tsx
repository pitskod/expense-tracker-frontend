
import styles from './index.module.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button = ({ children, onClick, disabled }: ButtonProps) => {
  return (
    <button 
      className={styles.button} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};