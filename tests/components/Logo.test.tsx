import { render, screen } from '@testing-library/react';
import { Logo } from '@/components';

describe('Logo', () => {
  it('renders an image', () => {
    render(<Logo />);
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    const src = img.getAttribute('src') || '';
    expect(src).toBeTruthy();
    // Vite may inline SVGs as data URLs in tests/build.
    expect(src.includes('logo.svg') || src.startsWith('data:image/svg+xml')).toBe(true);
  });
});


