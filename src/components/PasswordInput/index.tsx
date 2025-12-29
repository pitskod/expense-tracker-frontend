import React, { memo, useCallback, useMemo } from 'react';
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

export const PasswordInput = memo(({
  placeholder,
  onChange,
  onBlur,
  error,
  helperText,
  disabled,
  defaultValue,
  value
}: PasswordInputProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  }, [onChange]);

  const hasValue = useMemo(() => 
    (value !== undefined && value !== '') || (defaultValue !== undefined && defaultValue !== ''),
    [value, defaultValue]
  );

  const className = useMemo(() => 
    `${styles.input} ${error ? styles.inputError : ''} ${hasValue ? styles.inputHasValue : ''}`,
    [error, hasValue]
  );

  return (
    <div className={styles.inputGroup}>
      <input
        type="password"
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={className}
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
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
