import { render } from '@testing-library/react';
import { Loader } from '@/components';

describe('Loader', () => {
  it('renders a spinner element', () => {
    const { container } = render(<Loader />);
    const el = container.firstElementChild;
    expect(el).not.toBeNull();
    expect(el?.tagName.toLowerCase()).toBe('div');
    // CSS modules give a non-empty className
    expect(el?.className).toBeTruthy();
  });
});


