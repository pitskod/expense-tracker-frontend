import { render } from '@testing-library/react';
import { Icon } from '@/components';

describe('Icon', () => {
  it('renders svg <use> referencing the sprite id', () => {
    const { container } = render(<Icon icon="mobile" size={30} color="white" />);
    const useEl = container.querySelector('use');
    expect(useEl).not.toBeNull();

    const href =
      useEl?.getAttribute('xlink:href') ||
      useEl?.getAttribute('href') ||
      '';

    expect(href).toContain('#mobile');
  });
});


