import { render, screen } from '@testing-library/react';
import { AuthContent } from '@/components';

describe('AuthContent', () => {
  it('wraps children in auth-content-panel container', () => {
    const { container } = render(
      <AuthContent>
        <div>Inner</div>
      </AuthContent>,
    );

    expect(screen.getByText('Inner')).toBeInTheDocument();
    const wrapper = container.querySelector('.auth-content-panel');
    expect(wrapper).not.toBeNull();
  });
});


