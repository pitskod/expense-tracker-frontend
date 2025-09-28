import styles from './index.module.css';

interface InputProps {
  label: string;
  value?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const Input = ({ 
  label, 
  value, 
  placeholder, 
  type = 'text', 
  onChange, 
  disabled 
}: InputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        disabled={disabled}
        className={styles.input}
      />
    </div>
  );
};