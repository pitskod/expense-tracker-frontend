import styles from './index.module.css';

interface InputLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

export const InputLabel = ({ children, htmlFor }: InputLabelProps) => {
  return (
    <label className={styles.label} htmlFor={htmlFor}>
      {children}
    </label>
  );
};