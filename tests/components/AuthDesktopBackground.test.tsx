import { render, screen } from '@testing-library/react';
import { AuthDesktopBackground } from '@/components';

describe('AuthDesktopBackground', () => {
  it('renders the desktop left panel with logo and illustration', () => {
    const { container } = render(<AuthDesktopBackground />);
    expect(container.querySelector('.desktop-left-panel')).not.toBeNull();

    expect(screen.getByAltText(/yaet - yet another expense tracker/i)).toBeInTheDocument();
    expect(screen.getByAltText(/yaet logo/i)).toBeInTheDocument();
  });
});


