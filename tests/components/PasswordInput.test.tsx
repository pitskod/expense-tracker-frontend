import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '@/components';

describe('PasswordInput', () => {
  it('renders a password field and calls onChange with string value', () => {
    const onChange = vi.fn();
    render(<PasswordInput placeholder="Password" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');

    fireEvent.change(input, { target: { value: 'secret123' } });
    expect(onChange).toHaveBeenCalledWith('secret123');
  });

  it('shows helper text and error state', () => {
    render(<PasswordInput placeholder="Password" error helperText="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('supports disabled', () => {
    render(<PasswordInput placeholder="Password" disabled />);
    expect(screen.getByPlaceholderText('Password')).toBeDisabled();
  });
});


