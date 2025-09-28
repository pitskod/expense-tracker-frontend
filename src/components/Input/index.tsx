import styles from './index.module.css';
import { InputLabel } from '../InputLabel';

interface InputProps {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: boolean;
  helperText?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export const Input = ({ 
  label, 
  defaultValue, 
  placeholder, 
  type = 'text', 
  error,
  helperText,
  onChange, 
  disabled,
  id 
}: InputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={styles.inputGroup}>
      <InputLabel htmlFor={inputId}>
        {label}
      </InputLabel>
      <input
        id={inputId}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        className={styles.input}
      />
      {helperText && (
        <div className={error ? styles.error : styles.helperText}>
          {helperText}
        </div>
      )}
    </div>
  );
};