import styles from './index.module.css';

export interface InputProps {
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  error?: boolean;
  helperText?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const Input = ({
  defaultValue,
  placeholder,
  type = 'text',
  error,
  helperText,
  onChange,
  disabled
}: InputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={styles.inputGroup}>
      <input
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