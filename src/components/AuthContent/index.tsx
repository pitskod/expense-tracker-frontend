import React, { memo } from 'react';

interface AuthContentProps {
    children: React.ReactNode;
}

export const AuthContent = memo(({ children }: AuthContentProps) => {
    return (
        <div className="auth-content-panel">
            {children}
        </div>
    );
});

AuthContent.displayName = 'AuthContent';

export default AuthContent;