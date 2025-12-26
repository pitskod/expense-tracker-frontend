import React from 'react';
import styles from './index.module.css';

export interface PasswordInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder,
  onChange,
  onBlur,
  error,
  helperText,
  disabled,
  defaultValue,
  value
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const hasValue = (value !== undefined && value !== '') || (defaultValue !== undefined && defaultValue !== '');

  return (
    <div className={styles.inputGroup}>
      <input
        type="password"
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`${styles.input} ${error ? styles.inputError : ''} ${hasValue ? styles.inputHasValue : ''}`}
        defaultValue={defaultValue}
        value={value}
      />
      {helperText && (
        <div className={error ? styles.error : styles.helperText}>
          {helperText}
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
