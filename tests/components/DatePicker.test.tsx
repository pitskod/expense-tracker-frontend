import { render, screen } from '@testing-library/react';
import { DatePicker } from '@/components';

describe('DatePicker', () => {
  it('renders an input of type=date', () => {
    render(<DatePicker placeholder="Pick date" />);
    const input = screen.getByPlaceholderText('Pick date') as HTMLInputElement;
    expect(input.type).toBe('date');
  });
});


