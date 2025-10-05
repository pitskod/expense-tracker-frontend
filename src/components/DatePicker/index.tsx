import { memo } from 'react';
import type { FC } from 'react';
import type { InputProps } from '../Input';
import { Input } from '../Input';

interface IProps extends InputProps {
  value?: string;
}

export const DatePicker: FC<IProps> = memo((props) => {
  return <Input type="date" {...props} />;
});
