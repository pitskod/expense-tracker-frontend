import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components';

describe('Input', () => {
  it('renders placeholder and calls onChange with string value', () => {
    const onChange = vi.fn();
    render(<Input placeholder="Email" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'a@b.com' } });

    expect(onChange).toHaveBeenCalledWith('a@b.com');
  });

  it('shows helper text and error state', () => {
    render(<Input placeholder="Email" error helperText="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('supports disabled', () => {
    render(<Input placeholder="Email" disabled />);
    expect(screen.getByPlaceholderText('Email')).toBeDisabled();
  });
});


