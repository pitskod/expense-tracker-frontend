import { FC, memo } from 'react';
import type { InputProps } from '../Input';
import { Input } from '../Input';

interface IProps extends InputProps {}

export const DatePicker: FC<IProps> = memo((props) => {
  return <Input type="date" defaultValue={props.value} {...props} />;
});
