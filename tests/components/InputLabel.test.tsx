import { render, screen } from '@testing-library/react';
import { InputLabel } from '@/components';

describe('InputLabel', () => {
  it('renders label and forwards htmlFor', () => {
    render(<InputLabel htmlFor="email">Email</InputLabel>);
    const label = screen.getByText('Email');
    expect(label.tagName.toLowerCase()).toBe('label');
    expect(label).toHaveAttribute('for', 'email');
  });
});


