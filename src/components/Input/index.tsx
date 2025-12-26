import styles from './index.module.css';

export interface InputProps {
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  error?: boolean;
  helperText?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export const Input = ({
  defaultValue,
  value,
  placeholder,
  type = 'text',
  error,
  helperText,
  onChange,
  onBlur,
  disabled
}: InputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const hasValue = (value !== undefined && value !== '') || (defaultValue !== undefined && defaultValue !== '');

  return (
    <div className={styles.inputGroup}>
      <input
        type={type}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`${styles.input} ${error ? styles.inputError : ''} ${hasValue ? styles.inputHasValue : ''}`}
      />
      {helperText && (
        <div className={error ? styles.error : styles.helperText}>
          {helperText}
        </div>
      )}
    </div>
  );
};